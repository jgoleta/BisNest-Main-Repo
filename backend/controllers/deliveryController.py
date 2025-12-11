from django.shortcuts import render, redirect, get_object_or_404
from members.models import Delivery
from members.forms import DeliveryForm
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

def deliveryPage(request):
    if request.method == 'POST':
        edit_id = request.POST.get('edit_id')

        if edit_id:  #edit meron ng delivery
            delivery = get_object_or_404(Delivery, pk=edit_id)
            form = DeliveryForm(request.POST, instance=delivery)
            if form.is_valid():
                form.save()
                return redirect('delivery')
            else:
                print("INVALID form (edit)", form.errors)
        else:  #add new delivery
            form = DeliveryForm(request.POST)
            if form.is_valid():
                form.save()
                return redirect('delivery')
            else:
                print("INVALID form", form.errors)
    else:
        form = DeliveryForm(initial={'delivery_id': Delivery.get_next_delivery_id()})

    return render(request, 'delivery.html', {
        'form': form,
    })

def deliveries_json(request):
    delivery = Delivery.objects.select_related('order', 'customer').all()

    data = [{
        "id": d.id,
        "delivery_id": d.delivery_id,
        "order": {"id": d.order.id, "order_id": d.order.order_id},
        "customer": {"id": d.order.customer.id, "name": d.order.customer.name, "address": d.order.customer.address},
        "scheduled_date": d.scheduled_date.strftime("%Y-%m-%d"),
        "status": d.status,
    } for d in delivery]

    return JsonResponse(data, safe=False)

def delete_delivery(request, delivery_id):
    if request.method == "POST":
        delivery = get_object_or_404(Delivery, pk=delivery_id)
        delivery.delete()
        return JsonResponse({"success": True})
    return JsonResponse({"error": "Invalid request"}, status=400)

@csrf_exempt
def update_delivery_status(request, delivery_id):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            new_status = data.get('status')

            delivery = Delivery.objects.get(pk=delivery_id)
            previous_status = delivery.status
            delivery.status = new_status
            delivery.save()

            return JsonResponse({'success': True, 'new_status': new_status})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e), 'previous_status': previous_status})
    else:
        return JsonResponse({'success': False, 'error': 'Invalid request'})