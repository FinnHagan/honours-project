from rest_framework import generics
from . models import *
from . serializer import *

# Create your views here.
class ReactView(generics.ListCreateAPIView):
    queryset = React.objects.all()
    serializer_class = ReactSerializer