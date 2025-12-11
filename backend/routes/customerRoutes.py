from django.urls import path
from django.contrib.auth.decorators import login_required
from backend.controllers import customersController

urlpatterns = [
    path('/', login_required(customersController.customerInfoPage, login_url='/'), name='customer'),
    path('delete-customer/<int:customer_id>/', customersController.delete_customer, name='delete_customer'),
    path('/delete/<int:customer_id>/', customersController.delete_customer),  # backward compatibility

        # --- customer AJAX endpoints ---
    path("/customers_json/", customersController.customers_json, name="customers_json"),
]