from django.urls import path
from django.contrib.auth.decorators import login_required
from backend import index
from backend.controllers import feedbackController

urlpatterns = [
    # --- public---
    path('', index.landingPage, name='landingPage'),
    path('login/', index.login_view, name='login_view'),
    path('logout/', index.logout_view, name='logout_view'),
    path('register/', index.register_view, name='register_view'),
    path('signup/', index.signupPage, name='signupPage'),

    # --- protected---
    path('menu/', login_required(index.menuPage, login_url='/'), name='menu'),
    path('about/', login_required(index.aboutPage, login_url='/'), name='about'),
    path('profile/', login_required(index.profilePage, login_url='/'), name='profile'),
    path('feedback/', login_required(feedbackController.feedbackPage, login_url='/'), name='feedback'),

    # --- crud ---
    path('profile/delete/', index.delete_account_view, name='delete_account'),
]