from rest_framework import generics
from . models import *
from .serializers import *

class SubmissionView(generics.ListCreateAPIView):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer