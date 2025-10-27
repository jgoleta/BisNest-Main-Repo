from django.db import models
from django.utils.timezone import now

STATUS_CHOICES = [
    ('Pending', 'Pending'),
    ('Delivered', 'Delivered'),
    ('Cancelled', 'Cancelled'),
]

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

class Product(models.Model):
    product_id = models.CharField(max_length=10, unique=True, blank=True, null=True)
    name = models.CharField(max_length=255)
    stock = models.IntegerField(default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='products/', null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.product_id:
            last = Product.objects.order_by('-id').first()
            new_id = f'PR{(int(last.product_id[1:]) + 1) if last and last.product_id else 1:02d}'
            self.product_id = new_id
        super().save(*args, **kwargs)


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
                    last_number = int(last_order.order_id[1:])  
                except ValueError:
                    last_number = 0
                new_number = last_number + 1
            else:
                new_number = 1
            self.order_id = f'O{new_number:02d}'

        # Auto-compute Function
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