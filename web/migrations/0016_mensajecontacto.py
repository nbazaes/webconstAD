from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('web', '0015_alter_producto_precio_carrito_carritoitem'),
    ]

    operations = [
        migrations.CreateModel(
            name='MensajeContacto',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=120)),
                ('email', models.EmailField(max_length=254)),
                ('motivo', models.CharField(choices=[('contacto', 'Contacto'), ('soporte', 'Soporte')], max_length=20)),
                ('mensaje', models.TextField()),
                ('creado_en', models.DateTimeField(auto_now_add=True)),
                ('leido', models.BooleanField(default=False)),
            ],
            options={
                'verbose_name': 'Mensaje de contacto',
                'verbose_name_plural': 'Mensajes de contacto',
                'ordering': ['-creado_en', '-id'],
            },
        ),
    ]
