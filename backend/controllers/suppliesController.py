from django.shortcuts import render, redirect, get_object_or_404
from members.models import Supply, Product
from members.forms import SupplyForm

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

def delete_supply(request, supply_id):
    supply = get_object_or_404(Supply, supply_id=supply_id)
    supply.delete()
    return redirect('supply')
