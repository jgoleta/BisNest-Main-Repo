import json
from django.shortcuts import get_object_or_404
from members.models import Supply, Product

def get_next_supply_id():
    last_supply = Supply.objects.order_by('-id').first()
    next_number = 1
    
    if last_supply and last_supply.supply_id:
        # Clean the string to handle "SUP" or accidental "S" prefixes
        supply_id_str = last_supply.supply_id.replace("SUP", "").replace("S", "")
        try:
            next_number = int(supply_id_str) + 1
        except ValueError:
            next_number = 1
            
    return f"SUP{next_number:04d}"

def get_supply_page_context():
    return {
        'supplies': Supply.objects.exclude(supply_id='').all(),
        'suppliers': Supply.objects.values_list('supplier', flat=True).distinct().order_by('supplier'),
        'products': Product.objects.values_list('name', flat=True).distinct().order_by('name')
    }

def get_formatted_supplies():
    supplies = Supply.objects.select_related('product').all()
    return [{
        "id": s.id,
        "supply_id": s.supply_id,
        "supplier": s.supplier,
        "product": {"id": s.product.id, "name": s.product.name},
        "quantity": s.quantity,
        "date": s.date.strftime("%Y-%m-%d"),
        "price": s.price,
    } for s in supplies]

def delete_supply_by_id(id):
    supply = get_object_or_404(Supply, id=id)
    supply.delete()
    return True