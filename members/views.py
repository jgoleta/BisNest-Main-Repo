from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.template import loader
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages


# Public landing page
def members(request):
    """
    Default route (renders login page by default)
    """
    template = loader.get_template('login.html')
    return HttpResponse(template.render())



#PUBLIC VIEWS


def login_view(request):
    """
    Handle user login.
    - Authenticates username/password
    - On success → redirects to /menu/
    - On failure → reloads login page with error message
    """
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
    """
    Log the user out and redirect to login page.
    """
    logout(request)
    return redirect("login")



# protected views


@login_required(login_url='/login/')
def menu_view(request):
    """
    Protected page. Only accessible if logged in.
    """
    return render(request, "menu.html", {"user": request.user})


@login_required(login_url='/login/')
def employees_view(request):
    """
    Example of another protected page (employees info)
    """
    return render(request, "employeesinfo.html", {"user": request.user})


@login_required(login_url='/login/')
def history_view(request):
    """
    Example protected order history page
    """
    return render(request, "history.html", {"user": request.user})


@login_required(login_url='/login/')
def payment_view(request):
    """
    Example protected payment page
    """
    return render(request, "payment.html", {"user": request.user})


@login_required(login_url='/login/')
def customer_view(request):
    """
    Example protected customer page
    """
    return render(request, "customer.html", {"user": request.user})


@login_required(login_url='/login/')
def product_view(request):
    """
    Example protected product page
    """
    return render(request, "product.html", {"user": request.user})


@login_required(login_url='/login/')
def about_view(request):
    """
    Example protected about page
    """
    return render(request, "about.html", {"user": request.user})
