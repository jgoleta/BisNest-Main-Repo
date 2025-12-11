from members.models import Customer

def update_customer_details(customer_id, data):
    customer = Customer.objects.get(pk=customer_id)
    
    customer.name = data.get('name', customer.name)
    customer.phone = data.get('phone', customer.phone)
    customer.address = data.get('address', customer.address)
    customer.save()
    return customer

def get_all_customers_formatted():
    customers = Customer.objects.select_related().all()
    return [{
        "id": c.id,
        "customer_id": c.customer_id,
        "name": c.name,
        "phone": c.phone,
        "address": c.address,
        "date_added": c.date_added.strftime("%Y-%m-%d"),
    } for c in customers]