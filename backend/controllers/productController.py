from django.shortcuts import render, redirect
from members.models import Product
from members.forms import ProductForm
from backend.services import productServices as services
from django.http import JsonResponse
import json
from django.contrib.auth.decorators import login_required
from decimal import Decimal
from django.views.decorators.http import require_POST

def productPage(request):
    if request.method == 'POST':
        form = ProductForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('product')
        else:
            print(form.errors)
    else:
        form = ProductForm()

    # Simple queries are fine in views, but consistent usage implies:
    products = Product.objects.all() 
    return render(request, 'product.html', {
        'form': form,
        'products': products
    })

@login_required
@require_POST
def update_product(request):
    try:
        # 1. Parse Data
        data = json.loads(request.body.decode('utf-8'))
        
        # 2. Call Service
        product = services.update_product_details(data)
        
        # 3. Return Response
        return JsonResponse({
            'success': True, 
            'product_id': product.product_id, 
            'price': str(product.price),
            'name': product.name,
            'description': product.description,
            'stock': product.stock
        })
        
    except ValueError as e: # Catch the "Missing product_id" error
        return JsonResponse({'success': False, 'error': str(e)}, status=400)
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
        
        # Call Service
        services.delete_product_by_id(product_id)
        
        return JsonResponse({'success': True, 'product_id': product_id})
        
    except ValueError as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)
    except Product.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Product not found'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

def get_products(request):
    # Call Service
    data = services.get_all_products_values()
    return JsonResponse(data, safe=False)

@login_required
def low_stock_products(request):
    # Call Service
    alerts = services.calculate_low_stock_alerts()
    return JsonResponse({"alerts": alerts}, safe=False)