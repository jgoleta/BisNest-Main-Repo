from django.shortcuts import render, redirect, get_object_or_404
from members.models import Employee
from members.forms import EmployeeForm
from django.http import JsonResponse

def employeesInfoPage(request):
    if request.method == 'POST':
        edit_id = request.POST.get('edit_id')

        if edit_id:  # existing employee edit
            employee = get_object_or_404(Employee, pk=edit_id)
            # mga pdeng iedit
            employee.name = request.POST.get('name', employee.name)
            employee.position = request.POST.get('position', employee.position)
            employee.schedule = request.POST.get('schedule', employee.schedule)
            employee.salary = request.POST.get('salary', employee.salary)
            employee.save()
            return redirect('employeesinfo')

        else:  # create
            form = EmployeeForm(request.POST)
            if form.is_valid():
                form.save()
                return redirect('employeesinfo')  
    else:
        form = EmployeeForm()

    return render(request, 'employeesinfo.html', {
        'form': form,
    })

def employees_json(request):
    employees = Employee.objects.select_related().all()

    data = [{
        "id": e.id,
        "name": e.name,
        "position": e.position,
        "schedule": e.schedule,
        "salary": e.salary,
        "join_date": e.join_date.strftime("%Y-%m-%d"),
    } for e in employees]

    return JsonResponse(data, safe=False)

def delete_employee(request, employee_id):
    if request.method == "POST":
        employee = get_object_or_404(Employee, pk=employee_id)
        employee.delete()
        return JsonResponse({"success": True})
    return JsonResponse({"error": "Invalid request"}, status=400)