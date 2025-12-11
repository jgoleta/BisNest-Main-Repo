from django.shortcuts import render, redirect, get_object_or_404
from members.models import Supply, Product
from members.forms import SupplyForm
from django.http import JsonResponse
from backend.services import suppliesServices as services

def supplyPage(request):
    if request.method == 'POST':
        edit_id = request.POST.get('edit_id')

        # --- UNIFIED FORM SETUP ---
        if edit_id:
            supply = get_object_or_404(Supply, supply_id=edit_id)
            form = SupplyForm(request.POST, instance=supply)
        else:
            form = SupplyForm(request.POST)

        # --- UNIFIED SAVE ---
        if form.is_valid():
            form.save()
            return redirect('supply')
    else:
        # --- GET REQUEST ---
        next_id = services.get_next_supply_id()
        form = SupplyForm(initial={'supply_id': next_id})

    # Call service to get table data and dropdown options
    context_data = services.get_supply_page_context()
    
    # Merge form into context
    context = {
        'form': form,
        **context_data # Unpack dictionary (supplies, suppliers, products)
    }
    
    return render(request, 'supply.html', context)

def supplies_json(request):
    data = services.get_formatted_supplies()
    return JsonResponse(data, safe=False)

def delete_supply(request, id):
    if request.method == "POST":
        services.delete_supply_by_id(id)
        return JsonResponse({"success": True})
    return JsonResponse({"error": "Invalid request"}, status=400)