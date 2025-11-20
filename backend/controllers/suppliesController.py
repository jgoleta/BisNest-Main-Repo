from django.shortcuts import render, redirect, get_object_or_404
from members.models import Supply
from members.forms import SupplyForm

def supplyPage(request):
    if request.method == 'POST':
        form = SupplyForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('supply')
    else:
        form = SupplyForm(initial={
            'supply_id': f"SUP{Supply.objects.count() + 1:04d}"
        })

    supplies = Supply.objects.all()
    return render(request, 'supply.html', {
        'form': form,
        'supplies': supplies
    })

def delete_supply(request, supply_id):
    supply = get_object_or_404(Supply, pk=supply_id)
    supply.delete()
    return redirect('supply')
