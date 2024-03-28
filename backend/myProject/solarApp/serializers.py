from rest_framework import serializers
from .models import Submission, ApplianceConsumption


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
