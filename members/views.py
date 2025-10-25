from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.http import JsonResponse
from django.template import loader
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Product


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

    return render(request, "login.html")  # show login form


def logout_view(request):
    logout(request)
    return redirect("login")

# def get_product_price(request, pk):
#     product = Product.objects.get(pk=pk)
#     return JsonResponse({'price': float(product.price)})

# protected

@login_required(login_url='/login/')
def menu_view(request):
    return render(request, "menu.html", {"user": request.user})


@login_required(login_url='/login/')
def employees_view(request):
    return render(request, "employeesinfo.html", {"user": request.user})


@login_required(login_url='/login/')
def history_view(request):
    return render(request, "history.html", {"user": request.user})


@login_required(login_url='/login/')
def payment_view(request):
    return render(request, "payment.html", {"user": request.user})


@login_required(login_url='/login/')
def customer_view(request):
    return render(request, "customer.html", {"user": request.user})


@login_required(login_url='/login/')
def product_view(request):
    return render(request, "product.html", {"user": request.user})


@login_required(login_url='/login/')
def about_view(request):
    return render(request, "about.html", {"user": request.user})
