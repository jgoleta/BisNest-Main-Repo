from django import forms
from .models import Employee
from .models import Customer
from .models import Delivery
from .models import Payment
from .models import Order
from .models import Supply
from .models import SalesReport
from .models import Product

class EmployeeForm(forms.ModelForm):
    class Meta:
        model = Employee
        fields = ['name', 'position', 'schedule', 'salary']

class CustomerForm(forms.ModelForm):
    class Meta:
        model = Customer
        fields = ['name', 'phone', 'address']

class ProductForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = ['name', 'stock', 'price', 'image']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'id': 'add-product-name'
            }),
            'stock': forms.NumberInput(attrs={
                'class': 'form-control',
                'id': 'add-product-stock',
                'min': 0
            }),
            'price': forms.NumberInput(attrs={
                'class': 'form-control',
                'id': 'add-product-price',
                'step': 0.01
            }),
            'image': forms.ClearableFileInput(attrs={
                'class': 'form-control-file',
                'id': 'add-product-image',
                'accept': 'image/*',
                'onchange': 'previewAddImage(event)'
            }),
        }

class DeliveryForm(forms.ModelForm):
    delivery_id = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'readonly': True})
    )

    class Meta:
        model = Delivery
        fields = '__all__'
        widgets = {
            'order': forms.Select(attrs={'class': 'form-control'}),
            'customer': forms.Select(attrs={'class': 'form-control'}),
            'scheduled_date': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date'
            }),
            'status': forms.Select(attrs={'class': 'form-control'}),
        }

class PaymentForm(forms.ModelForm):
    class Meta:
        model = Payment
        fields = '__all__'
        widgets = {
            'payment_id': forms.TextInput(attrs={'readonly': True}),
            'order': forms.Select(attrs={'placeholder': 'Order ID'}),
            'amount': forms.NumberInput(attrs={'placeholder': 'Amount'}),
            'date': forms.DateInput(attrs={'type': 'date'}),
            'method': forms.Select(choices=[('', 'Select Method'), ('Bank Transfer', 'Bank Transfer'), ('Cash', 'Cash')]),
        }

class OrderForm(forms.ModelForm):
    class Meta:
        model = Order
        fields = '__all__'
        widgets = {
            'order_id': forms.TextInput(attrs={'readonly': True, 'class': 'form-control'}),
            'customer_name': forms.TextInput(attrs={'class': 'form-control'}),
            'employee_name': forms.TextInput(attrs={'class': 'form-control'}),
            'product_name': forms.TextInput(attrs={'class': 'form-control'}),
            'amount': forms.NumberInput(attrs={'readonly': True,'placeholder': 'Automatically Computed', 'class': 'form-control'}),
            'date': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
        }

class SupplyForm(forms.ModelForm):
    class Meta:
        model = Supply
        fields = '__all__'
        widgets = {
            'supply_id': forms.TextInput(attrs={'readonly': True, 'class': 'form-control'}),
            'supplier': forms.TextInput(attrs={'class': 'form-control'}),
            'product': forms.Select(attrs={'class': 'form-control'}),
            'quantity': forms.NumberInput(attrs={'class': 'form-control', 'step': 0.01, 'placeholder': 'Enter quantity'}),
            'date': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            'price': forms.NumberInput(attrs={'class': 'form-control', 'step': 0.01, 'placeholder': '0.00'}),
        }


class SalesReportForm(forms.ModelForm):
    class Meta:
        model = SalesReport
        fields = ['date', 'payment']
        widgets = {
            'date': forms.DateInput(attrs={'type': 'date'}),
            'payment': forms.TextInput(attrs={'class':'form-control'}),
        }
