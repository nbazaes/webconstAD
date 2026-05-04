from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver


def get_r2_storage():
    from storages.backends.s3boto3 import S3Boto3Storage
    return S3Boto3Storage()


r2_storage = get_r2_storage()


class PerfilCliente(models.Model):
	user = models.OneToOneField(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name="perfil_cliente",
	)
	nombre = models.CharField(max_length=120)
	apellido = models.CharField(max_length=120)
	pais = models.CharField(max_length=120, blank=True)
	stripe_customer_id = models.CharField(max_length=120, blank=True)
	lemon_squeezy_id = models.CharField(max_length=120, blank=True)

	class Meta:
		verbose_name = "Perfil de cliente"
		verbose_name_plural = "Perfiles de clientes"

	def __str__(self):
		return f"{self.nombre} {self.apellido}".strip()


@receiver(post_save, sender=get_user_model())
def crear_perfil_cliente(sender, instance, created, **kwargs):
	if created:
		PerfilCliente.objects.get_or_create(
			user=instance,
			defaults={
				"nombre": instance.first_name or instance.username,
				"apellido": instance.last_name or "",
			},
		)


class Categoria(models.Model):
	nombre = models.CharField(max_length=140)
	slug = models.SlugField(max_length=180, unique=True)
	descripcion = models.TextField(blank=True)
	imagen = models.ImageField(upload_to='categorias/', storage=r2_storage, blank=True, null=True)
	es_gratuita = models.BooleanField(default=False)

	class Meta:
		verbose_name = "Categoria"
		verbose_name_plural = "Categorias"

	def __str__(self):
		return self.nombre


class Coleccion(models.Model):
	nombre = models.CharField(max_length=140)
	descripcion = models.ImageField(upload_to='colecciones/descripciones/', storage=r2_storage, blank=True, null=True)
	slug = models.SlugField(max_length=180, unique=True)
	imagen = models.ImageField(upload_to='colecciones/', storage=r2_storage, blank=True, null=True)

	class Meta:
		verbose_name = "Coleccion"
		verbose_name_plural = "Colecciones"

	def __str__(self):
		return self.nombre


class Producto(models.Model):
	nombre = models.CharField(max_length=180)
	descripcion = models.TextField(blank=True)
	precio = models.PositiveIntegerField(null=True, blank=True)
	es_gratuito = models.BooleanField(default=False)
	archivo = models.FileField(upload_to='productos/', storage=r2_storage, blank=True, null=True)
	imagen = models.ImageField(upload_to='productos/', storage=r2_storage, blank=True, null=True)
	preview_imagen = models.ImageField(upload_to='productos/previews/', storage=r2_storage, blank=True, null=True)
	slug = models.SlugField(max_length=200, unique=True)
	paginas = models.PositiveIntegerField(null=True, blank=True)
	activo = models.BooleanField(default=True)
	categoria = models.ForeignKey(
		Categoria,
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name="productos",
	)
	coleccion = models.ForeignKey(
		Coleccion,
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name="productos",
	)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		verbose_name = "Producto"
		verbose_name_plural = "Productos"

	def __str__(self):
		return self.nombre


class Orden(models.Model):
	user = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name="ordenes",
	)
	estado = models.CharField(max_length=20)
	total = models.DecimalField(max_digits=10, decimal_places=2)
	pasarela = models.CharField(max_length=30)
	pasarela_orden_id = models.CharField(max_length=120, blank=True)
	moneda = models.CharField(max_length=8)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		verbose_name = "Orden"
		verbose_name_plural = "Ordenes"

	def __str__(self):
		return f"Orden #{self.pk} - {self.user}"


class OrdenItem(models.Model):
	orden = models.ForeignKey(Orden, on_delete=models.CASCADE, related_name="items")
	producto = models.ForeignKey(Producto, on_delete=models.PROTECT, related_name="orden_items")
	precio_al_momento = models.DecimalField(max_digits=10, decimal_places=2)

	class Meta:
		verbose_name = "Item de orden"
		verbose_name_plural = "Items de orden"

	def __str__(self):
		return f"{self.orden_id} - {self.producto_id}"


class Descarga(models.Model):
	user = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name="descargas",
	)
	producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name="descargas")
	token = models.CharField(max_length=255, unique=True)
	expira_en = models.DateTimeField()
	descargado_en = models.DateTimeField(null=True, blank=True)

	class Meta:
		verbose_name = "Descarga"
		verbose_name_plural = "Descargas"

	def __str__(self):
		return f"Descarga {self.token}"


class SuscriptorAnonimo(models.Model):
	email = models.EmailField(unique=True)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		verbose_name = "Suscriptor anonimo"
		verbose_name_plural = "Suscriptores anonimos"

	def __str__(self):
		return self.email
