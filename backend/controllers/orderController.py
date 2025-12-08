from django.shortcuts import render, redirect, get_object_or_404
from django.forms import inlineformset_factory
from members.models import Order, Product, Customer, Employee, OrderItem
from members.forms import OrderForm
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction
import json

# ----------------------------------------------------------
# ORDER HISTORY PAGE
# ----------------------------------------------------------

def orderHistoryPage(request, pk=None):

    # --- COMMON: Product List & Next Order ID Calculation ---
    products = Product.objects.values_list("name", flat=True).distinct().order_by("name")
    
    # Calculate next_number for the "Create" form
    last_order = Order.objects.order_by('-id').first()
    if last_order and last_order.order_id:
        order_id_str = last_order.order_id.replace("ORD", "").replace("O", "")
        try:
            next_number = int(order_id_str) + 1
        except ValueError:
            next_number = 1
    else:
        next_number = 1

    # Define the Formset Class
    OrderItemFormSet = inlineformset_factory(
        Order, OrderItem, fields=('product', 'quantity', 'amount'),
        extra=0, can_delete=True
    )

    # ======================================================
    # MODE A: EDIT EXISTING ORDER (pk is provided)
    # ======================================================
    if pk is not None:
        order = get_object_or_404(Order, pk=pk)
        
        if request.method == 'POST':
            form = OrderForm(request.POST, instance=order)
            formset = OrderItemFormSet(request.POST, instance=order)
            
            if form.is_valid() and formset.is_valid():
                form.save()
                formset.save()
                return redirect('history') # Redirect back to main list after save
        else:
            form = OrderForm(instance=order)
            formset = OrderItemFormSet(instance=order)

    # ======================================================
    # MODE B: CREATE NEW ORDER (pk is None)
    # ======================================================
    else:
        formset = None 
        
        if request.method == 'POST':
            form = OrderForm(request.POST)
            if form.is_valid():
                form.save()
                return redirect('history')
        else:
            form = OrderForm(initial={"order_id": f"ORD{next_number:04d}"})

    # ======================================================
    # RENDER RESPONSE
    # ======================================================
    context = {
        "form": form,
        "products": products,
        "formset": formset, 
        "is_edit_mode": pk is not None 
    }
    return render(request, "history.html", context)

def get_order_form_html(request, pk):
    order = get_object_or_404(Order, pk=pk)
    
    # Define the formset
    OrderItemFormSet = inlineformset_factory(
        Order, OrderItem, fields=('product', 'quantity', 'amount'),
        extra=0, can_delete=True
    )
    
    form = OrderForm(instance=order)
    formset = OrderItemFormSet(instance=order)
    
    # We render a small snippet, not the whole page
    context = {
        'form': form,
        'formset': formset,
        'is_edit_mode': True
    }
    return render(request, 'partials/order_form_snippet.html', context)

# ----------------------------------------------------------
# JSON API FOR ORDER LIST
# ----------------------------------------------------------
def orders_json(request):
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
    return JsonResponse(data, safe=False)


# ----------------------------------------------------------
# DELETE ORDER (ALSO DELETE ORDER ITEMS)
# ----------------------------------------------------------
def delete_order(request, id):
    if request.method == "POST":
        order = get_object_or_404(Order, pk=id)
        order.delete()  # cascades to OrderItem
        return JsonResponse({"success": True})

    return JsonResponse({"error": "Invalid request"}, status=400)


# ----------------------------------------------------------
# CREATE ORDER DIRECTLY FROM CART (AJAX)
# ----------------------------------------------------------
@csrf_exempt
def create_order(request):
    if request.method == "POST":
        data = json.loads(request.body)

        # IMPORTANT: match your frontend keys
        customer = Customer.objects.get(id=data["customer_id"])
        employee = Employee.objects.get(id=data["employee_id"])
        cart_items = data["cart_items"]

        # Create parent order
        order = Order.objects.create(
            customer=customer,
            employee=employee,
        )

        # Create order items
        for item in cart_items:
            # IMPORTANT: match cart keys
            product = Product.objects.get(id=item["productId"])
            qty = item["quantity"]

            # stock validation
            if product.stock < qty:
                return JsonResponse({
                    "error": f"Not enough stock for {product.name}. Available: {product.stock}"
                }, status=400)

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=qty,
                amount=product.price * qty
            )

            product.save()

        return JsonResponse({
            "order_id": order.order_id,
            "total_amount": float(order.total_amount)
        })

    return JsonResponse({"error": "Invalid request"}, status=400)