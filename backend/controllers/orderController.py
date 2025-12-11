from django.shortcuts import render, redirect, get_object_or_404
from django.forms import inlineformset_factory
from members.models import Order, Product, Customer, Employee, OrderItem
from members.forms import OrderForm
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from backend.services import orderServices as services
import json

def orderHistoryPage(request, pk=None):
    # Define Formset (Controller logic as it binds to HTML)
    OrderItemFormSet = inlineformset_factory(
        Order, OrderItem, fields=('product', 'quantity', 'amount'),
        extra=0, can_delete=True
    )

    if pk is not None:
        # --- EDIT MODE ---
        order = get_object_or_404(Order, pk=pk)
        if request.method == 'POST':
            form = OrderForm(request.POST, instance=order)
            formset = OrderItemFormSet(request.POST, instance=order)
            if form.is_valid() and formset.is_valid():
                form.save()
                formset.save()
                return redirect('order')
        else:
            form = OrderForm(instance=order)
            formset = OrderItemFormSet(instance=order)
    else:
        # --- CREATE MODE ---
        formset = None
        if request.method == 'POST':
            form = OrderForm(request.POST)
            if form.is_valid():
                form.save()
                return redirect('order')
        else:
            # Call Service for ID generation
            next_id = services.get_next_order_id()
            form = OrderForm(initial={"order_id": next_id})

    # Common Context
    products = Product.objects.values_list("name", flat=True).distinct().order_by("name")
    
    return render(request, "history.html", {
        "form": form,
        "products": products,
        "formset": formset, 
        "is_edit_mode": pk is not None 
    })

# --- JSON API Views ---

def orders_json(request):
    data = services.get_formatted_order_list()
    return JsonResponse(data, safe=False)

def delete_order(request, id):
    if request.method == "POST":
        services.delete_order_by_id(id)
        return JsonResponse({"success": True})
    return JsonResponse({"error": "Invalid request"}, status=400)

@csrf_exempt
def create_order(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            # Service handles the transaction and stock checks
            order = services.create_order_from_cart(data)
            
            return JsonResponse({
                "order_id": order.order_id,
                "total_amount": float(order.total_amount)
            })
            
        except ValueError as e:
            # Catch stock errors (e.g. "Not enough stock")
            return JsonResponse({"error": str(e)}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request"}, status=400)

def get_order_form_html(request, pk):
    order = get_object_or_404(Order, pk=pk)
    
    # Define the formset
    OrderItemFormSet = inlineformset_factory(
        Order, OrderItem, fields=('product', 'quantity', 'amount'),
        extra=0, can_delete=True
    )
    
    form = OrderForm(instance=order)
    formset = OrderItemFormSet(instance=order)
    
    context = {
        'form': form,
        'formset': formset,
        'is_edit_mode': True
    }
    return render(request, 'partials/order_form_snippet.html', context)