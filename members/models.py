from django.db import models
from django.utils.timezone import now  

class Employee(models.Model):
    name = models.CharField(max_length=255)
    position = models.CharField(max_length=100, default="Staff")
    schedule = models.CharField(max_length=100, default="9AM-5PM")
    salary = models.DecimalField(max_digits=10, decimal_places=2, default=500.00)
    join_date = models.DateField(default=now) 

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Employee Info"
        verbose_name_plural = "Employee Info"

class Customer(models.Model):
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    address = models.TextField()

    def __str__(self):
        return self.name
    
class Delivery(models.Model):
    delivery_id = models.CharField(max_length=20)
    order_id = models.CharField(max_length=20)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, null=True, blank=True)
    scheduled_date = models.DateField()
    status = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.delivery_id} - {self.customer}"
    
class Product(models.Model):
    name = models.CharField(max_length=255)
    product = models.ForeignKey(Customer, on_delete=models.CASCADE, null=True, blank=True)
    stock = models.IntegerField(default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.name} - {self.stock} - {self.price}"
    
    class Meta:
        ordering = ['name']
    
class Order(models.Model):
    order_id = models.CharField(max_length=10, unique=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, null=True, blank=True)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, null=True, blank=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()

    def __str__(self):
        return f"{self.customer.id} - {self.product.id} - {self.date}"
    
class Payment(models.Model):
    payment_id = models.CharField(max_length=10, unique=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    date = models.DateField()
    method = models.CharField(max_length=50)

    def __str__(self):
        return self.payment_id
    
class Supply(models.Model):
    supply_id = models.CharField(max_length=20, unique=True)
    supplier = models.CharField(max_length=100)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=True)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()

    def __str__(self):
        return f"{self.supply_id} - {self.product} ({self.quantity}kg)"
    
class SalesReport(models.Model):
    date = models.DateField()
    product = models.ForeignKey(Customer, on_delete=models.CASCADE, null=True, blank=True)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, null=True, blank=True)
    quantity_sold = models.DecimalField(max_digits=10, decimal_places=2)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    @property
    def total(self):
        return self.quantity_sold * self.price

    def __str__(self):
        return f"{self.date} - {self.product.name}"
        
STATUS_CHOICES = [
    ('Pending', 'Pending'),
    ('Delivered', 'Delivered'),
    ('Cancelled', 'Cancelled'),
]

status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
