from django.urls import path
from django.contrib.auth.decorators import login_required
from backend.controllers import salesreportController

urlpatterns = [
    path('/', login_required(salesreportController.salesPage, login_url='/'), name='sales'),

]