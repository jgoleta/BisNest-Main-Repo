from django.db.models.signals import post_save
from django.dispatch import receiver
from ...models import Supply, OrderItem, Product

@receiver(post_save, sender=OrderItem)
def update_product_stock_on_order(sender, instance, created, **kwargs):
    if created:
            product = instance.product
            if product and product.stock is not None:
                product.stock = max(product.stock - instance.quantity, 0)
                product.save()