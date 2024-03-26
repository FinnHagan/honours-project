from django.urls import path
from .views import SubmissionView, WeatherDataView, SolarDataView, SubmissionChartDataView

urlpatterns = [
    path('submission/', SubmissionView.as_view(), name='submission'),
    path('weatherdata/', WeatherDataView.as_view(), name='weatherdata'),
    path('solardata/', SolarDataView.as_view(), name='solardata'),
    path('submission_chart_data/<int:pk>/', SubmissionChartDataView.as_view(), name='submission_chart_data'),
    # path('washingmachinedata/', WashingMachineView.as_view(), name='washingmachinedata'),
    # path('tumbledryerdata/', TumbleDryerView.as_view(), name='tumbledryerdata'),
]
