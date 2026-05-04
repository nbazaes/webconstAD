from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('web', '0013_coleccion_descripcion_imagen_and_producto_preview'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='perfilcliente',
            name='rol',
        ),
    ]
