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
from django.http import JsonResponse

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
            "precipitation": weather_data['current'].get('rain', {'1h': 0.0})['1h'] +
                             weather_data['current'].get('snow', {'1h': 0.0})['1h'],  # Sum rain and snow
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

        # Convert datetime string to actual datetime
        input_date = datetime.strptime(datetime_str, '%Y-%m-%dT%H:%M')
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
        times = pd.date_range(start=input_date, periods=1, freq='1h', tz='UTC')
        solar_position = location.get_solarposition(times=utc_date)
        airmass = location.get_airmass(solar_position=solar_position, times=times)
        linke_turbidity = pvlib.clearsky.lookup_linke_turbidity(times, lat, lon)

        # Create a DataFrame for weather data
        times = pd.date_range(start=utc_date, periods=24, freq='h', tz='UTC')
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

        return Response({
            "solar_altitude": solar_position['apparent_elevation'].iloc[0],
            "solar_azimuth": solar_position['azimuth'].iloc[0],
            "solar_irradiance": ac_power.sum()
        })



class SubmissionView(generics.CreateAPIView):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer

    def perform_create(self, serializer):
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

        solar_irradiance = solar_data.get('solar_irradiance')
        serializer.save(
            temperature=temperature,
            cloud_cover=cloud_cover,
            wind_speed=wind_speed,
            wind_direction=wind_direction,
            humidity=humidity,
            precipitation=precipitation,
            solar_altitude=solar_altitude,
            solar_azimuth=solar_azimuth,
            solar_irradiance=solar_irradiance,
        )
