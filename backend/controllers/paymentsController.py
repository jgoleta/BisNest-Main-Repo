from django.shortcuts import render, redirect, get_object_or_404
from members.models import Payment
from members.forms import PaymentForm

def paymentPage(request):
    payments = Payment.objects.all()

    if request.method == 'POST':
        edit_id = request.POST.get('edit_id')

        if edit_id:  # existing payment edit
            payment = get_object_or_404(Payment, pk=edit_id)
            form = PaymentForm(request.POST, instance=payment)
            if form.is_valid():
                form.save()
                return redirect('payment')
            else:
                print("❌ INVALID form (edit)", form.errors)
        else:  # create new payment
            form = PaymentForm(request.POST)
            if form.is_valid():
                form.save()
                return redirect('payment')
            else:
                print("❌ INVALID form", form.errors)
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
        'payments': payments
    })

def delete_payment(request, payment_id):
    payment = get_object_or_404(Payment, pk=payment_id)
    payment.delete()
    return redirect('payment')