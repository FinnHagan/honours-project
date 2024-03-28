from django.core.management.base import BaseCommand
from solarApp.models import ApplianceConsumption
from datetime import time


class Command(BaseCommand):
    help = 'Load predefined appliance consumption data into the database'

    def handle(self, *args, **options):
        predefined_data = [
            {"appliance_name": "washing_machine", "timestamp": "08:52", "consumption": 0.37},
            {"appliance_name": "washing_machine", "timestamp": "09:12", "consumption": 375.23},
            {"appliance_name": "washing_machine", "timestamp": "09:22", "consumption": 375.68},
            {"appliance_name": "washing_machine", "timestamp": "09:32", "consumption": 140.23},
            {"appliance_name": "washing_machine", "timestamp": "09:42", "consumption": 62.92},
            {"appliance_name": "washing_machine", "timestamp": "09:52", "consumption": 58.33},
            {"appliance_name": "washing_machine", "timestamp": "10:02", "consumption": 11.57},
            {"appliance_name": "washing_machine", "timestamp": "10:12", "consumption": 10.9},
            {"appliance_name": "washing_machine", "timestamp": "10:22", "consumption": 11},
            {"appliance_name": "washing_machine", "timestamp": "10:32", "consumption": 18.38},
            {"appliance_name": "washing_machine", "timestamp": "10:42", "consumption": 18.77},
            {"appliance_name": "washing_machine", "timestamp": "10:52", "consumption": 0.32},
            {"appliance_name": "tumble_dryer", "timestamp": "12:57", "consumption": 0.03},
            {"appliance_name": "tumble_dryer", "timestamp": "13:07", "consumption": 298.37},
            {"appliance_name": "tumble_dryer", "timestamp": "13:17", "consumption": 312.7},
            {"appliance_name": "tumble_dryer", "timestamp": "13:27", "consumption": 279.18},
            {"appliance_name": "tumble_dryer", "timestamp": "13:37", "consumption": 278.23},
            {"appliance_name": "tumble_dryer", "timestamp": "13:47", "consumption": 275.85},
            {"appliance_name": "tumble_dryer", "timestamp": "13:57", "consumption": 251.97},
            {"appliance_name": "tumble_dryer", "timestamp": "14:07", "consumption": 34.95},
            {"appliance_name": "tumble_dryer", "timestamp": "14:17", "consumption": 187.23},
            {"appliance_name": "tumble_dryer", "timestamp": "14:27", "consumption": 281.2},
            {"appliance_name": "tumble_dryer", "timestamp": "14:37", "consumption": 185.17},
            {"appliance_name": "tumble_dryer", "timestamp": "14:47", "consumption": 16.82},
            {"appliance_name": "tumble_dryer", "timestamp": "14:57", "consumption": 0.02},
        ]

        for record in predefined_data:
            record['timestamp'] = time.fromisoformat(record['timestamp'])
            ApplianceConsumption.objects.create(**record)

        self.stdout.write(self.style.SUCCESS('Successfully loaded appliance consumption data'))
