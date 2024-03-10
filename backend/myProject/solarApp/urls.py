# solarApp/urls.py
from django.urls import path
from .views import SubmissionView, WeatherDataView

urlpatterns = [
    path('submission/', SubmissionView.as_view(), name='submission'),
    path('weatherdata/', WeatherDataView.as_view(), name='weatherdata'), 
]
