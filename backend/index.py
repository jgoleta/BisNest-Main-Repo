from django.shortcuts import render, redirect, get_object_or_404
from members.models import Employee, Customer, Delivery, Payment, Order, Supply, SalesReport
from members.forms import SupplyForm, EmployeeForm, CustomerForm, DeliveryForm, PaymentForm, OrderForm, SalesReportForm
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required


@csrf_exempt
def update_delivery_status(request, delivery_id):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            new_status = data.get('status')

            delivery = Delivery.objects.get(pk=delivery_id)
            previous_status = delivery.status
            delivery.status = new_status
            delivery.save()

            return JsonResponse({'success': True, 'new_status': new_status})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e), 'previous_status': previous_status})
    else:
        return JsonResponse({'success': False, 'error': 'Invalid request'})

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
    return redirect('loginPage')

def loginPage(request):
    return render(request, 'login.html')
    #if request.method == "GET":
    #    return render(request, 'login.html')

   
    #if request.method == "POST":
    #    logout(request)  
    #    return redirect('loginPage') 

def employeesInfoPage(request):
    if request.method == 'POST':
        form = EmployeeForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('employeesInfoPage')  
    else:
        form = EmployeeForm()

    employees = Employee.objects.all() 
    return render(request, 'employeesinfo.html', {
        'form': form,
        'employees': employees
    })

def delete_employee(request, employee_id):
    employee = get_object_or_404(Employee, pk=employee_id)
    employee.delete()
    return redirect('employeesInfoPage')

def menuPage(request):
    return render(request, 'menu.html')


def paymentPage(request):
    if request.method == 'POST':
        form = PaymentForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('paymentPage')
    else:
        form = PaymentForm(initial={
            'payment_id': f'P{Payment.objects.count()+1:04d}'  
        })

    payments = Payment.objects.all()
    return render(request, 'payment.html', {
        'form': form,
        'payments': payments
    })

def delete_payment(request, payment_id):
    payment = get_object_or_404(Payment, pk=payment_id)
    payment.delete()
    return redirect('paymentPage')

def orderHistoryPage(request):
    if request.method == 'POST':
        print("🔸 POST received:", request.POST)
        form = OrderForm(request.POST)
        if form.is_valid():
            print("✅ VALID form")
            order = form.save(commit=False)
            product_map = {
                'Whole Chicken': 'P1',
                'Chicken Feet': 'P2',
                'Chicken Head': 'P3',
                'Chicken Liver': 'P4',
                'Chicken Intestine': 'P5',
                'Chicken Blood': 'P6',
                'Chicken Gizzard': 'P7',
            }
            product_name = form.cleaned_data.get('product_name')
            order.product_id = product_map.get(product_name, 'P0')
            order.save()
            return redirect('orderHistoryPage')
        else:
            print("❌ INVALID form")
            print(form.errors)
    else:
        form = OrderForm(initial={
            'order_id': f"O{Order.objects.count() + 1:04d}"
        })

    orders = Order.objects.all()
    return render(request, 'history.html', {
        'form': form,
        'orders': orders
    })

def delete_order(request, order_id):
    order = get_object_or_404(Order, pk=order_id)
    order.delete()
    return redirect('orderHistoryPage')


def signupPage(request):
    return render(request, 'signup.html')

def customerInfoPage(request):
    if request.method == 'POST':
        form = CustomerForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('customerInfoPage')
    else:
        form = CustomerForm()

    customers = Customer.objects.all()
    return render(request, 'customer.html', {
        'form': form,
        'customers': customers
    })

def delete_customer(request, customer_id):
    customer = get_object_or_404(Customer, pk=customer_id)
    customer.delete()
    return redirect('customerInfoPage')

def productPage(request):
    return render(request, 'product.html')

def deliveryPage(request):
    if request.method == 'POST':
        form = DeliveryForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('deliveryPage')
    else:
        form = DeliveryForm()

    deliveries = Delivery.objects.all()
    return render(request, 'delivery.html', {
        'form': form,
        'deliveries': deliveries
    })

def delete_delivery(request, delivery_id):
    delivery = get_object_or_404(Delivery, pk=delivery_id)
    delivery.delete()
    return redirect('deliveryPage')

def salesPage(request):
    if request.method == 'POST':
        form = SalesReportForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('salesPage')
    else:
        form = SalesReportForm()

    sales = SalesReport.objects.all().order_by('-date')
    return render(request, 'sales.html', {
        'form': form,
        'sales': sales,
    })

def delete_sale(request, sale_id):
    sale = get_object_or_404(SalesReport, pk=sale_id)
    sale.delete()
    return redirect('salesPage')

def supplyPage(request):
    if request.method == 'POST':
        form = SupplyForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('supplyPage')
    else:
        form = SupplyForm(initial={
            'supply_id': f"SUP{Supply.objects.count() + 1:04d}"
        })

    supplies = Supply.objects.all()
    return render(request, 'supply.html', {
        'form': form,
        'supplies': supplies
    })

def aboutPage(request):
    return render(request, 'about.html')

def delete_supply(request, supply_id):
    supply = get_object_or_404(Supply, pk=supply_id)
    supply.delete()
    return redirect('supplyPage')

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

