from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required

# import models used by views in this module
from django.db.models import Sum
from django.utils import timezone
from members.models import Supply, Payment, Order, Customer, Product

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
    return redirect("landingPage")

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
    # Calculate Total Sales (sum of all payment amounts)
    total_sales = Payment.objects.aggregate(total=Sum('amount'))['total'] or 0
    
    # Calculate Total Orders
    total_orders = Order.objects.count()
    
    # Calculate New Customers (last 30 days)
    thirty_days_ago = timezone.now().date() - timezone.timedelta(days=30)
    new_customers = Customer.objects.filter(date_added__gte=thirty_days_ago).count()
    
    # Calculate Inventory Level (percentage of products with stock > 0)
    total_products = Product.objects.count()
    in_stock_products = Product.objects.filter(stock__gt=0).count()
    inventory_level = int((in_stock_products / total_products) * 100) if total_products > 0 else 0
    
    # Calculate Monthly Sales for chart (current year)
    current_year = timezone.now().year
    monthly_sales = [0] * 12
    payments_by_month = (
        Payment.objects.filter(date__year=current_year)
        .values('date__month')
        .annotate(total=Sum('amount'))
    )
    for entry in payments_by_month:
        if entry['date__month']:
            month_index = entry['date__month'] - 1
            if 0 <= month_index < 12:
                monthly_sales[month_index] = float(entry['total'] or 0)
    
    context = {
        'total_sales': total_sales,
        'total_orders': total_orders,
        'new_customers': new_customers,
        'inventory_level': inventory_level,
        'monthly_sales': monthly_sales,
    }
    return render(request, 'menu.html', context)

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


def feedbackPage(request):
    return render(request, 'feedback.html')

def profilePage(request):
    return render(request, 'profile.html')