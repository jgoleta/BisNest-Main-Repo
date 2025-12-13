from django.shortcuts import render, redirect
from members.models import Feedback
from members.forms import FeedbackForm
from django.contrib import messages

def feedbackPage(request):    
    # Clear any existing messages to ensure clean page
    list(messages.get_messages(request))
    
    if request.method == 'POST':
        form = FeedbackForm(request.POST)
        if form.is_valid():
            feedback = form.save(commit=False)
            
            # Add user if logged in
            if request.user.is_authenticated:
                feedback.user = request.user
            
            # Add IP address and user agent
            feedback.ip_address = request.META.get('REMOTE_ADDR')
            feedback.user_agent = request.META.get('HTTP_USER_AGENT', '')
            
            feedback.save()
            
            # No success message - just reset form
            form = FeedbackForm()

            return render(request, 'feedback.html', {
                'form': form,
                'show_success': True  
            })
        else:
            pass
    else:
        form = FeedbackForm()
    
    return render(request, 'feedback.html', {'form': form})
