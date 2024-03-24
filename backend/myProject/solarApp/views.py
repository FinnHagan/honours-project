from rest_framework import generics
from .models import Submission
from .serializers import SubmissionSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
import requests
import os
import pvlib
from pvlib.modelchain import ModelChain
from pvlib.pvsystem import PVSystem
from pvlib.location import Location
from pvlib.temperature import TEMPERATURE_MODEL_PARAMETERS
import pvlib.irradiance
import pandas as pd
from datetime import datetime
import pytz
from .models import Appliance


def get_lat_lon_from_post_code(post_code):
    geocoding_api_key = os.environ.get('OPENWEATHERMAP_API_KEY')
    geocoding_api_url = f"http://api.openweathermap.org/geo/1.0/zip?zip={post_code}&appid={geocoding_api_key}"
    geocoding_response = requests.get(geocoding_api_url)
    if geocoding_response.status_code == 200:
        geocoding_data = geocoding_response.json()
        return geocoding_data.get('lat'), geocoding_data.get('lon')
    else:
        print(f"Geocoding API Error: {geocoding_response.text}")
        return None, None


def fetch_weather_data(lat, lon):
    weather_api_key = os.environ.get('OPENWEATHERMAP_API_KEY')
    weather_api_url = f"https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&exclude=hourly,daily,alerts&appid={weather_api_key}"
    weather_response = requests.get(weather_api_url)
    if weather_response.status_code == 200:
        weather_data = weather_response.json()
        return {
            "temperature": float(weather_data['current']['temp']) - 273.15,  # Convert from Kelvin to Celsius
            "cloud_cover": str(weather_data['current']['clouds']),
            "wind_speed": weather_data['current']['wind_speed'],
            "wind_direction": weather_data['current']['wind_deg'],
            "humidity": weather_data['current']['humidity'],
            "precipitation": weather_data['current'].get('rain', {'1h': 0.0})['1h'] + weather_data['current'].get('snow', {'1h': 0.0})['1h'],  # Sum rain and snow
        }
    else:
        return {"error": "Error fetching weather data", "status": weather_response.status_code}


def fetch_solar_data(lat, lon, panel_orientation, panel_tilt, date):
    url = f"https://re.jrc.ec.europa.eu/api/DRcalc?lat={lat}&lon={lon}&month={date.month}&global=1&outputformat=json"
    solar_response = requests.get(url)
    if solar_response.status_code == 200:
        solar_data = solar_response.json()
        daily_profile = solar_data['outputs']['daily_profile']
        ghi = [hour['G(i)'] for hour in daily_profile]
        dni = [hour['Gb(i)'] for hour in daily_profile]
        dhi = [hour['Gd(i)'] for hour in daily_profile]
        return ghi, dni, dhi
    else:
        raise Exception(f"Error fetching solar data: {solar_response.status_code}")


class WeatherDataView(APIView):
    def post(self, request):
        post_code = request.data.get('post_code')
        lat, lon = get_lat_lon_from_post_code(post_code)
        if lat is None or lon is None:
            return Response({"error": "Failed to fetch latitude and longitude"}, status=400)
        weather_data = fetch_weather_data(lat, lon)
        if "error" in weather_data:
            return Response(weather_data, status=weather_data["status"])
        return Response(weather_data)


class SolarDataView(APIView):
    def post(self, request):
        post_code = request.data.get('post_code')
        datetime_str = request.data.get('date')
        panel_orientation = float(request.data.get('panel_orientation'))
        panel_tilt = float(request.data.get('panel_tilt'))
        number_of_solar_panels = int(request.data.get('number_of_solar_panels'))
        washing_machine_selected = request.data.get('washing_machine_selected')
        tumble_dryer_selected = request.data.get('tumble_dryer_selected')

        # Convert datetime string to actual datetime
        input_date = datetime.strptime(datetime_str, '%Y-%m-%dT%H:%M')
        input_date = input_date.replace(hour=0, minute=0)
        utc_date = pytz.utc.localize(input_date)

        # Fetch latitude and longitude from post code
        lat, lon = get_lat_lon_from_post_code(post_code)
        if lat is None or lon is None:
            return Response({"error": "Failed to fetch latitude and longitude"}, status=400)

        # Fetch solar data
        try:
            ghi, dni, dhi = fetch_solar_data(lat, lon, panel_orientation, panel_tilt, utc_date)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

        location = pvlib.location.Location(lat, lon, tz='UTC')
        times = pd.date_range(start=input_date, periods=24, freq='1h', tz='UTC')
        solar_position = location.get_solarposition(times=utc_date)

        # Create a DataFrame for weather data
        weather = pd.DataFrame({'ghi': ghi, 'dni': dni, 'dhi': dhi}, index=times)

        # Initialize PV system and ModelChain
        module_parameters = {'pdc0': 250, 'gamma_pdc': -0.004}
        inverter_parameters = {'pdc0': 250, 'eta_inv_nom': 0.96}
        temperature_model_parameters = TEMPERATURE_MODEL_PARAMETERS['sapm']['open_rack_glass_glass']
        system = PVSystem(surface_tilt=panel_tilt, surface_azimuth=panel_orientation,
                          module_parameters=module_parameters,
                          inverter_parameters=inverter_parameters,
                          temperature_model_parameters=temperature_model_parameters)

        location = Location(lat, lon, tz='UTC')
        mc = ModelChain(system, location, aoi_model='no_loss', spectral_model='no_loss',)

        # Run model
        mc.run_model(weather)
        # Calculate AC power output
        ac_power = mc.results.ac * number_of_solar_panels

        optimal_hour = ac_power.idxmax()

        optimal_usage = {}
        if washing_machine_selected:
            wm_data = self.get_appliance_data('washing_machine')
            wm_optimal_time = self.calculate_optimal_time(ac_power, wm_data)
            if wm_optimal_time:
                optimal_usage['washing_machine'] = wm_optimal_time

        if tumble_dryer_selected:
            td_data = self.get_appliance_data('tumble_dryer')
            td_optimal_time = self.calculate_optimal_time(ac_power, td_data)
            if td_optimal_time:
                optimal_usage['tumble_dryer'] = td_optimal_time

        return Response({
            "solar_altitude": solar_position['apparent_elevation'].iloc[0],
            "solar_azimuth": solar_position['azimuth'].iloc[0],
            "daily_solar_output": ac_power.sum(),
            "optimal_time": optimal_hour.strftime('%Y-%m-%d %H:%M'),
            "optimal_power": ac_power.max(),
            "optimal_usage": optimal_usage,
        })

    def get_appliance_data(self, appliance_name):
        appliances = Appliance.objects.filter(name=appliance_name)
        if appliances.exists():
            total_consumption = sum([appliance.total_consumption_wh for appliance in appliances])
            average_consumption = total_consumption / appliances.count()
            return average_consumption
        else:
            print(f"No consumption data found for {appliance_name}")
            return 0

    def calculate_optimal_time(self, ac_power, consumption):
        if consumption > 0:  # Ensure there's a real consumption value
            optimal_hour = ac_power.idxmax()  # Find the hour with the maximum generation
            optimal_hours = [optimal_hour.strftime('%Y-%m-%d %H:%M')]
        else:
            optimal_hours = []

        return optimal_hours


class WashingMachineView(APIView):

    def get(self, request):
        washing_machine_data = list(Appliance.objects.filter(name="washing_machine").values('day_of_week', 'total_consumption_wh'))
        data = {
            "wm_average_consumption_per_day": washing_machine_data,
            "wm_highest_consumption_day": max(washing_machine_data, key=lambda x: x['total_consumption_wh']),
            "wm_lowest_consumption_day": min(washing_machine_data, key=lambda x: x['total_consumption_wh'])
        }
        return Response(data)


class TumbleDryerView(APIView):

    def get(self, request):
        tumble_dryer_data = list(Appliance.objects.filter(name="tumble_dryer").values('day_of_week', 'total_consumption_wh'))
        data = {
            "td_average_consumption_per_day": tumble_dryer_data,
            "td_highest_consumption_day": max(tumble_dryer_data, key=lambda x: x['total_consumption_wh']),
            "td_lowest_consumption_day": min(tumble_dryer_data, key=lambda x: x['total_consumption_wh'])
        }
        return Response(data)


class SubmissionView(generics.CreateAPIView):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer

    def perform_create(self, serializer):
        print("Received submission data: ", self.request.data)
        print("Optimal usage in received data: ", self.request.data.get('optimal_usage', 'Not found'))
        super().perform_create(serializer)
        temperature = self.request.data.get('temperature')
        cloud_cover = self.request.data.get('cloud_cover')
        wind_speed = self.request.data.get('wind_speed')
        wind_direction = self.request.data.get('wind_direction')
        humidity = self.request.data.get('humidity')
        precipitation = self.request.data.get('precipitation')
        # Extract solar data from nested structure
        solar_data = self.request.data.get('solar', {})
        solar_altitude = solar_data.get('solar_altitude')
        solar_azimuth = solar_data.get('solar_azimuth')

        if isinstance(solar_altitude, list):
            solar_altitude = solar_altitude[0] if solar_altitude else None
        if isinstance(solar_azimuth, list):
            solar_azimuth = solar_azimuth[0] if solar_azimuth else None

        daily_solar_output = solar_data.get('daily_solar_output')
        optimal_time = solar_data.get('optimal_time')
        optimal_power = solar_data.get('optimal_power')
        optimal_usage = solar_data.get('optimal_usage')

        serializer.save(
            temperature=temperature,
            cloud_cover=cloud_cover,
            wind_speed=wind_speed,
            wind_direction=wind_direction,
            humidity=humidity,
            precipitation=precipitation,
            solar_altitude=solar_altitude,
            solar_azimuth=solar_azimuth,
            daily_solar_output=daily_solar_output,
            optimal_time=optimal_time,
            optimal_power=optimal_power,
            optimal_usage=optimal_usage,
        )
