from rest_framework import generics
from . models import *
from .serializers import *
from django.views import View
from django.http import JsonResponse

class SubmissionView(View):
    def post(self, request):
        serializer = SubmissionSerializer(data=request.POST)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse({'Success': True}) 
        else:
            return JsonResponse({'errors': serializer.errors}, status=400)
