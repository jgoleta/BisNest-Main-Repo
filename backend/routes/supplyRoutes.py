from django.urls import path
from django.contrib.auth.decorators import login_required
from backend.controllers import suppliesController

urlpatterns = [
    path('/', login_required(suppliesController.supplyPage, login_url='/'), name='supply'),

    # --- crud ---
    path('/delete-supply/<int:id>/', suppliesController.delete_supply, name='delete_supply'),
    
    # -- supply AJAX endpoints ---
    path("/supplies_json/", suppliesController.supplies_json, name="supplies_json"),
]