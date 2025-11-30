from django.shortcuts import render, redirect, get_object_or_404
from members.models import Order, Product, Customer, Employee
from members.forms import OrderForm
from django.http import JsonResponse
import json

def orderHistoryPage(request):
    form = OrderForm(initial={'order_id': f"O{Order.objects.count() + 1:04d}"})

    if request.method == 'POST':
        edit_id = request.POST.get('edit_id')
        cart_data = request.POST.get('cart_data')

        if edit_id:  # existing order edit
            order = get_object_or_404(Order, pk=edit_id)
            form = OrderForm(request.POST, instance=order)
            if form.is_valid():
                form.save()
                return redirect('history')
        elif cart_data:  # create orders from cart
            try:
                cart = json.loads(cart_data)
                created_orders = []
                
                for item in cart:
                    try:
                        customer = Customer.objects.get(pk=item['customerId'])
                        employee = Employee.objects.get(pk=item['employeeId'])
                        product = Product.objects.get(pk=item['productId'])
                        
                        order = Order.objects.create(
                            customer=customer,
                            employee=employee,
                            product=product,
                            quantity=item['quantity']
                        )
                        created_orders.append(order)
                    except Exception as e:
                        print(f"Error creating order for item: {e}")
                        continue
                
                if created_orders:
                    return redirect('/payment/?open_form=true')
                else:
                    print("❌ No orders created from cart")
            except json.JSONDecodeError:
                print("❌ Invalid cart data JSON")
        else:  # create new order
            form = OrderForm(request.POST)
            if form.is_valid():
                form.save()
                return redirect('/payment/?open_form=true')
            else:
                print("❌ INVALID form")
                print(form.errors)

    # Get unique product names for the filter dropdown
    products = Product.objects.values_list('name', flat=True).distinct().order_by('name')
    
    return render(request, 'history.html', {
        'form': form,
        'products': products,
    })

def orders_json(request):
    orders = Order.objects.select_related('customer', 'employee', 'product').all()

    data = [{
        "id": o.id,
        "order_id": o.order_id,
        "customer": {"id": o.customer.id, "name": o.customer.name},
        "employee": {"id": o.employee.id, "name": o.employee.name},
        "product": {"id": o.product.id, "name": o.product.name},
        "amount": o.amount,
        "quantity": o.quantity,
        "date": o.date.strftime("%Y-%m-%d"),
    } for o in orders]

    return JsonResponse(data, safe=False)

def delete_order(request, id):
    if request.method == "POST":
        obj = get_object_or_404(Order, pk=id)
        obj.delete()
        return JsonResponse({"success": True})
    return JsonResponse({"error": "Invalid request"}, status=400)