"""
URL configuration for goletan1am project.

- Public routes (login, signup) → backend.index
- Protected routes (menu, employees, etc.) → backend.index with login protection
"""

from django.contrib import admin
from django.urls import path
from django.contrib.auth.decorators import login_required
from backend import index
from backend.controllers import employeesController, orderController, paymentsController, productController, deliveryController, suppliesController, salesreportController, customersController

urlpatterns = [
    # --- Admin ---
    path('admin/', admin.site.urls),

    # --- public---
    path('', index.landingPage, name='landingPage'),
    path('login/', index.login_view, name='login_view'),
    path('logout/', index.logout_view, name='logout_view'),
    path('register/', index.register_view, name='register_view'),
    path('signup/', index.signupPage, name='signupPage'),

    # --- protected---
    path('menu/', login_required(index.menuPage, login_url='/login/'), name='menu'),
    path('employeesinfo/', login_required(employeesController.employeesInfoPage, login_url='/login/'), name='employeesinfo'),
    path('history/', login_required(orderController.orderHistoryPage, login_url='/login/'), name='history'),
    path('payment/', login_required(paymentsController.paymentPage, login_url='/login/'), name='payment'),
    path('customer/', login_required(customersController.customerInfoPage, login_url='/login/'), name='customer'),
    path('product/', login_required(productController.productPage, login_url='/login/'), name='product'),
    path('delivery/', login_required(deliveryController.deliveryPage, login_url='/login/'), name='delivery'),
    path('supply/', login_required(suppliesController.supplyPage, login_url='/login/'), name='supply'),
    path('sales/', login_required(salesreportController.salesPage, login_url='/login/'), name='sales'),
    path('about/', login_required(index.aboutPage, login_url='/login/'), name='about'),

    # --- crud ---
    path('employee-info/delete/<int:employee_id>/', employeesController.delete_employee, name='delete_employee'),
    path('customer/delete/<int:customer_id>/', customersController.delete_customer, name='delete_customer'),
    path('delivery/delete/<int:delivery_id>/', deliveryController.delete_delivery, name='delete_delivery'),
    path('delete-payment/<int:payment_id>/', paymentsController.delete_payment, name='delete_payment'),
    path('delete-order/<int:order_id>/', orderController.delete_order, name='delete_order'),
    path('delete-supply/<int:supply_id>/', suppliesController.delete_supply, name='delete_supply'),
    path('delete-sale/<int:sale_id>/', salesreportController.delete_sale, name='delete_sale'),
    path('update_delivery_status/<int:delivery_id>/', deliveryController.update_delivery_status, name='update_delivery_status'),

    # --- product AJAX endpoints ---
    path('product/update/', productController.update_product, name='update_product'),
    path('product/delete/', productController.delete_product, name='delete_product'),
]
