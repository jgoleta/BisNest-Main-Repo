from members.models import Employee

def get_all_employees_formatted():
    # Use select_related if 'position' or other fields are foreign keys to optimize speed
    employees = Employee.objects.all() 
    
    return [{
        "id": e.id,
        "employee_id": e.employee_id,
        "name": e.name,
        "position": e.position,
        "schedule": e.schedule,
        "salary": e.salary,
        "join_date": e.join_date.strftime("%Y-%m-%d") if e.join_date else "",
    } for e in employees]

def get_distinct_positions():

    return Employee.objects.values_list('position', flat=True).distinct().order_by('position')