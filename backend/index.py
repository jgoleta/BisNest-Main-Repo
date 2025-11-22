from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required

# import models used by views in this module
from members.models import Supply

def login_view(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        from django.contrib.auth.models import User
        try:
            user_obj = User.objects.get(email=email)
            username = user_obj.username
        except User.DoesNotExist:
            username = None
        user = authenticate(request, username=username, password=password) if username else None
        if user is not None:
            login(request, user)
            return redirect('menu')  
        else:
            messages.error(request, 'Invalid email or password.')
    return render(request, 'login.html')

def logout_view(request):
    logout(request)
    return render(request, 'login.html')

def loginPage(request):
    return render(request, 'login.html')
    #if request.method == "GET":
    #    return render(request, 'login.html')

def landingPage(request):
    return render(request, 'landing.html')
   
    #if request.method == "POST":
    #    logout(request)  
    #    return redirect('loginPage') 

def menuPage(request):
    return render(request, 'menu.html')

def signupPage(request):
    return render(request, 'signup.html')

def aboutPage(request):
    return render(request, 'about.html')


@login_required
def adminSettingsPage(request):
    """Render the admin settings/dashboard page. Protected by login_required in urls.py."""
    # You can add context data here as needed for metrics, activity logs, etc.
    context = {
        # placeholders for JS to fill or backend to populate
        'total_users': User.objects.count(),
    }
    return render(request, 'admin.html', context)

def delete_supply(request, supply_id):
    supply = get_object_or_404(Supply, pk=supply_id)
    supply.delete()
    return redirect('supply')

def register_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password1 = request.POST.get('password1')
        password2 = request.POST.get('password2')

        if password1 != password2:
            messages.error(request, "Passwords don't match!")
            return redirect('login_view')

        if User.objects.filter(username=username).exists():
            messages.error(request, "Username already exists!")
            return redirect('login_view')

        if User.objects.filter(email=email).exists():
            messages.error(request, "Email already registered!")
            return redirect('login_view')

        user = User.objects.create_user(username=username, email=email, password=password1)
        user.save()
        messages.success(request, "Registration successful! Please login.")
        return redirect('login_view')

    return redirect('login_view')

