from django.urls import path
from django.contrib.auth.decorators import login_required
from backend.controllers import employeesController

urlpatterns = [
    path('/', login_required(employeesController.employeesInfoPage, login_url='/'), name='employee'),

    # --- crud ---
    path('/delete/<int:employee_id>/', employeesController.delete_employee, name='delete_employee'),
    
    # --- employees AJAX endpoints ---
    path("/employees_json/", employeesController.employees_json, name="employees_json"),
]