from django.shortcuts import render, redirect, get_object_or_404
from members.models import Employee
from members.forms import EmployeeForm
from backend.services import employeeServices as services
from django.http import JsonResponse

def employeesInfoPage(request):
    if request.method == 'POST':
        edit_id = request.POST.get('edit_id')

        if edit_id:
            # EDIT MODE: Fetch object and bind to form with 'instance'
            employee = get_object_or_404(Employee, pk=edit_id)
            form = EmployeeForm(request.POST, instance=employee)
        else:
            # CREATE MODE: Bind new data to form
            form = EmployeeForm(request.POST)

        # Unified save logic for both Create and Edit
        if form.is_valid():
            form.save()
            return redirect('employee')

    # --- GET REQUEST (Load Page) ---
    else:
        form = EmployeeForm()

    # Call service for the dropdown data
    positions = services.get_distinct_positions()
    
    return render(request, 'employeesinfo.html', {
        'form': form,
        'positions': positions
    })

def employees_json(request):
    # Call service for the JSON data
    data = services.get_all_employees_formatted()
    return JsonResponse(data, safe=False)

def delete_employee(request, employee_id):
    if request.method == "POST":
        employee = get_object_or_404(Employee, pk=employee_id)
        employee.delete()
        return JsonResponse({"success": True})
    return JsonResponse({"error": "Invalid request"}, status=400)