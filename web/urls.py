from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('productos/', views.productos, name='productos'),
    path('uso/', views.uso, name='uso'),
    path('canva/', views.canva, name='canva'),
    path('gratis/', views.gratis, name='gratis'),
    path('contacto/', views.contacto, name='contacto'),
]
