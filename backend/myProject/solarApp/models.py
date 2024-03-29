from django.db import models
from django.utils import timezone


class Submission(models.Model):
    post_code = models.CharField(max_length=10)
    number_of_solar_panels = models.IntegerField(null=True)
    date = models.DateTimeField(default=timezone.now)
    panel_orientation = models.FloatField(max_length=50, null=True)
    panel_tilt = models.FloatField(max_length=50, null=True)
    washing_machine_selected = models.BooleanField(default=False)
    tumble_dryer_selected = models.BooleanField(default=False)
    temperature = models.FloatField(max_length=50, null=True)
    cloud_cover = models.CharField(max_length=50, null=True)
    wind_speed = models.FloatField(max_length=50, null=True)
    wind_direction = models.CharField(max_length=50, null=True)
    humidity = models.FloatField(max_length=50, null=True)
    precipitation = models.CharField(max_length=50, null=True)
    solar_azimuth = models.FloatField(max_length=50, null=True)
    solar_altitude = models.FloatField(max_length=50, null=True)
    daily_solar_output = models.FloatField(max_length=50, null=True)
    optimal_time = models.DateTimeField(default=timezone.now, null=True)
    optimal_power = models.FloatField(max_length=50, null=True)
    wm_optimal_usage = models.JSONField(null=True, blank=True)
    td_optimal_usage = models.JSONField(null=True, blank=True)
    hourly_solar_production = models.JSONField(null=True, blank=True)
    appliance_consumption = models.JSONField(null=True, blank=True)


class ApplianceConsumption(models.Model):
    appliance_name = models.CharField(max_length=255)
    timestamp = models.TimeField()
    consumption = models.FloatField()

    class Meta:
        unique_together = ('appliance_name', 'timestamp',)


    def __str__(self):
        return f"{self.appliance_name} consumption at {self.timestamp}"
