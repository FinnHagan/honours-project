# Generated by Django 5.0.2 on 2024-03-15 13:43

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Submission',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('post_code', models.CharField(max_length=10)),
                ('number_of_solar_panels', models.IntegerField(default=1)),
                ('date', models.DateField(default=django.utils.timezone.now)),
                ('temperature', models.FloatField(max_length=50, null=True)),
                ('cloud_cover', models.CharField(max_length=50, null=True)),
                ('wind_speed', models.FloatField(max_length=50, null=True)),
                ('wind_direction', models.CharField(max_length=50, null=True)),
                ('humidity', models.FloatField(max_length=50, null=True)),
                ('precipitation', models.CharField(max_length=50, null=True)),
                ('solar_azimuth', models.FloatField(max_length=50, null=True)),
                ('solar_altitude', models.FloatField(max_length=50, null=True)),
            ],
        ),
    ]
