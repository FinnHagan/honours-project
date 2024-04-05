from rest_framework import generics
from .models import Submission, ApplianceConsumption
from .serializers import SubmissionSerializer, ChartDataSerializer, UserProfileSerializer
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
from django.db.models import Sum
from rest_framework import status
from .serializers import UserSerializer
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated


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
        try:
            post_code = request.data.get('post_code')
            datetime_str = request.data.get('date')
            panel_orientation = float(request.data.get('panel_orientation'))
            panel_tilt = float(request.data.get('panel_tilt'))
            number_of_solar_panels = int(request.data.get('number_of_solar_panels'))
            washing_machine_selected = request.data.get('washing_machine_selected')
            tumble_dryer_selected = request.data.get('tumble_dryer_selected')
            wm_optimal_usage = request.data.get('wm_optimal_usage')
            td_optimal_usage = request.data.get('td_optimal_usage')
            hourly_solar_production = request.data.get('hourly_solar_production')

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

            mc.run_model(weather)
            ac_power = mc.results.ac * number_of_solar_panels
            ac_power_df = pd.DataFrame({'production': ac_power.values}, index=times)
            ac_power_df['hour'] = ac_power_df.index.hour
            
            optimal_hour = ac_power.idxmax()

            # Fetch appliance consumption data
            if washing_machine_selected:
                wm_data = list(ApplianceConsumption.objects.filter(appliance_name="washing_machine").order_by('sequence').values('sequence', 'consumption'))
            else:
                wm_data = []

            if tumble_dryer_selected:
                td_data = list(ApplianceConsumption.objects.filter(appliance_name="tumble_dryer").order_by('sequence').values('sequence', 'consumption'))
            else:
                td_data = []

            optimal_periods = self.calculate_optimal_periods(ac_power_df, wm_data, td_data)

            # Update wm_optimal_usage and td_optimal_usage with actual computed values
            wm_optimal_usage = optimal_periods.get('washing_machine')
            td_optimal_usage = optimal_periods.get('tumble_dryer')

            # Prepare hourly solar production for response
            hourly_solar_production = [{"hour": hour.strftime('%H:%M'), "production": production}
                                    for hour, production in ac_power.items()]
            
            # Fetch and prepare appliance consumption data for response
            appliance_consumption = ApplianceConsumption.objects.filter(
                appliance_name__in=["washing_machine", "tumble_dryer"]
            ).order_by('sequence').values('appliance_name', 'sequence', 'consumption')

            appliance_consumption_list = [{
                "appliance_name": ac["appliance_name"],
                "sequence": ac["sequence"],
                "consumption": ac["consumption"]
            } for ac in appliance_consumption]

            return Response({
                "solar_altitude": solar_position['apparent_elevation'].iloc[0],
                "solar_azimuth": solar_position['azimuth'].iloc[0],
                "daily_solar_output": ac_power.sum(),
                "optimal_time": optimal_hour.strftime('%Y-%m-%d %H:%M'),
                "optimal_power": ac_power.max(),
                "wm_optimal_usage": wm_optimal_usage,
                "td_optimal_usage": td_optimal_usage,
                "hourly_solar_production": hourly_solar_production,
                "appliance_consumption": appliance_consumption_list
            })
        
        except Exception as e:
            # Log the exception and return a generic error response
            print(f"Error in SolarDataView: {str(e)}")
            return Response({"error": "An unexpected error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def calculate_optimal_periods(self, ac_power_df, wm_data, td_data):
        optimal_start_times = {'washing_machine': None, 'tumble_dryer': None}
        
        # Determine WM's optimal start time
        if wm_data:
            wm_optimal_start = self.find_optimal_start_time(ac_power_df, wm_data)
            if wm_optimal_start:
                optimal_start_times['washing_machine'] = wm_optimal_start
                # Adjust ac_power_df for WM consumption
                ac_power_df_adjusted = self.adjust_power_for_appliance(ac_power_df, wm_data, wm_optimal_start)
            else:
                ac_power_df_adjusted = ac_power_df.copy()
        else:
            ac_power_df_adjusted = ac_power_df.copy()

        # For TD, ensure start time consideration begins after WM cycle ends
        if td_data and wm_optimal_start:
            # Calculate the end of WM's cycle to start considering TD's optimal start
            wm_end_time = pd.to_datetime(wm_optimal_start, utc=True) + pd.Timedelta(minutes=len(wm_data) * 10)
            td_optimal_start = self.find_optimal_start_time(ac_power_df_adjusted[wm_end_time:], td_data)
            if td_optimal_start:
                optimal_start_times['tumble_dryer'] = td_optimal_start

        return optimal_start_times


    def find_optimal_start_time(self, ac_power_df, appliance_data):
        optimal_start = None
        max_solar_alignment = -1
        cycle_duration = pd.Timedelta(minutes=len(appliance_data) * 10)  # 130 minutes

        # Iterate through each possible start time in ac_power_df
        for i, start_time in enumerate(ac_power_df.index[:-1]):  # Exclude the last time to ensure a full window
            # Calculate the end time for this potential start
            end_time = start_time + cycle_duration
            # Ensure the end time does not exceed data range
            if end_time > ac_power_df.index[-1]:
                break
            
            # Calculate the sum of solar production for this time window
            solar_sum = ac_power_df.loc[start_time:end_time]['production'].sum()
            
            if solar_sum > max_solar_alignment:
                max_solar_alignment = solar_sum
                optimal_start = start_time

        return optimal_start.strftime('%H:%M') if optimal_start else None



    def adjust_power_for_appliance(self, ac_power_df, appliance_data, start_time_str):
        adjusted_power_df = ac_power_df.copy()
        start_time = pd.to_datetime(start_time_str).tz_localize('UTC')
        cycle_duration_minutes = len(appliance_data) * 10  # 130 minutes for 13 sequences
        
        for i in range(cycle_duration_minutes // 10):  # Data is in 10-minute intervals
            time = start_time + pd.Timedelta(minutes=i*10)
            if time not in adjusted_power_df.index:
                continue
            # Uniform consumption for simplicity; will adjust based on actual data if can
            adjusted_power_df.loc[time, 'production'] -= sum([d['consumption'] for d in appliance_data]) / len(appliance_data)
        
        return adjusted_power_df


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

        daily_solar_output = solar_data.get('daily_solar_output')
        optimal_time = solar_data.get('optimal_time')
        optimal_power = solar_data.get('optimal_power')
        wm_optimal_usage = solar_data.get('wm_optimal_usage')
        td_optimal_usage = solar_data.get('td_optimal_usage')
        hourly_solar_production = solar_data.get('hourly_solar_production')
        appliance_consumption = solar_data.get('appliance_consumption')

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
            wm_optimal_usage=wm_optimal_usage,
            td_optimal_usage=td_optimal_usage,
            hourly_solar_production=hourly_solar_production,
            appliance_consumption=appliance_consumption,
        )


class SubmissionChartDataView(APIView):
    def get(self, request, pk):
        submission = Submission.objects.get(pk=pk)
        serializer = ChartDataSerializer(submission)
        return Response(serializer.data)


class CreateUserView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, format='json'):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            if user:
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)

        if user is not None:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({"token": token.key}, status=status.HTTP_200_OK)
        else:
            return Response({"non_field_errors": ["Username or password is incorrect."]}, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
