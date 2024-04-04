from django.core.management.base import BaseCommand
from solarApp.models import ApplianceConsumption


class Command(BaseCommand):
    help = 'Load predefined appliance consumption data into the database'

    def handle(self, *args, **options):
        predefined_data = [
            {"appliance_name": "washing_machine", "sequence": 1, "consumption": 0.37},
            {"appliance_name": "washing_machine", "sequence": 2, "consumption": 375.23},
            {"appliance_name": "washing_machine", "sequence": 3, "consumption": 375.68},
            {"appliance_name": "washing_machine", "sequence": 4, "consumption": 140.23},
            {"appliance_name": "washing_machine", "sequence": 5, "consumption": 62.92},
            {"appliance_name": "washing_machine", "sequence": 6, "consumption": 58.33},
            {"appliance_name": "washing_machine", "sequence": 7, "consumption": 11.57},
            {"appliance_name": "washing_machine", "sequence": 8, "consumption": 10.9},
            {"appliance_name": "washing_machine", "sequence": 9, "consumption": 11},
            {"appliance_name": "washing_machine", "sequence": 10, "consumption": 18.38},
            {"appliance_name": "washing_machine", "sequence": 11, "consumption": 18.77},
            {"appliance_name": "washing_machine", "sequence": 12, "consumption": 0.32},
            {"appliance_name": "washing_machine", "sequence": 13, "consumption": 0.05},
            {"appliance_name": "tumble_dryer", "sequence": 1, "consumption": 0.03},
            {"appliance_name": "tumble_dryer", "sequence": 2, "consumption": 298.37},
            {"appliance_name": "tumble_dryer", "sequence": 3, "consumption": 312.7},
            {"appliance_name": "tumble_dryer", "sequence": 4, "consumption": 279.18},
            {"appliance_name": "tumble_dryer", "sequence": 5, "consumption": 278.23},
            {"appliance_name": "tumble_dryer", "sequence": 6, "consumption": 275.85},
            {"appliance_name": "tumble_dryer", "sequence": 7, "consumption": 251.97},
            {"appliance_name": "tumble_dryer", "sequence": 8, "consumption": 34.95},
            {"appliance_name": "tumble_dryer", "sequence": 9, "consumption": 187.23},
            {"appliance_name": "tumble_dryer", "sequence": 10, "consumption": 281.2},
            {"appliance_name": "tumble_dryer", "sequence": 11, "consumption": 185.17},
            {"appliance_name": "tumble_dryer", "sequence": 12, "consumption": 16.82},
            {"appliance_name": "tumble_dryer", "sequence": 13, "consumption": 0.02},
        ]

        for record in predefined_data:
            obj, created = ApplianceConsumption.objects.get_or_create(**record)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Added new record for {record["appliance_name"]} at sequence {record["sequence"]}'))
            else:
                self.stdout.write(self.style.WARNING(f'Record already exists for {record["appliance_name"]} at sequence {record["sequence"]}'))
        self.stdout.write(self.style.SUCCESS('Successfully loaded appliance consumption data'))
