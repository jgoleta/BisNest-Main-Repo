from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader

def members(request):
    login = loader.get_template('login.html')
    template = loader.get_template('employeesinfo.html')
    return HttpResponse(login.render())

# Create your views here.
    
def about(request):
    return render(request, 'about.html')