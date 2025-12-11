"""
URL configuration for bisnest project.

"""
from django.urls import path, include

urlpatterns = [
    
    path('', include('backend.routes.indexRoutes')),
    path('admin', include('backend.routes.adminRoutes')),
    path('customer', include('backend.routes.customerRoutes')),
    path('delivery', include('backend.routes.deliveryRoutes')),
    path('employee', include('backend.routes.employeesRoutes')),
    path('order', include('backend.routes.orderRoutes')),
    path('payment', include('backend.routes.paymentRoutes')),
    path('product', include('backend.routes.productRoutes')),
    path('sales', include('backend.routes.salesrepRoutes')),
    path('supply', include('backend.routes.supplyRoutes')),

]
