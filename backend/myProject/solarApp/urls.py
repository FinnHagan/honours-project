from django.urls import path
from .views import SubmissionView

urlpatterns = [
    path('', SubmissionView.as_view(), name='submission'),
]
