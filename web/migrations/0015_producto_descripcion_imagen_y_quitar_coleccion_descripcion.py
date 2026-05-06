from django.db import migrations, models
import storages.backends.s3


def copy_coleccion_descripcion_to_producto(apps, schema_editor):
    Producto = apps.get_model('web', 'Producto')
    for producto in Producto.objects.select_related('coleccion').all():
        coleccion = getattr(producto, 'coleccion', None)
        if not coleccion:
            continue
        descripcion = getattr(coleccion, 'descripcion', None)
        if descripcion and not producto.descripcion_imagen:
            producto.descripcion_imagen = descripcion
            producto.save(update_fields=['descripcion_imagen'])


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('web', '0014_remove_perfilcliente_rol'),
    ]

    operations = [
        migrations.AddField(
            model_name='producto',
            name='descripcion_imagen',
            field=models.ImageField(blank=True, null=True, storage=storages.backends.s3.S3Storage(), upload_to='productos/descripciones/'),
        ),
        migrations.RunPython(copy_coleccion_descripcion_to_producto, noop_reverse),
        migrations.RemoveField(
            model_name='coleccion',
            name='descripcion',
        ),
    ]
