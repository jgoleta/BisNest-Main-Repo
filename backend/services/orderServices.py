import json
from django.db import transaction
from django.shortcuts import get_object_or_404
from members.models import Order, OrderItem, Product, Customer, Employee

def get_next_order_id():
    """Calculates the next Order ID string (e.g., ORD0005)."""
    last_order = Order.objects.order_by('-id').first()
    if last_order and last_order.order_id:
        try:
            # Remove "ORD" prefix and parse int
            order_id_str = last_order.order_id.replace("ORD", "").replace("O", "")
            next_number = int(order_id_str) + 1
        except ValueError:
            next_number = 1
    else:
        next_number = 1
    return f"ORD{next_number:04d}"

def get_formatted_order_list():
    """Fetches orders with related data optimized for JSON APIs."""
    orders = Order.objects.all().select_related('customer', 'employee').prefetch_related('order_items__product')
    data = []
    for order in orders:
        items = [
            {
                "product_name": item.product.name,
                "quantity": item.quantity
            } for item in order.order_items.all()
        ]
        data.append({
            "id": order.id,
            "order_id": order.order_id,
            "customer": {"id": order.customer.id, "name": order.customer.name},
            "employee": {"id": order.employee.id, "name": order.employee.name},
            "items": items,
            "total_amount": float(order.total_amount),
            "date": order.date.strftime("%Y-%m-%d")
        })
    return data

@transaction.atomic
def create_order_from_cart(data):
    """
    1. Validates stock for ALL items.
    2. Creates the Order.
    3. Creates OrderItems.
    4. Updates Product stock.
    """
    customer = get_object_or_404(Customer, id=data["customer_id"])
    employee = get_object_or_404(Employee, id=data["employee_id"])
    cart_items = data["cart_items"]

    # 1. Create Parent Order
    order = Order.objects.create(
        customer=customer,
        employee=employee,
    )

    # 2. Process Items
    for item in cart_items:
        product = get_object_or_404(Product, id=item["productId"])
        qty = item["quantity"]

        # Stock Validation
        if product.stock < qty:
            raise ValueError(f"Not enough stock for {product.name}. Available: {product.stock}")

        # Create Item
        OrderItem.objects.create(
            order=order,
            product=product,
            quantity=qty,
            amount=product.price * qty
        )
        product.save()

    return order

def delete_order_by_id(pk):
    order = get_object_or_404(Order, pk=pk)
    order.delete()
    return True
