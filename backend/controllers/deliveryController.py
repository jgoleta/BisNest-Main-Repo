from django.shortcuts import render, redirect, get_object_or_404
from members.models import Delivery
from members.forms import DeliveryForm
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

def deliveryPage(request):
    deliveries = Delivery.objects.all()

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
        'deliveries': deliveries
    })

def delete_delivery(request, delivery_id):
    delivery = get_object_or_404(Delivery, pk=delivery_id)
    delivery.delete()
    return redirect('delivery')

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