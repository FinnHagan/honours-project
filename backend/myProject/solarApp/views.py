from rest_framework import generics
from . models import *
from .serializers import *

class SubmissionView(generics.CreateAPIView):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer