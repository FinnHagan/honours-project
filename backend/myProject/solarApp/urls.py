from django.urls import path
from .views import SubmissionView, WeatherDataView, SolarDataView, SubmissionChartDataView, CreateUserView
from dj_rest_auth.views import LoginView

urlpatterns = [
    path('submission/', SubmissionView.as_view(), name='submission'),
    path('weatherdata/', WeatherDataView.as_view(), name='weatherdata'),
    path('solardata/', SolarDataView.as_view(), name='solardata'),
    path('submission_chart_data/<int:pk>/', SubmissionChartDataView.as_view(), name='submission_chart_data'),
    path('register/', CreateUserView.as_view(), name='createaccount'),
    path('login/', LoginView.as_view(), name='login'),
]
