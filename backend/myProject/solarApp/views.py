from rest_framework import generics
from .models import Submission
from .serializers import SubmissionSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
import requests
import os


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
                print("Weather Response Data:", weather_data)
                temperature = float(weather_data['current']['temp'])
                cloud_cover = str(weather_data['current']['clouds'])
                print("Extracted temperature before perform_create:", temperature)
                print("Extracted cloud cover before perform_create:", cloud_cover)

                return Response({
                    "temperature": temperature,
                    "cloud_cover": cloud_cover,
                })
            else:
                return Response({"error": "Error fetching weather data"}, status=500)

        else:
            return Response({"error": f"Geocoding API error: {geocoding_response.status_code}"}, status=geocoding_response.status_code)


class SubmissionView(generics.CreateAPIView):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer

    def perform_create(self, serializer):
        print("Submission Data:", self.request.data)
        temperature = self.request.data.get('temperature')
        cloud_cover = self.request.data.get('cloud_cover') 
        print("Extracted temperature:", temperature) 
        print("Extracted cloud cover:", cloud_cover) 
        serializer.save(
            temperature=temperature,
            cloud_cover=cloud_cover
        )