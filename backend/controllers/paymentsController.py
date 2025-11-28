from django.shortcuts import render, redirect, get_object_or_404
from members.models import Payment
from members.forms import PaymentForm
from django.http import JsonResponse

def paymentPage(request):
    if request.method == 'POST':
        edit_id = request.POST.get('edit_id')

        if edit_id:  #edit meron nang payment
            payment = get_object_or_404(Payment, pk=edit_id)
            form = PaymentForm(request.POST, instance=payment)
            if form.is_valid():
                form.save()
                return redirect('payment')
            else:
                print("INVALID form (edit)", form.errors)
        else:  #create new payment
            form = PaymentForm(request.POST)
            if form.is_valid():
                form.save()
                return redirect('payment')
            else:
                print("INVALID form", form.errors)
    else:
        last_payment = Payment.objects.order_by('-payment_id').first()
        next_number = 1
        if last_payment and last_payment.payment_id[1:].isdigit():
            next_number = int(last_payment.payment_id[1:]) + 1

        form = PaymentForm(initial={
            'payment_id': f'P{next_number:04d}'
        })

    return render(request, 'payment.html', {
        'form': form,
    })

def payments_json(request):
    payments = Payment.objects.select_related('order').all()

    data = [{
        "id": p.id,
        "payment_id": p.payment_id,
        "order": {"id": p.order.id, "order_id": p.order.order_id},
        "customer": {"id": p.order.customer.id, "name": p.order.customer.name},
        "amount": p.amount,
        "date": p.date,
        "method": p.method,
    } for p in payments]

    return JsonResponse(data, safe=False)

def delete_payment(request, payment_id):
    if request.method == "POST":
        payment = get_object_or_404(Payment, pk=payment_id)
        payment.delete()
        return JsonResponse({"success": True})
    
    return JsonResponse({"error": "Invalid request"}, status=400)