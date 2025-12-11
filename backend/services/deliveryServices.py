import json
from django.shortcuts import get_object_or_404
from members.models import Delivery

def get_next_delivery_id_service():
    return Delivery.get_next_delivery_id()

def get_formatted_deliveries():
    # select_related optimizes fetching the linked order and customer
    deliveries = Delivery.objects.select_related('order__customer').all()

    return [{
        "id": d.id,
        "delivery_id": d.delivery_id,
        "order": {"id": d.order.id, "order_id": d.order.order_id},
        "customer": {
            "id": d.order.customer.id, 
            "name": d.order.customer.name, 
            "address": d.order.customer.address
        },
        "scheduled_date": d.scheduled_date.strftime("%Y-%m-%d") if d.scheduled_date else "",
        "status": d.status,
    } for d in deliveries]

def update_delivery_status_logic(delivery_id, new_status):
    delivery = get_object_or_404(Delivery, pk=delivery_id)
    delivery.status = new_status
    delivery.save()
    return delivery.status

def delete_delivery_by_id(delivery_id):
    delivery = get_object_or_404(Delivery, pk=delivery_id)
    delivery.delete()
    return True