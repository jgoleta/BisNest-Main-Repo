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
        form = ProductForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('product')
    else:
        form = ProductForm()

    products = Product.objects.all()
    return render(request, 'product.html', {
        'form': form,
        'products': products
    })

def add_product(request):
    if request.method == "POST":
        name = request.POST.get('name')
        price = request.POST.get('price')
        image = request.FILES.get('image')

        if not name or not price or not image:
            return JsonResponse({'error': 'Missing fields'}, status=400)

        last_product = Product.objects.order_by('-id').first()
        new_id_number = (last_product.id + 1) if last_product else 1
        new_id = f"P{new_id_number:02d}"

        product = Product.objects.create(
            product_id=new_id,
            name=name,
            price=price,
            # image=public_url 
        )

        return JsonResponse({
            'success': True,
            'id': product.product_id,
            # 'image_url': public_url,
        })
    return JsonResponse({'error': 'Invalid method'}, status=405)

@login_required
@require_POST
def update_product(request):

    try:
        data = json.loads(request.body.decode('utf-8'))
        product_id = data.get('product_id')
        price = data.get('price')
        if not product_id or price is None:
            return JsonResponse({'success': False, 'error': 'Missing product_id or price'}, status=400)

        product = Product.objects.get(product_id=product_id)
        product.price = Decimal(str(price))
        product.save()
        return JsonResponse({'success': True, 'product_id': product.product_id, 'price': str(product.price)})
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