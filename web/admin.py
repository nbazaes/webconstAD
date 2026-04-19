from django.contrib import admin
from .models import (
	Categoria,
	Coleccion,
	Descarga,
	Orden,
	OrdenItem,
	PerfilCliente,
	Producto,
	SuscriptorAnonimo,
)


@admin.register(Coleccion)
class ColeccionAdmin(admin.ModelAdmin):
	list_display = ("id", "nombre", "slug")
	search_fields = ("nombre", "slug")
	prepopulated_fields = {"slug": ("nombre",)}


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
	list_display = ("id", "nombre", "slug", "es_gratuita")
	search_fields = ("nombre", "slug")
	prepopulated_fields = {"slug": ("nombre",)}
	list_filter = ("es_gratuita",)


@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
	list_display = ("id", "nombre", "precio", "es_gratuito", "activo", "categoria", "coleccion")
	list_filter = ("es_gratuito", "activo", "categoria", "coleccion")
	search_fields = ("nombre", "slug")
	prepopulated_fields = {"slug": ("nombre",)}


@admin.register(PerfilCliente)
class PerfilClienteAdmin(admin.ModelAdmin):
	list_display = ("id", "user", "rol", "nombre", "apellido", "pais")
	list_filter = ("rol",)
	search_fields = ("user__username", "user__email", "nombre", "apellido")


class OrdenItemInline(admin.TabularInline):
	model = OrdenItem
	extra = 0


@admin.register(Orden)
class OrdenAdmin(admin.ModelAdmin):
	list_display = ("id", "user", "estado", "total", "pasarela", "moneda", "created_at")
	list_filter = ("estado", "pasarela", "moneda")
	search_fields = ("user__username", "user__email", "pasarela_orden_id")
	inlines = [OrdenItemInline]


@admin.register(OrdenItem)
class OrdenItemAdmin(admin.ModelAdmin):
	list_display = ("id", "orden", "producto", "precio_al_momento")
	search_fields = ("orden__id", "producto__nombre")


@admin.register(Descarga)
class DescargaAdmin(admin.ModelAdmin):
	list_display = ("id", "user", "producto", "token", "expira_en", "descargado_en")
	search_fields = ("user__username", "producto__nombre", "token")


@admin.register(SuscriptorAnonimo)
class SuscriptorAnonimoAdmin(admin.ModelAdmin):
	list_display = ("id", "email", "created_at")
	search_fields = ("email",)
