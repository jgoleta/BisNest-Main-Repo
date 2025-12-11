from django.shortcuts import get_object_or_404
from members.models import Payment, SalesReport

def get_next_payment_id():
    # Order by ID or payment_id depending on your needs
    last_payment = Payment.objects.order_by('-payment_id').first()
    next_number = 1
    
    if last_payment and last_payment.payment_id:
        # Assuming format "Pxxxx"
        # Using slice [1:] to skip the 'P'
        id_part = last_payment.payment_id[1:] 
        if id_part.isdigit():
            next_number = int(id_part) + 1
            
    return f'P{next_number:04d}'

def get_formatted_payments():
    # select_related optimizes the SQL join for order AND customer
    payments = Payment.objects.select_related('order__customer').all()

    data = []
    for p in payments:
        if p.order: # Safety check to ensure order exists
            data.append({
                "id": p.id,
                "payment_id": p.payment_id,
                "order": {"id": p.order.id, "order_id": p.order.order_id},
                # We can access customer because of select_related('order__customer')
                "customer": {"id": p.order.customer.id, "name": p.order.customer.name},
                "amount": float(p.amount), # Convert Decimal to float for JSON
                "date": p.date.strftime("%Y-%m-%d") if p.date else "",
                "method": p.method,
            })
    return data

def delete_payment_safely(payment_id):
    payment = get_object_or_404(Payment, pk=payment_id)

    # Note: If your SalesReport model uses ForeignKey(Payment, on_delete=models.CASCADE),
    # this manual loop is redundant because Django deletes them automatically.
    # However, keeping it here preserves your original explicit logic.
    sales_reports = SalesReport.objects.filter(payment=payment)
    for report in sales_reports:
        report.delete()

    payment.delete()
    return True