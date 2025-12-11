from django.shortcuts import render, redirect, get_object_or_404
from members.models import Supply, Product
from members.forms import SupplyForm
from django.http import JsonResponse

def supplyPage(request):
    if request.method == 'POST':
        edit_id = request.POST.get('edit_id')
        
        if edit_id:
            # EDIT MODE
            supply = get_object_or_404(Supply, supply_id=edit_id)
            form = SupplyForm(request.POST, instance=supply)
        else:
            form = SupplyForm(request.POST)
        
        if form.is_valid():
            form.save()
            return redirect('supply')
    else:
        last_supply = Supply.objects.order_by('-id').first()
        if last_supply and last_supply.supply_id:
            supply_id_str = last_supply.supply_id.replace("SUP", "").replace("S", "")
            try:
                next_number = int(supply_id_str) + 1
            except ValueError:
                next_number = 1
        else:
            next_number = 1
        form = SupplyForm(initial={
            'supply_id': f"SUP{next_number:04d}"
        })

    supplies = Supply.objects.exclude(supply_id='').all()
    # Get unique suppliers and products for the filter dropdowns
    suppliers = Supply.objects.values_list('supplier', flat=True).distinct().order_by('supplier')
    products = Product.objects.values_list('name', flat=True).distinct().order_by('name')
    
    return render(request, 'supply.html', {
        'form': form,
        'supplies': supplies,
        'suppliers': suppliers,
        'products': products
    })

def supplies_json(request):
    supplies = Supply.objects.select_related('product').all()

    data = [{
        "id": s.id,
        "supply_id": s.supply_id,
        "supplier": s.supplier,
        "product": {"id": s.product.id, "name": s.product.name},
        "quantity": s.quantity,
        "date": s.date.strftime("%Y-%m-%d"),
        "price": s.price,
    } for s in supplies]

    return JsonResponse(data, safe=False)

def delete_supply(request, id):
    if request.method == "POST":
        supply = get_object_or_404(Supply, id=id)
        supply.delete()
        return JsonResponse({"success": True})
    return JsonResponse({"error": "Invalid request"}, status=400)