from django.db import models
class Submission(models.Model):
    post_code = models.CharField(max_length=10)
    number_of_solar_panels = models.IntegerField(default=1)
    # submission_date = models.DateField()