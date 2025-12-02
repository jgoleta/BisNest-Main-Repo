from django.db.models.signals import post_save
from django.dispatch import receiver
from ...models import Supply, Order, Product

@receiver(post_save, sender=Supply)
def update_product_stock(sender, instance, created, **kwargs):
    if created and instance.product:
        product = instance.product
        product.stock = (product.stock or 0) + instance.quantity
        product.save()
