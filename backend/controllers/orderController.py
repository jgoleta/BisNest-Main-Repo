from django.shortcuts import render, redirect, get_object_or_404
from members.models import Order, Product, Customer, Employee, OrderItem
from members.forms import OrderForm
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction
import json


# ----------------------------------------------------------
# ORDER HISTORY PAGE
# ----------------------------------------------------------
def orderHistoryPage(request):

    # prepare next order_id
    last_order = Order.objects.order_by('-id').first()
    if last_order and last_order.order_id:
        order_id_str = last_order.order_id.replace("ORD", "").replace("O", "")
        try:
            next_number = int(order_id_str) + 1
        except ValueError:
            next_number = 1
    else:
        next_number = 1

    form = OrderForm(initial={"order_id": f"ORD{next_number:04d}"})

    # ------------------------------------------------------
    # CREATE / EDIT ORDER
    # ------------------------------------------------------
    if request.method == "POST":
        edit_id = request.POST.get("edit_id")
        cart_data = request.POST.get("cart_data")

        # --------------------------------------------------
        # 1. Editing existing order
        # --------------------------------------------------
        if edit_id:
            order = get_object_or_404(Order, pk=edit_id)
            form = OrderForm(request.POST, instance=order)
            if form.is_valid():
                form.save()
                return redirect("history")

        # --------------------------------------------------
        # 2. Creating multiple orders from cart (OLD LOGIC)
        #    → Now changed to create ONE order with MANY items
        # --------------------------------------------------
        elif cart_data:
            try:
                cart = json.loads(cart_data)
                
                with transaction.atomic():
                    
                    first = cart[0]
                    customer = Customer.objects.get(pk=first["customerId"])
                    employee = Employee.objects.get(pk=first["employeeId"])

                    # Create parent order
                    order = Order.objects.create(
                        customer=customer,
                        employee=employee
                    )

                    cart_map = {item["productId"]: item["quantity"] for item in cart}
                    product_ids = cart_map.keys()
                    
                    products = Product.objects.filter(id__in=product_ids)
                    
                    order_items_to_create = []

                    for product in products:
                        qty = cart_map[product.id]
                        
                        if product.stock < qty:
                            raise Exception(f"Not enough stock for {product.name}")

                        order_items_to_create.append(OrderItem(
                            order=order,
                            product=product,
                            quantity=qty,
                            amount=product.price * qty
                        ))

                        Product.objects.filter(pk=product.id).update(stock=F('stock') - qty)

                    # 4. BULK CREATE
                    OrderItem.objects.bulk_create(order_items_to_create)

                return redirect("/payment/?open_form=true")
            except Exception as e:
                print("❌ Error creating order from cart:", e)

        # --------------------------------------------------
        # 3. Simple single order form (fallback)
        # --------------------------------------------------
        else:
            if form.is_valid():
                form.save()
                return redirect("/payment/?open_form=true")
            else:
                print("❌ INVALID order form")
                print(form.errors)

    # product list
    products = Product.objects.values_list("name", flat=True).distinct().order_by("name")

    return render(request, "history.html", {
        "form": form,
        "products": products,
    })


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
            "order_id": order.id,  # or order.order_id if you have that field
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