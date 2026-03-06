from django.shortcuts import render


def home(request):
    return render(request, 'web/index.html', {'page': 'inicio'})


def productos(request):
    return render(request, 'web/productos.html', {'page': 'productos'})


def uso(request):
    return render(request, 'web/uso.html', {'page': 'uso'})


def canva(request):
    return render(request, 'web/canva.html', {'page': 'canva'})


def gratis(request):
    return render(request, 'web/gratis.html', {'page': 'gratis'})


def contacto(request):
    return render(request, 'web/contacto.html', {'page': 'contacto'})
