from django import forms
from .models import Employee
from .models import Customer
from .models import Delivery
from .models import Payment
from .models import Order
from .models import Supply
from .models import SalesReport
from .models import Product
from .models import UserProfile
from .models import Feedback
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User


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
        fields = ['name', 'description', 'stock', 'price', 'image']
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
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'id': 'add-product-description',
                'rows': 3
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
            'customer': forms.Select(attrs={'class': 'form-control'}),
            'employee': forms.Select(attrs={'class': 'form-control'}),
            'product': forms.Select(attrs={'class': 'form-control'}),
            'quantity': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01', 'min': '0.01'}),
            'amount': forms.NumberInput(attrs={'readonly': True, 'placeholder': 'Automatically Computed', 'class': 'form-control'}),
            'date': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
        }

class SupplyForm(forms.ModelForm):
    supply_id = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={'readonly': True, 'class': 'form-control'})
    )
    
    class Meta:
        model = Supply
        fields = '__all__'
        widgets = {
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


class UserProfileForm(forms.ModelForm):
    username = forms.CharField(max_length=150, required=True)
    first_name = forms.CharField(max_length=30, required=False)
    last_name = forms.CharField(max_length=30, required=False)
    email = forms.EmailField(required=True)
    
    class Meta:
        model = UserProfile
        fields = ['address', 'phone', 'birthday', 'bio']
        widgets = {
            'birthday': forms.DateInput(attrs={'type': 'date'}),
            'bio': forms.Textarea(attrs={'rows': 4}),
        }
    
    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        
        if self.user:
            self.fields['username'].initial = self.user.username
            self.fields['first_name'].initial = self.user.first_name
            self.fields['last_name'].initial = self.user.last_name
            self.fields['email'].initial = self.user.email
    
    def clean_username(self):
        username = self.cleaned_data['username']
        if username != self.user.username and User.objects.filter(username=username).exists():
            raise ValidationError("Username already exists!")
        return username
    
    def clean_email(self):
        email = self.cleaned_data['email']
        if email != self.user.email and User.objects.filter(email=email).exists():
            raise ValidationError("Email already registered!")
        return email
    

class FeedbackForm(forms.ModelForm):
    class Meta:
        model = Feedback
        fields = ['nps_score', 'satisfaction', 'message', 'user_type']
        widgets = {
            'message': forms.Textarea(attrs={
                'rows': 4,
                'placeholder': 'Your message...',
                'class': 'feedback-textarea'
            }),
            'user_type': forms.Select(attrs={'class': 'feedback-select'}),
            'nps_score': forms.HiddenInput(),
            'satisfaction': forms.HiddenInput(),
        }