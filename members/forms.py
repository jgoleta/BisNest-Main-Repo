from django import forms
from .models import Member
from .models import Customer
from .models import Delivery
from .models import Payment
from .models import Order
from .models import Supply
from .models import SalesReport

class MemberForm(forms.ModelForm):
    class Meta:
        model = Member
        fields = ['name', 'position', 'schedule', 'salary']

class CustomerForm(forms.ModelForm):
    class Meta:
        model = Customer
        fields = ['name', 'phone', 'address']


class DeliveryForm(forms.ModelForm):
    class Meta:
        model = Delivery
        fields = '__all__'
        widgets = {
            'delivery_id': forms.TextInput(attrs={'class': 'form-control'}),
            'order_id': forms.TextInput(attrs={'class': 'form-control'}),
            'customer_name': forms.TextInput(attrs={'class': 'form-control'}),
            'address': forms.TextInput(attrs={'class': 'form-control'}),
            'scheduled_date': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date'
            }),
            'status': forms.TextInput(attrs={'class': 'form-control'}),
        }

class PaymentForm(forms.ModelForm):
    class Meta:
        model = Payment
        fields = '__all__'
        widgets = {
            'payment_id': forms.TextInput(attrs={'readonly': True}),
            'customer_name': forms.TextInput(attrs={'placeholder': 'Customer Name'}),
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
            'amount': forms.NumberInput(attrs={'step': 0.01, 'class': 'form-control'}),
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
        fields = ['date', 'product_name', 'quantity_sold', 'price']
        widgets = {
            'date': forms.DateInput(attrs={'type': 'date'}),
            'product_name': forms.TextInput(attrs={'class':'form-control'}),
        }
