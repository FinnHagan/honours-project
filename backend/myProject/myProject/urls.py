from django.contrib import admin
from django.urls import path
from solarApp.views import SubmissionView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', SubmissionView.as_view(), name='submission'),
]
