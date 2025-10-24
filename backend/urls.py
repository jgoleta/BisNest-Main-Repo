"""
URL configuration for goletan1am project.

- Public routes (login, signup) → backend.index
- Protected routes (menu, employees, etc.) → backend.index with login protection
"""

from django.contrib import admin
from django.urls import path
from django.contrib.auth.decorators import login_required
from backend import index  # ✅ keeps your data + logic in backend
# no need for members.views — we’ll use backend.index directly

urlpatterns = [
    # --- Admin ---
    path('admin/', admin.site.urls),

    # --- Public / Authentication Routes ---
    path('', index.loginPage, name='loginPage'),
    path('login/', index.login_view, name='login_view'),
    path('logout/', index.logout_view, name='logout_view'),
    path('register/', index.register_view, name='register_view'),
    path('signup/', index.signupPage, name='signupPage'),

    # --- Protected Routes (with data + protection) ---
    path('menu/', login_required(index.menuPage, login_url='/login/'), name='menu'),
    path('employeesinfo/', login_required(index.employeesInfoPage, login_url='/login/'), name='employeesinfo'),
    path('history/', login_required(index.orderHistoryPage, login_url='/login/'), name='history'),
    path('payment/', login_required(index.paymentPage, login_url='/login/'), name='payment'),
    path('customer/', login_required(index.customerInfoPage, login_url='/login/'), name='customer'),
    path('product/', login_required(index.productPage, login_url='/login/'), name='product'),
    path('delivery/', login_required(index.deliveryPage, login_url='/login/'), name='delivery'),
    path('supply/', login_required(index.supplyPage, login_url='/login/'), name='supply'),
    path('sales/', login_required(index.salesPage, login_url='/login/'), name='sales'),
    path('about/', login_required(index.aboutPage, login_url='/login/'), name='about'),

    # --- Data Operations (CRUD) ---
    path('employee-info/delete/<int:employee_id>/', index.delete_employee, name='delete_employee'),
    path('customer/delete/<int:customer_id>/', index.delete_customer, name='delete_customer'),
    path('delivery/delete/<int:delivery_id>/', index.delete_delivery, name='delete_delivery'),
    path('delete-payment/<int:payment_id>/', index.delete_payment, name='delete_payment'),
    path('delete-order/<int:order_id>/', index.delete_order, name='delete_order'),
    path('delete-supply/<int:supply_id>/', index.delete_supply, name='delete_supply'),
    path('delete-sale/<int:sale_id>/', index.delete_sale, name='delete_sale'),
    path('update_delivery_status/<int:delivery_id>/', index.update_delivery_status, name='update_delivery_status'),
]
