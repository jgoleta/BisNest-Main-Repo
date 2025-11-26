from django.shortcuts import render, redirect, get_object_or_404
from members.models import Supply
from members.forms import SupplyForm
from django.http import JsonResponse

def supplyPage(request):
    if request.method == 'POST':
        edit_id = request.POST.get('edit_id')
        
        if edit_id:
            supply = get_object_or_404(Supply, supply_id=edit_id)
            form = SupplyForm(request.POST, instance=supply)
        else:
            form = SupplyForm(request.POST)
            if not form.data.get('supply_id'):
                count = Supply.objects.count() + 1
                new_supply_id = f"SUP{count:04d}"
                post_data = request.POST.copy()
                post_data['supply_id'] = new_supply_id
                form = SupplyForm(post_data)
        
        if form.is_valid():
            form.save()
            return redirect('supply')
    else:
        count = Supply.objects.count() + 1
        form = SupplyForm(initial={
            'supply_id': f"SUP{count:04d}"
        })

    return render(request, 'supply.html', {
        'form': form,
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

def delete_supply(request, supply_id):
    if request.method == "POST":
        supply = get_object_or_404(Supply, supply_id=supply_id)
        supply.delete()
        return JsonResponse({"success": True})
    return JsonResponse({"error": "Invalid request"}, status=400)