from django.shortcuts import render, redirect, get_object_or_404
from members.models import Customer
from members.forms import CustomerForm

def customerInfoPage(request):
    if request.method == 'POST':
        edit_id = request.POST.get('edit_id')

        if edit_id:  # existing customer edit
            customer = get_object_or_404(Customer, pk=edit_id)
            # mga pdeng iedit
            customer.name = request.POST.get('name', customer.name)
            customer.phone = request.POST.get('phone', customer.phone)
            customer.address = request.POST.get('address', customer.address)
            customer.save()
            return redirect('customer')

        else:  # create
            form = CustomerForm(request.POST)
            if form.is_valid():
                form.save()
                return redirect('customer')

    customers = Customer.objects.all()
    form = CustomerForm()
    return render(request, 'customer.html', {
        'form': form,
        'customers': customers
    })

def delete_customer(request, customer_id):
    customer = get_object_or_404(Customer, pk=customer_id)
    customer.delete()
    return redirect('customer')