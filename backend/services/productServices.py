import json
from decimal import Decimal
from django.core.exceptions import ObjectDoesNotExist
from members.models import Product

def get_all_products_values():
    return list(Product.objects.all().values('product_id', 'name', 'stock', 'price', 'image'))

def update_product_details(data):
    product_id = data.get('product_id')
    if not product_id:
        raise ValueError("Missing product_id")

    product = Product.objects.get(product_id=product_id)

    if 'price' in data:
        product.price = Decimal(str(data['price']))
    if 'name' in data:
        product.name = data['name']
    if 'description' in data:
        product.description = data['description']
    if 'stock' in data:
        product.stock = int(data['stock'])
    
    product.save()
    return product

def delete_product_by_id(product_id):
    if not product_id:
        raise ValueError("Missing product_id")
    
    product = Product.objects.get(product_id=product_id)
    product.delete()
    return True

def calculate_low_stock_alerts():
    alerts = []
    BASELINE_STOCK = 100 
    ALERT_THRESHOLD_PERCENT = 0.3
    
    # Iterate through all products to check stock levels
    for p in Product.objects.all():
        threshold = int(BASELINE_STOCK * ALERT_THRESHOLD_PERCENT)

        if p.stock is not None and p.stock <= threshold:
            percent = round((p.stock / BASELINE_STOCK) * 100, 1)
            alerts.append({
                "product_id": p.product_id,
                "name": p.name,
                "stock": p.stock,
                "baseline_stock": BASELINE_STOCK,
                "alert_threshold": threshold,
                "percent_remaining": percent,
            })
    return alerts