# Generated by Django 5.0.2 on 2024-03-19 11:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('solarApp', '0002_submission_panel_orientation_submission_panel_tilt_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='submission',
            name='dhi',
            field=models.FloatField(max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='submission',
            name='dni',
            field=models.FloatField(max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='submission',
            name='ghi',
            field=models.FloatField(max_length=50, null=True),
        ),
    ]
