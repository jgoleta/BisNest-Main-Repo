from django.urls import path
from django.contrib.auth.decorators import login_required
from backend.controllers import orderController

urlpatterns = [
    path('/', login_required(orderController.orderHistoryPage, login_url='/'), name='order'),
    path('/get-order-form/<int:pk>/', orderController.get_order_form_html, name='get_order_form'),    
    path('/delete-order/<int:id>/', orderController.delete_order, name='delete_order'),
    
    # --- order AJAX endpoints ---
    path("/orders_json/", orderController.orders_json, name="orders_json"),
    path("/create/", orderController.create_order, name="create_order"),
]