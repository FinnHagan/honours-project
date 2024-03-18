from rest_framework import generics
from .models import Submission
from .serializers import SubmissionSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
import requests
import os
import pvlib
import pandas as pd
from datetime import datetime
import pytz

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

# Usage within your WeatherDataView
class WeatherDataView(APIView):
    def post(self, request):
        post_code = request.data.get('post_code')
        lat, lon = get_lat_lon_from_post_code(post_code)
        print(lat, lon, post_code)
        if lat is None or lon is None:
            return Response({"error": "Failed to fetch latitude and longitude"}, status=400)
        
        weather_data = fetch_weather_data(lat, lon)
        print(weather_data)
        if "error" in weather_data:
            return Response(weather_data, status=weather_data["status"])
        
        return Response(weather_data)


class SolarDataView(APIView):
    def post(self, request):
        post_code = request.data.get('post_code')
        datetime_str = request.data.get('date')
        number_of_solar_panels = int(request.data.get('number_of_solar_panels'))
        panel_orientation = float(request.data.get('panel_orientation'))
        panel_tilt = float(request.data.get('panel_tilt'))

        input_date = datetime.strptime(datetime_str, '%Y-%m-%dT%H:%M')
        utc_date = pytz.utc.localize(input_date)

        lat, lon = get_lat_lon_from_post_code(post_code)
        if lat is None or lon is None:
            return Response({"error": "Failed to fetch latitude and longitude"}, status=400)

        weather_data = fetch_weather_data(lat, lon)
        if "error" in weather_data:
            return Response(weather_data, status=weather_data["status"])

        cloud_cover = float(weather_data["cloud_cover"]) / 100.0

        location = pvlib.location.Location(lat, lon, tz='UTC')
        times = pd.date_range(start=input_date, periods=1, freq='1h', tz='UTC')

        solar_position = location.get_solarposition(times=utc_date)
        airmass = location.get_airmass(solar_position=solar_position, times=times)
        linke_turbidity = pvlib.clearsky.lookup_linke_turbidity(times, lat, lon)
        clearsky = location.get_clearsky(times, model='ineichen', linke_turbidity=linke_turbidity)

        # Incorporate panel orientation and tilt into the calculation
        # Adjust GHI based on panel orientation and tilt using PVLib's functions/own logic
        # Adjust for orientation and tilt sitll needs to be implemented
        # Framework set-up for a more complex model
        adjusted_ghi = clearsky['ghi'] * (1 - cloud_cover) * number_of_solar_panels

        return Response({
            "solar_altitude": solar_position['apparent_elevation'].iloc[0],
            "solar_azimuth": solar_position['azimuth'].iloc[0],
            "solar_irradiance": adjusted_ghi.iloc[0] if not adjusted_ghi.empty else None,
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
