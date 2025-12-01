from django.shortcuts import render, redirect
from members.models import Product
from members.forms import ProductForm
from django.http import JsonResponse
import json
from django.contrib.auth.decorators import login_required
from decimal import Decimal
from django.views.decorators.http import require_POST

def productPage(request):
    if request.method == 'POST':
        form = ProductForm(request.POST)  # IMPORTANT FIX
        if form.is_valid():
            form.save()
            return redirect('product')
        else:
            print(form.errors)  # LOG ERRORS FOR TESTING
    else:
        form = ProductForm()

    products = Product.objects.all()
    return render(request, 'product.html', {
        'form': form,
        'products': products
    })

@login_required
@require_POST
def update_product(request):

    try:
        data = json.loads(request.body.decode('utf-8'))
        product_id = data.get('product_id')
        price = data.get('price')
        name = data.get('name')
        stock = data.get('stock')
        
        if not product_id:
            return JsonResponse({'success': False, 'error': 'Missing product_id'}, status=400)

        product = Product.objects.get(product_id=product_id)
        
        # Update price if provided
        if price is not None:
            product.price = Decimal(str(price))
        
        # Update name if provided
        if name is not None:
            product.name = name
        
        # Update stock if provided
        if stock is not None:
            product.stock = int(stock)
        
        product.save()
        return JsonResponse({
            'success': True, 
            'product_id': product.product_id, 
            'price': str(product.price),
            'name': product.name,
            'stock': product.stock
        })
    except Product.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Product not found'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@login_required
@require_POST
def delete_product(request):

    try:
        data = json.loads(request.body.decode('utf-8'))
        product_id = data.get('product_id')
        if not product_id:
            return JsonResponse({'success': False, 'error': 'Missing product_id'}, status=400)
        product = Product.objects.get(product_id=product_id)
        product.delete()
        return JsonResponse({'success': True, 'product_id': product_id})
    except Product.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Product not found'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

def get_products(request):
    products = Product.objects.all().values('product_id', 'name', 'stock', 'price', 'image')
    return JsonResponse(list(products), safe=False)