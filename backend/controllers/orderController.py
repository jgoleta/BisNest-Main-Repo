from django.shortcuts import render, redirect, get_object_or_404
from members.models import Order
from members.forms import OrderForm

def orderHistoryPage(request):
    orders = Order.objects.all()
    form = OrderForm(initial={'order_id': f"O{Order.objects.count() + 1:04d}"})

    if request.method == 'POST':
        edit_id = request.POST.get('edit_id')

        if edit_id:  # existing order edit
            order = get_object_or_404(Order, pk=edit_id)
            form = OrderForm(request.POST, instance=order)
            if form.is_valid():
                form.save()
                return redirect('history')
        else:  # create new order
            form = OrderForm(request.POST)
            if form.is_valid():
                form.save()
                return redirect('/payment/?open_form=true')
            else:
                print("❌ INVALID form")
                print(form.errors)


    return render(request, 'history.html', {
        'form': form,
        'orders': orders
    })

def delete_order(request, order_id):
    order = get_object_or_404(Order, pk=order_id)
    order.delete()
    return redirect('history')