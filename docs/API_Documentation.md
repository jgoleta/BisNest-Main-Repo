# BISNEST API DOCUMENTATION / References

# This documentation is a guide, and quick explanation and demonstration of the API's used in the project "BisNest". Bisnest's core functions are managing customers, employees, products, orders, payments, deliveries, supplies, and sales. The content of this documentation shows how each of the core function of the project is connected from frontend to backend, CRUD, alerts, and signals operations.

**Base URL:** `http://localhost:8000/`
**Authentication:** All endpoints require a logged-in user session (Standard Django Session Auth).
**Response Format:** JSON

---
## 1. Customers & Employees

Get Customer List
Returns formatted customer data for data tables.

URL: customer/customers_json/

Method: GET

Success Response (200 OK):

JSON

[
  {
    "id": 1,
    "customer_id": "CUST001",
    "name": "John Doe Construction",
    "phone": "09123456789",
    "address": "123 Main St, Manila",
    "date_added": "2023-10-25"
  }
]

Get Employee List
Returns all active employees.

URL: employee/employees_json/

Method: GET

Success Response (200 OK):

JSON

[
  {
    "id": 3,
    "employee_id": "EMP003",
    "name": "Maria Clara",
    "position": "Sales Manager",
    "schedule": "Mon-Fri 9AM-5PM",
    "salary": "25000.00",
    "join_date": "2023-01-15"
  }
]

Add Employee / Customer
Adds employee using form class method in the HTML that sends post request to the same URL of the page which is:

URL: /employee/ & /customer/

Method: POST

Payload: 
[
    {
        "name"
        "position"
        "schedule"
        "salary"
        "join_date"
    }
]
ID and employee_id for employee, and customer_id for customer is excluded because it is auto-generated

Delete Employee and Customer
Permanently removes an employee or customer record.

URL: /delete_employee/<id>/ for employee
URL: /delete_customer/<id>/ or /delete/<id>/ for customer

Method: POST

## 2. Products

### **Get All Products**
Returns a list of all available products including current stock levels, and price. Fetching Product is different as it queries Django .objects.all() and passing it to the html using template tags

* **For Further Information Refer to Django API Docs** 
* **Auth Required:** Yes

**Success Response (200 OK):**
**Product Data**
[
  {
    "id": "1",
    "product_id": "PROD001",
    "name": "ROG Monitor",
    "stock": 150,
    "price": "250.00",
  },
  {
    "id": "2",
    "product_id": "PROD002",
    "name": "Razer Gaming Mouse",
    "stock": 45,
    "price": "500.00",
  }
]

### **Check Low Stock Alerts**
Checks inventory for items that have fallen below the baseline threshold (e.g., 20% of baseline) but is currently set 100 as default.

URL: product/low_stock/

Method: GET

Success Response (200 OK):

JSON

{
  "alerts": [
    {
      "product_id": "PROD002",
      "name": "Cement Bags",
      "stock": 45,
      "baseline_stock": 100,
      "alert_threshold": 20,
      "percent_remaining": 20.0
    }
  ]
}

## ** Add Product
Add new product using form method

URL: /product/
METHOD: POST

Payload
{
    [
        "name": "RTX 5090",
        "stock": 20,
        "price": 599990.0,
        "description": "Expensive af GPU"
    ]
}

## ** Edit Product
Edit products using the same form method that using django api, supabase api .save()

Form Payload
{
    [
        "name": "RTX 5090",
        "stock": 50,
        "price": 500.0,
        "description": "Best GPU"
    ]
}

## 3. Orders
### ** Get Order History
Returns a comprehensive list of all past orders, including nested customer and employee details.

URL: order/orders_json/

Method: GET

Success Response (200 OK):

JSON

[
  {
    "id": 52,
    "order_id": "ORD0052",
    "customer": { "id": 15, "name": "John Doe Construction" },
    "employee": { "id": 3, "name": "Maria Clara" },
    "items": [
      { "product_name": "8Gb Ram", "quantity": 5 }
    ],
    "total_amount": 2500.50,
    "date": "2023-11-05"
  }
]

## ** Create New Order
Creates a new order from the shopping cart. This endpoint automatically validates and deducts stock from the inventory.

URL: order/create/

Method: POST

Content-Type: application/json

Request Body: JSON

{
  "customer_id": 15,
  "employee_id": 3,
  "cart_items": [
    {
      "productId": 101,
      "quantity": 5
    },
    {
      "productId": 104,
      "quantity": 2
    }
  ]
}

Success Response (200 OK):

JSON

{
  "order_id": "ORD0052",
  "total_amount": 2500.50
}

Error Response (400 Bad Request): Occurs if stock is insufficient.

JSON

{
  "error": "Not enough stock for Cement Bags. Available: 1"
}

## ** Delete Order
Deletes specific order

URL: order/delete-order/<id>/
METHOD: POST

## 4. Deliveries
## ** Get Deliveries
Returns a list of scheduled deliveries linked to specific orders.

URL: delivery/deliveries_json/

Method: GET

Success Response (200 OK):

JSON

[
  {
    "id": 1,
    "delivery_id": "DEL001",
    "order": { "id": 52, "order_id": "ORD0052" },
    "customer": {
      "id": 15,
      "name": "Pading Villareal",
      "address": "Camaligan, Gainza"
    },
    "scheduled_date": "2025-12-12",
    "status": "Pending"
  }
]

## ** Update Delivery Status
Updates the tracking status of a specific delivery.

URL: delivery/update_delivery_status/<id>/

Method: POST

Content-Type: application/json

Request Body:

JSON

{
  "status": "Shipped"
}
Valid Statuses: "Pending", "Shipped", "Delivered", "Cancelled"

Success Response (200 OK):

JSON

{
  "success": true,
  "new_status": "Shipped"
}

## ** Delete Deliveries
Deletes delivery

URL: delivery/delete/<id>/
METHOD: POST

## 5. Supplies (Inventory Inbound)
## ** Get Supply History
Returns a log of all supply deliveries (stock-ins) from suppliers.

URL: supply/supplies_json/

Method: GET

Success Response (200 OK):

JSON

[
  {
    "id": 10,
    "supply_id": "SUP0010",
    "supplier": "NVIDIA",
    "product": {
      "id": 101,
      "name": "RTX 5090"
    },
    "quantity": 500,
    "date": "2023-11-01",
    "price": "125000.00"
  }
]

## ** Delete Supply Record
Removes a supply log entry.

URL: supply/delete_supply/<id>/

Method: POST

## 6. Payments
## ** Get Payments
Returns a list of payments received.

URL: payment/payments_json/

Method: GET

Success Response (200 OK):

JSON

[
  {
    "id": 101,
    "payment_id": "P0005",
    "order": { "id": 52, "order_id": "ORD0052" },
    "customer": { "id": 15, "name": "Pading Villareal" },
    "amount": 2500.50,
    "date": "2023-11-05",
    "method": "Cash"
  }
]

## ** Delete Payment
Deletes a payment and cascades deletion to associated Sales Reports.

URL: payment/delete_payment/<id>/

Method: POST

Success Response (200 OK):

JSON

{
  "success": true
}

## Automatic Stock Changes
Automatic Stock Changes were implemented using DJANGO API so refer to DJANGO Official API Docs

URL: https://docs.djangoproject.com/en/5.2/ref/signals/

Also include 

For form methods as mentioned in this document
URL: https://docs.djangoproject.com/en/5.2/ref/forms/

For Django database API
URL: https://docs.djangoproject.com/en/5.2/ref/databases/

For Django Templates as mentioned in this document
URL: https://docs.djangoproject.com/en/5.2/ref/templates/

Extra external API:
DJANGO: https://docs.djangoproject.com/en/5.2/ref/
SUPABASE: https://supabase.com/docs/guides/api
Google: https://developers.google.com/identity/protocols/oauth2