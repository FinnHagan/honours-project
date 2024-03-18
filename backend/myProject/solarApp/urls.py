from django.urls import path
from .views import SubmissionView, WeatherDataView, SolarDataView

urlpatterns = [
    path('submission/', SubmissionView.as_view(), name='submission'),
    path('weatherdata/', WeatherDataView.as_view(), name='weatherdata'),
    path('solardata/', SolarDataView.as_view(), name='solardata'),
]
