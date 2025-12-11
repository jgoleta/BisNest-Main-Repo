from django.contrib import admin
from django.urls import path, include
from django.contrib.auth.decorators import login_required
from backend import index

urlpatterns = [
    # --- Admin ---
    path('/', admin.site.urls),
    path('/accounts/', include("allauth.urls")),  # allauth URLs

    # -- Protected
    path('/admin-settings/', login_required(index.adminSettingsPage, login_url='/'), name='admin_settings'),

]