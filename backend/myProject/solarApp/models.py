from django.db import models
from django.utils import timezone


class Submission(models.Model):
    post_code = models.CharField(max_length=10)
    number_of_solar_panels = models.IntegerField(null=True)
    date = models.DateTimeField(default=timezone.now)
    panel_orientation = models.FloatField(max_length=50, null=True)
    panel_tilt = models.FloatField(max_length=50, null=True)
    temperature = models.FloatField(max_length=50, null=True)
    cloud_cover = models.CharField(max_length=50, null=True)
    wind_speed = models.FloatField(max_length=50, null=True)
    wind_direction = models.CharField(max_length=50, null=True)
    humidity = models.FloatField(max_length=50, null=True)
    precipitation = models.CharField(max_length=50, null=True)
    solar_azimuth = models.FloatField(max_length=50, null=True)
    solar_altitude = models.FloatField(max_length=50, null=True)
    daily_solar_output = models.FloatField(max_length=50, null=True)
    optimal_time = models.DateTimeField(default=timezone.now)
    optimal_power = models.FloatField(max_length=50, null=True)
    washing_machine_data = models.TextField(null=True)
    tumble_dryer_data = models.TextField(null=True)
