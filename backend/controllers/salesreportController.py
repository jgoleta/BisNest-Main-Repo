from django.shortcuts import render, redirect, get_object_or_404
from members.models import Payment, SalesReport

def salesPage(request):
    sales = Payment.objects.all().order_by('-date')
    return render(request, 'sales.html', {
        'sales': sales,
    })

def delete_sale(request, sale_id):
    sale = get_object_or_404(SalesReport, pk=sale_id)
    sale.delete()
    return redirect('sales')