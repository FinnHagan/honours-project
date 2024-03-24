from rest_framework import serializers
from .models import Submission, Appliance


class SubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = '__all__'


class ApplianceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appliance
        fields = '__all__'
