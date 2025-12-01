import re

from django.db import models
from django.utils.timezone import now

STATUS_CHOICES = [
    ('Pending', 'Pending'),
    ('Delivered', 'Delivered'),
    ('Cancelled', 'Cancelled'),
]

class Employee(models.Model):
    employee_id = models.CharField(max_length=10, unique=True, blank=True, null=True)
    name = models.CharField(max_length=255)
    position = models.CharField(max_length=100, default="Staff")
    schedule = models.CharField(max_length=100, default="9AM-5PM")
    salary = models.DecimalField(max_digits=10, decimal_places=2, default=500.00)
    join_date = models.DateField(default=now)

    def save(self, *args, **kwargs):
        if not self.employee_id:
            last_employee = Employee.objects.order_by('-id').first()
            if last_employee and last_employee.employee_id:
                try:
                    last_number = int(last_employee.employee_id.replace('EMP', ''))
                except ValueError:
                    last_number = 0
                new_number = last_number + 1
            else:
                new_number = 1

            self.employee_id = f'EMP{str(new_number).zfill(5)}'

        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Employee Info"
        verbose_name_plural = "Employee Info"
        ordering = ['id']

class Customer(models.Model):
    customer_id = models.CharField(max_length=10, unique=True, blank=True, null=True)
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    address = models.TextField()
    date_added = models.DateField(default=now)

    class Meta:
        ordering = ['id']

    def save(self, *args, **kwargs):
        if not self.customer_id:
            last_customer = Customer.objects.order_by('-id').first()
            if last_customer and last_customer.customer_id:
                try:
                    last_number = int(last_customer.customer_id.replace('CUS', ''))
                except ValueError:
                    last_number = 0
                new_number = last_number + 1
            else:
                new_number = 1

            self.customer_id = f'CUS{str(new_number).zfill(4)}'

        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Product(models.Model):
    product_id = models.CharField(max_length=10, unique=True, blank=True, null=True)
    name = models.CharField(max_length=255)
    stock = models.IntegerField(default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='products/', null=True, blank=True)

    def save(self, *args, **kwargs):
            if not self.product_id:
                new_number = 1
                last_product = Product.objects.order_by('-id').first()
                if last_product and last_product.product_id:
                    try:
                        # Extract number from product_id 
                        last_number = int(last_product.product_id.replace('PRD', ''))
                    except ValueError:
                        last_number = 0
                    new_number = last_number + 1
                
                self.product_id = f'PRD{str(new_number).zfill(5)}'

            super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Order(models.Model):
    order_id = models.CharField(max_length=10, unique=True, blank=True, null=True)
    customer = models.ForeignKey('Customer', on_delete=models.CASCADE, null=True, blank=True)
    employee = models.ForeignKey('Employee', on_delete=models.CASCADE, null=True, blank=True)
    product = models.ForeignKey('Product', on_delete=models.CASCADE, null=True, blank=True)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    date = models.DateField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.order_id:
            last_order = Order.objects.order_by('-id').first()
            if last_order and last_order.order_id:
                try:
                    # Extract number from order_id (handles both O0001 and ORD0001 formats)
                    order_id_str = last_order.order_id.replace('ORD', '').replace('O', '')
                    last_number = int(order_id_str) if order_id_str.isdigit() else 0
                except ValueError:
                    last_number = 0
                new_number = last_number + 1
            else:
                new_number = 1
            self.order_id = f'ORD{new_number:04d}'

        #compute function
        if self.product and self.quantity:
            self.amount = self.product.price * self.quantity

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.order_id}"

    class Meta:
        ordering = ['-date']

class Payment(models.Model):
    payment_id = models.CharField(max_length=10, unique=True, null=True, blank=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField(auto_now_add=True)
    method = models.CharField(max_length=50)

    def save(self, *args, **kwargs):
        if not self.payment_id:
            last = Payment.objects.order_by('-id').first()
            new_id = f'P{(int(last.payment_id[1:]) + 1) if last and last.payment_id else 1:02d}'
            self.payment_id = new_id
        super().save(*args, **kwargs)
    
    def outstandingBalance(self):
        return f"Outstanding Balance: {self.amount - self.order.amount}"
    
    def __str__(self):
        return self.payment_id

class Delivery(models.Model):
    delivery_id = models.CharField(max_length=20, unique=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, null=True, blank=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, null=True, blank=True)
    scheduled_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')

    def save(self, *args, **kwargs):
        model_cls = self.__class__
        if not self.delivery_id or (not self.pk and model_cls.objects.filter(delivery_id=self.delivery_id).exists()):
            self.delivery_id = model_cls.get_next_delivery_id()
        super().save(*args, **kwargs)

    @classmethod
    def get_next_delivery_id(cls):
        prefix = 'DEL'
        last_delivery = cls.objects.order_by('-id').first()
        next_number = 1

        if last_delivery and last_delivery.delivery_id:
            match = re.search(r'(\d+)$', last_delivery.delivery_id)
            if match:
                next_number = int(match.group(1)) + 1

        return f'{prefix}{next_number:04d}'

    def __str__(self):
        cust = self.customer.name if self.customer else "Unknown"
        return f"{self.delivery_id} - {cust}"

class Supply(models.Model):
    supply_id = models.CharField(max_length=20, unique=True)
    supplier = models.CharField(max_length=100)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=True)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    date = models.DateField()
    
    def __str__(self):
        product_name = self.product.name if self.product else "Unknown"
        return f"{self.supply_id} - {product_name} ({self.quantity}kg)"

class SalesReport(models.Model):
    date = models.DateField()
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, null=True, blank=True)    
    
    @property
    def total(self):
        return self.payment.order.quantity
    
    @property
    def profit(self):
        return self.payment.amount

    def __str__(self):
        pname = self.product.name if self.product else "Unknown"
        return f"{self.date} - {pname}"