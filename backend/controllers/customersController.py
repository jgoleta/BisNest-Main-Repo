from django.shortcuts import render, redirect, get_object_or_404
from members.models import Customer
from members.forms import CustomerForm
from django.http import JsonResponse

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

    form = CustomerForm()
    return render(request, 'customer.html', {
        'form': form,
    })

def customers_json(request):
    customers = Customer.objects.select_related().all()

    data = [{
        "id": c.id,
        "customer_id": c.customer_id,
        "name": c.name,
        "phone": c.phone,
        "address": c.address,
        "date_added": c.date_added.strftime("%Y-%m-%d"),
    } for c in customers]

    return JsonResponse(data, safe=False)

def delete_customer(request, customer_id):
    if request.method == "POST":
        customer = get_object_or_404(Customer, pk=customer_id)
        customer.delete()
        return JsonResponse({"success": True})
    return JsonResponse({"error": "Invalid request"}, status=400)