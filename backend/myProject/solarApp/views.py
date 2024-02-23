from rest_framework import generics
from . models import *
from .serializers import *

# Create your views here.
class SubmissionView(generics.ListCreateAPIView):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer