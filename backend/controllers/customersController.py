from django.shortcuts import render, redirect, get_object_or_404
from members.models import Customer
from members.forms import CustomerForm
from backend.services import customerServices as services
from django.http import JsonResponse

def customerInfoPage(request):
    if request.method == 'POST':
        edit_id = request.POST.get('edit_id')

        if edit_id:  # existing customer edit
            services.update_customer_details(edit_id, request.POST)
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
    data = services.get_all_customers_formatted()
    return JsonResponse(data, safe=False)

def delete_customer(request, customer_id):
    if request.method == "POST":
        customer = get_object_or_404(Customer, pk=customer_id)
        customer.delete()
        return JsonResponse({"success": True})
    return JsonResponse({"error": "Invalid request"}, status=400)