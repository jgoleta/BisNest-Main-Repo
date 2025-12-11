from django.shortcuts import render, redirect, get_object_or_404
from members.models import Delivery
from members.forms import DeliveryForm
from backend.services import deliveryServices as services
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

def deliveryPage(request):
    if request.method == 'POST':
        edit_id = request.POST.get('edit_id')

        # --- UNIFIED FORM SETUP ---
        if edit_id:
            # Edit Mode
            delivery = get_object_or_404(Delivery, pk=edit_id)
            form = DeliveryForm(request.POST, instance=delivery)
        else:
            # Create Mode
            form = DeliveryForm(request.POST)

        # --- UNIFIED SAVE ---
        if form.is_valid():
            form.save()
            return redirect('delivery')
        else:
            print("Form Errors:", form.errors) # Debugging

    else:
        # --- GET REQUEST ---
        # Call service to generate the next ID
        next_id = services.get_next_delivery_id_service()
        form = DeliveryForm(initial={'delivery_id': next_id})

    return render(request, 'delivery.html', {
        'form': form,
    })

def deliveries_json(request):
    data = services.get_formatted_deliveries()
    return JsonResponse(data, safe=False)

def delete_delivery(request, delivery_id):
    if request.method == "POST":
        services.delete_delivery_by_id(delivery_id)
        return JsonResponse({"success": True})
    return JsonResponse({"error": "Invalid request"}, status=400)

@csrf_exempt
def update_delivery_status(request, delivery_id):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            new_status = data.get('status')

            # Call Service to perform the update
            services.update_delivery_status_logic(delivery_id, new_status)

            return JsonResponse({'success': True, 'new_status': new_status})
            
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    else:
        return JsonResponse({'success': False, 'error': 'Invalid request'})