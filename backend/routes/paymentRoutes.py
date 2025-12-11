from django.urls import path
from django.contrib.auth.decorators import login_required
from backend.controllers import paymentsController

urlpatterns = [
    path('/', login_required(paymentsController.paymentPage, login_url='/'), name='payment'),

    # --- crud ---
    path('/delete-payment/<int:payment_id>/', paymentsController.delete_payment, name='delete_payment'),
    
    # --- payment AJAX endpoints ---
    path("/payments_json/", paymentsController.payments_json, name="payments_json"),
]