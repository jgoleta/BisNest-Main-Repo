"""
URL configuration for goletan1am project.

- Public routes (login, signup) → backend.index
- Protected routes (menu, employees, etc.) → backend.index with login protection
"""

from django.contrib import admin
from django.urls import path, include
from django.contrib.auth.decorators import login_required
from backend import index
from backend.controllers import employeesController, orderController, paymentsController, productController, deliveryController, suppliesController, salesreportController, customersController

urlpatterns = [
    # --- Admin ---
    path('admin/', admin.site.urls),
    path('accounts/', include("allauth.urls")),  # allauth URLs

    # --- public---
    path('', index.landingPage, name='landingPage'),
    path('login/', index.login_view, name='login_view'),
    path('logout/', index.logout_view, name='logout_view'),
    path('register/', index.register_view, name='register_view'),
    path('signup/', index.signupPage, name='signupPage'),

    # --- protected---
    path('menu/', login_required(index.menuPage, login_url='/'), name='menu'),
    path('employeesinfo/', login_required(employeesController.employeesInfoPage, login_url='/'), name='employeesinfo'),
    path('history/', login_required(orderController.orderHistoryPage, login_url='/'), name='history'),
    path('payment/', login_required(paymentsController.paymentPage, login_url='/'), name='payment'),
    path('customer/', login_required(customersController.customerInfoPage, login_url='/'), name='customer'),
    path('product/', login_required(productController.productPage, login_url='/'), name='product'),
    path('delivery/', login_required(deliveryController.deliveryPage, login_url='/'), name='delivery'),
    path('supply/', login_required(suppliesController.supplyPage, login_url='/'), name='supply'),
    path('sales/', login_required(salesreportController.salesPage, login_url='/'), name='sales'),
    path('about/', login_required(index.aboutPage, login_url='/'), name='about'),
    path('admin-settings/', login_required(index.adminSettingsPage, login_url='/'), name='admin_settings'),
    path('feedback/', login_required(index.feedbackPage, login_url='/'), name='feedback'),
    path('profile/', login_required(index.profilePage, login_url='/'), name='profile'),

    # --- crud ---
    path('delete-employee/<int:employee_id>/', employeesController.delete_employee, name='delete_employee'),
    path('delete-customer/<int:customer_id>/', customersController.delete_customer, name='delete_customer'),
    path('customer/delete/<int:customer_id>/', customersController.delete_customer),  # backward compatibility
    path('delete-delivery/<int:delivery_id>/', deliveryController.delete_delivery, name='delete_delivery'),
    path('delete-payment/<int:payment_id>/', paymentsController.delete_payment, name='delete_payment'),
    path('delete-order/<int:id>/', orderController.delete_order, name='delete_order'),
    path('delete-supply/<str:supply_id>/', suppliesController.delete_supply, name='delete_supply'),
    path('update_delivery_status/<int:delivery_id>/', deliveryController.update_delivery_status, name='update_delivery_status'),

    # --- customer AJAX endpoints ---
    path("customer/customers_json/", customersController.customers_json, name="customers_json"),

    # --- employees AJAX endpoints ---
    path("employees_json/", employeesController.employees_json, name="employees_json"),

    # --- product AJAX endpoints ---
    path('product/update/', productController.update_product, name='update_product'),
    path('product/delete/', productController.delete_product, name='delete_product'),

    # --- order AJAX endpoints ---
    path("history/orders_json/", orderController.orders_json, name="orders_json"),

    # --- payment AJAX endpoints ---
    path("payment/payments_json/", paymentsController.payments_json, name="payments_json"),

    # -- delivery AJAX endpoints ---
    path("delivery/deliveries_json/", deliveryController.deliveries_json, name="deliveries_json"),

    # -- supply AJAX endpoints ---
    path("supply/supplies_json/", suppliesController.supplies_json, name="supplies_json"),

]
