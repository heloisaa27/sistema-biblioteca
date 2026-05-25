"""
URL configuration for biblioteca project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from core.views import home

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')),
    path('login.html', TemplateView.as_view(template_name='login.html')),
    path('', home),
    path('dashboard.html', home),
    path('emprestimos.html', TemplateView.as_view(template_name='emprestimos.html')),
    path('emprestimo-form.html', TemplateView.as_view(template_name='emprestimo-form.html')),
    path('livros.html', TemplateView.as_view(template_name='livros.html')),
    path('livro-form.html', TemplateView.as_view(template_name='livro-form.html')),
    path('usuarios.html', TemplateView.as_view(template_name='usuarios.html')),
    path('usuarios-form.html', TemplateView.as_view(template_name='usuarios-form.html')),
]
