from django.db import models
from django.utils import timezone

class Submission(models.Model):
    post_code = models.CharField(max_length=10)
    number_of_solar_panels = models.IntegerField(default=1)
    date = models.DateField(default=timezone.now)
    temperature = models.FloatField(max_length=50, null=True)
    cloud_cover = models.CharField(max_length=50, null=True)