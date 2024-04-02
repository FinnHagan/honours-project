from rest_framework import serializers
from .models import Submission, ApplianceConsumption
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password


class SubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = '__all__'


class ApplianceConsumptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplianceConsumption
        fields = '__all__'


class ChartDataSerializer(serializers.ModelSerializer):
    wm_optimal_usage = serializers.SerializerMethodField()
    td_optimal_usage = serializers.SerializerMethodField()

    class Meta:
        model = Submission
        fields = ['date', 'daily_solar_output', 'optimal_time', 'wm_optimal_usage', 'td_optimal_usage', 'hourly_solar_production', 'appliance_consumption']

    def get_wm_optimal_usage(self, obj):
        # Directly return the field if it's already a list
        return obj.wm_optimal_usage if obj.wm_optimal_usage else []

    def get_td_optimal_usage(self, obj):
        return obj.td_optimal_usage if obj.td_optimal_usage else []

    def get_hourly_solar_production(self, obj):
        return obj.hourly_solar_production if obj.hourly_solar_production else []

    def get_appliance_consumption(self, obj):
        return obj.appliance_consumption if obj.appliance_consumption else []


class UserSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'confirm_password')
        extra_kwargs = {
            'password': {'write_only': True, 'validators': [validate_password]},
            'confirm_password': {'write_only': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('confirm_password'):
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def validate_email(self, value):
        value = User.objects.normalize_email(value)
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            validated_data['username'],
            validated_data['email'],
            validated_data['password']
        )
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')
