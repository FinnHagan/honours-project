# solarApp/urls.py
from django.urls import path
from .views import SubmissionView

urlpatterns = [
    path('submission/', SubmissionView.as_view(), name='submission'),
]