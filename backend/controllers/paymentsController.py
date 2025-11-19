from django.shortcuts import render, redirect, get_object_or_404
from members.models import Payment
from members.forms import PaymentForm

def paymentPage(request):
    if request.method == 'POST':
        form = PaymentForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('payment')
    else:
        form = PaymentForm(initial={
            'payment_id': f'P{Payment.objects.count()+1:04d}'  
        })

    payments = Payment.objects.all()
    return render(request, 'payment.html', {
        'form': form,
        'payments': payments
    })

def delete_payment(request, payment_id):
    payment = get_object_or_404(Payment, pk=payment_id)
    payment.delete()
    return redirect('payment')