from django.urls import path
from django.contrib.auth.decorators import login_required
from backend.controllers import deliveryController

urlpatterns = [
    path('/', login_required(deliveryController.deliveryPage, login_url='/'), name='delivery'),
    
    # --- crud ---
    path('/update_delivery_status/<int:delivery_id>/', deliveryController.update_delivery_status, name='update_delivery_status'),
    path('/delete/<int:delivery_id>/', deliveryController.delete_delivery, name='delete_delivery'),
    
    # -- delivery AJAX endpoints ---
    path("/deliveries_json/", deliveryController.deliveries_json, name="deliveries_json"),

]