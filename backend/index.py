from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from members.forms import UserProfileForm
from allauth.socialaccount.models import SocialAccount

# import models used by views in this module
from django.db.models import Sum
from django.utils import timezone
from members.models import Supply, Payment, Order, Customer, Product, Employee

def login_view(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        
        if not email or not password:
            messages.error(request, 'Please enter both email and password.')
            return redirect('landingPage')
        
        try:
            user_obj = User.objects.get(email=email)
            user = authenticate(request, username=user_obj.username, password=password)
            
            if user is not None:
                login(request, user)
                return redirect('menu')  
            else:
                messages.error(request, 'Invalid password.')
                return redirect('landingPage')
                
        except User.DoesNotExist:
            messages.error(request, 'No account found with this email.')
            return redirect('landingPage')
    
    #redirect to landing page
    return redirect('landingPage')

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
    # Get current year and date info
    current_year = timezone.now().year
    thirty_days_ago = timezone.now().date() - timezone.timedelta(days=30)
    
    # Calculate Total Sales (sum of all payment amounts)
    total_sales = Payment.objects.aggregate(total=Sum('amount'))['total'] or 0
    
    # Calculate Total Orders
    total_orders = Order.objects.count()
    
    # Calculate Order Information
    orders_this_month = Order.objects.filter(date__year=current_year, date__month=timezone.now().month).count()
    recent_orders = Order.objects.filter(date__gte=thirty_days_ago).count()
    total_order_value = Order.objects.aggregate(total=Sum('amount'))['total'] or 0
    average_order_value = total_order_value / total_orders if total_orders > 0 else 0
    
    # Calculate Customer Information
    total_customers = Customer.objects.count()
    new_customers = Customer.objects.filter(date_added__gte=thirty_days_ago).count()
    
    # Calculate Sales Information - Monthly and Weekly
    current_month = timezone.now().month
    monthly_sales_amount = Payment.objects.filter(
        date__year=current_year, 
        date__month=current_month
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    # Calculate weekly sales (last 7 days)
    seven_days_ago = timezone.now().date() - timezone.timedelta(days=7)
    weekly_sales = Payment.objects.filter(
        date__gte=seven_days_ago
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    # Calculate Inventory Level (percentage of products with stock > 0)
    total_products = Product.objects.count()
    in_stock_products = Product.objects.filter(stock__gt=0).count()
    inventory_level = int((in_stock_products / total_products) * 100) if total_products > 0 else 0
    
    # Calculate Stock Information
    total_stock_quantity = Product.objects.aggregate(total=Sum('stock'))['total'] or 0
    out_of_stock_products = Product.objects.filter(stock=0).count()
    
    # Calculate Employee Count
    total_employees = Employee.objects.count()
    
    # Calculate Monthly Sales for chart (current year)
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
        'total_customers': total_customers,
        'new_customers': new_customers,
        'inventory_level': inventory_level,
        'monthly_sales': monthly_sales,
        'monthly_sales_amount': monthly_sales_amount,
        'weekly_sales': weekly_sales,
        'total_employees': total_employees,
        'total_products': total_products,
        'total_stock_quantity': total_stock_quantity,
        'in_stock_products': in_stock_products,
        'out_of_stock_products': out_of_stock_products,
        'orders_this_month': orders_this_month,
        'recent_orders': recent_orders,
        'total_order_value': total_order_value,
        'average_order_value': average_order_value,
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
            return redirect('landingPage')

        if User.objects.filter(username=username).exists():
            messages.error(request, "Username already exists!")
            return redirect('landingPage')

        if User.objects.filter(email=email).exists():
            messages.error(request, "Email already registered!")
            return redirect('landingPage')

        user = User.objects.create_user(username=username, email=email, password=password1)
        user.save()

        user = authenticate(username=username, password=password1)
        if user:
            login(request, user)
            return redirect('menu') 
        
        messages.success(request, "Registration successful! Please login.")
        return redirect('landingPage')

    return redirect('landingPage')


def feedbackPage(request):
    return render(request, 'feedback.html')

def profilePage(request):
    user = request.user
    
    #check if user is auth
    if not user.is_authenticated:
        return redirect('login_view')
    
    #get  profile f
    from members.models import UserProfile  
    
    #check if profile exists, create if it doesn't
    if not hasattr(user, 'profile'):
        UserProfile.objects.create(user=user)
        user.refresh_from_db()  #refresh to get profile
    
    profile = user.profile

    google_picture_url = None
    try:
        from allauth.socialaccount.models import SocialAccount
        social_account = SocialAccount.objects.get(user=user, provider='google')
        extra_data = social_account.extra_data
        google_picture_url = extra_data.get('picture')
    except:
        google_picture_url = None
    
    if request.method == 'POST':
        form = UserProfileForm(request.POST, user=user)
        if form.is_valid():
            #update user
            user.username = form.cleaned_data['username']
            user.first_name = form.cleaned_data['first_name']
            user.last_name = form.cleaned_data['last_name']
            user.email = form.cleaned_data['email']
            user.save()
            
            #update UserProfile model fields
            profile.address = form.cleaned_data['address']
            profile.phone = form.cleaned_data['phone']
            profile.birthday = form.cleaned_data['birthday']
            profile.bio = form.cleaned_data['bio']
            profile.save()
            
            return redirect('profile')
        else:
            # Show form errors
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f"{field}: {error}")
    else:
        # Format birthday for HTML date input (YYYY-MM-DD)
        birthday_value = ''
        if profile.birthday:
            birthday_value = profile.birthday.strftime('%Y-%m-%d')
        
        form = UserProfileForm(user=user, initial={
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'address': profile.address if profile.address else '',
            'phone': profile.phone if profile.phone else '',
            'birthday': birthday_value,
            'bio': profile.bio if profile.bio else '',
        })
    
    context = {
        'form': form,
        'user': user,
        'profile': profile,
        'google_picture_url': google_picture_url,
    }
    return render(request, 'profile.html', context)


@login_required
def delete_account_view(request):
    """Delete user account and redirect to landing page"""
    if request.method == 'POST':
        user = request.user
        logout(request)
        user.delete()  #delete linked userprofile
        return redirect('landingPage')
    return redirect('profile')