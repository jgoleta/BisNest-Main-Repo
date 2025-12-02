from django.apps import AppConfig

class OrdersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'members.signals.orderSignal'

    def ready(self):
        import members.signals.orderSignal.signals