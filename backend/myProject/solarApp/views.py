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

class WeatherDataView(APIView):
    def post(self, request):
        post_code = request.data.get('post_code')

        geocoding_api_url = f"http://api.openweathermap.org/geo/1.0/zip?zip={post_code}&appid={os.environ.get('OPENWEATHERMAP_API_KEY')}"
        geocoding_response = requests.get(geocoding_api_url)

        if geocoding_response.status_code == 200:
            geocoding_data = geocoding_response.json()

            if isinstance(geocoding_data, dict):
                lat = geocoding_data['lat'] 
                lon = geocoding_data['lon'] 
            else:
                lat = geocoding_data[0]['lat'] 
                lon = geocoding_data[0]['lon'] 

            weather_api_url = f"https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&exclude=hourly,daily,alerts&appid={os.environ.get('OPENWEATHERMAP_API_KEY')}"
            weather_response = requests.get(weather_api_url)
            if weather_response.status_code == 200:
                weather_data = weather_response.json()
                print("Weather Data", weather_data)
                temperature = float(weather_data['current']['temp']) - 273.15 # Convert from Kelvin to Celsius
                cloud_cover = str(weather_data['current']['clouds']) + "%" # Show percentage cloud cover
                wind_speed = weather_data['current']['wind_speed']
                wind_direction = weather_data['current']['wind_deg']
                humidity = weather_data['current']['humidity']
                # Add new data extraction with error handling:   
                precipitation = 0.0 
                if 'rain' in weather_data['current']:
                    precipitation += weather_data['current']['rain'].get('1h', 0.0)
                if 'snow' in weather_data['current']:
                    precipitation += weather_data['current']['snow'].get('1h', 0.0)

                return Response({
                    "temperature": temperature,
                    "cloud_cover": cloud_cover,
                    "wind_speed": wind_speed,
                    "wind_direction": wind_direction,
                    "humidity": humidity,
                    "precipitation": precipitation
                })
            else:
                return Response({"error": "Error fetching weather data"}, status=500)

        else:
            return Response({"error": f"Geocoding API error: {geocoding_response.status_code}"}, status=geocoding_response.status_code)
        
class SolarDataView(APIView):
    def post(self, request):
        post_code = request.data.get('post_code')
        datetime_str = request.data.get('date')  # Date comes from frontend as "xxxx-xx-xxTxx:xx"

        naive_datetime_obj = datetime.strptime(datetime_str, '%Y-%m-%dT%H:%M')

        utc_datetime_obj = pytz.utc.localize(naive_datetime_obj)

        # Convert the datetime object to a panda timestamp as requiref for pvlib
        timestamp = pd.Timestamp(utc_datetime_obj)

        geocoding_api_url = f"http://api.openweathermap.org/geo/1.0/zip?zip={post_code}&appid={os.environ.get('OPENWEATHERMAP_API_KEY')}"
        geocoding_response = requests.get(geocoding_api_url)

        if geocoding_response.status_code == 200:
            geocoding_data = geocoding_response.json()
            lat = geocoding_data['lat']
            lon = geocoding_data['lon']

            location = pvlib.location.Location(lat, lon, tz='UTC')
            solar_position = location.get_solarposition(times=timestamp)

            solar_altitude = solar_position['apparent_elevation']
            solar_azimuth = solar_position['azimuth']

            return Response({
                "solar_altitude": solar_altitude,
                "solar_azimuth": solar_azimuth
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

        serializer.save(
            temperature=temperature,
            cloud_cover=cloud_cover,
            wind_speed=wind_speed,
            wind_direction=wind_direction,
            humidity=humidity,
            precipitation=precipitation,
            solar_altitude=solar_altitude,
            solar_azimuth=solar_azimuth,
        )