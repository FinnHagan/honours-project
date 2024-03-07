# solarApp/urls.py
from django.urls import path
from .views import SubmissionView
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse
from django.middleware.csrf import get_token

@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({"csrfToken": get_token(request)})

urlpatterns = [
    path('submission/', SubmissionView.as_view(), name='submission'),
    path('get-csrf-token/', get_csrf_token, name='get-csrf-token'), 
]