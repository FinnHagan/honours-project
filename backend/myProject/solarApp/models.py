from django.db import models

class React(models.Model):
    date = models.DateField()
    no_solar_panels = models.IntegerField()