from django.shortcuts import render, redirect, get_object_or_404
from members.models import Payment
from members.forms import PaymentForm
from django.http import JsonResponse
from backend.services import paymentsServices as services

def paymentPage(request):
    if request.method == 'POST':
        edit_id = request.POST.get('edit_id')

        if edit_id:
            # Edit Mode: fetch object and bind to form
            payment = get_object_or_404(Payment, pk=edit_id)
            form = PaymentForm(request.POST, instance=payment)
        else:
            # Create Mode: bind new data to form
            form = PaymentForm(request.POST)

        if form.is_valid():
            form.save()
            return redirect('payment')
        else:
            print("Form Errors:", form.errors)
            
    else:
        # --- GET REQUEST ---
        next_id = services.get_next_payment_id()
        form = PaymentForm(initial={'payment_id': next_id})

    return render(request, 'payment.html', {
        'form': form,
    })

def payments_json(request):
    data = services.get_formatted_payments()
    return JsonResponse(data, safe=False)

def delete_payment(request, payment_id):
    if request.method == "POST":
        services.delete_payment_safely(payment_id)
        return JsonResponse({"success": True})

    return JsonResponse({"error": "Invalid request"}, status=400)