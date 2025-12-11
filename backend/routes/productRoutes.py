from django.urls import path
from django.contrib.auth.decorators import login_required
from backend.controllers import productController

urlpatterns = [
    path('/', login_required(productController.productPage, login_url='/'), name='product'),
    
    # --- product AJAX endpoints ---
    path('/update/', productController.update_product, name='update_product'),
    path('/delete/', productController.delete_product, name='delete_product'),
    path('/low-stock/', productController.low_stock_products, name='low_stock_products'),
]