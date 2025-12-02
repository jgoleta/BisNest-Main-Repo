from django.apps import AppConfig

class SuppliesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'members.signals.supplies'

    def ready(self):
        import members.signals.supplies.signals