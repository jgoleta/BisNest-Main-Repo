from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.template import loader
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .forms import ProductForm
from .models import Product, Customer, Employee
from django.http import JsonResponse

# Public
def members(request):
    template = loader.get_template('login.html')
    return HttpResponse(template.render())



#Public


def login_view(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect("menu")  # redirect to protected route
        else:
            messages.error(request, "Invalid username or password.")

    return render(request, "landing.html")  


def logout_view(request):
    logout(request)
    return redirect('landingPage')



# protected


@login_required(login_url='/login/')
def menu_view(request):
    return render(request, "menu.html", {"user": request.user})


@login_required(login_url='/login/')
def employees_view(request):
    employees = Employee.objects.all().order_by('id')
    return render(request, "employeesinfo.html", {"user": request.user, "employees": employees})

@login_required(login_url='/login/')
def employees_json(request):
    employees = Employee.objects.all().order_by('id').values(
        'id', 'employee_id', 'name', 'position', 'schedule', 'salary', 'join_date'
    )
    return JsonResponse(list(employees), safe=False)

@login_required(login_url='/login/')
def history_view(request):
    return render(request, "history.html", {"user": request.user})


@login_required(login_url='/login/')
def payment_view(request):
    return render(request, "payment.html", {"user": request.user})


@login_required(login_url='/login/')
def customer_view(request):
    customers = Customer.objects.all().order_by('id')
    return render(request, "customer.html", {"user": request.user, "customers": customers})


@login_required(login_url='/login/')
def product_view(request):
    # Handle add-product form submission
    if request.method == 'POST':
        form = ProductForm(request.POST, request.FILES)
        if form.is_valid():
            # assign a new unique product_id like P01, P02 ...
            max_num = 0
            products = Product.objects.all()
            for p in products:
                try:
                    num = int(p.product_id.replace('P', ''))
                    if num > max_num:
                        max_num = num
                except Exception:
                    continue
            new_product = form.save(commit=False)
            new_product.product_id = 'P' + str(max_num + 1).zfill(2)
            new_product.save()
            messages.success(request, 'Product added successfully.')
            return redirect('product')
    else:
        form = ProductForm()

    products = Product.objects.all()
    return render(request, "product.html", {"user": request.user, "form": form, "products": products})


@login_required(login_url='/login/')
def about_view(request):
    return render(request, "about.html", {"user": request.user})
