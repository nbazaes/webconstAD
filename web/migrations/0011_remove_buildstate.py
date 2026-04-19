from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('web', '0010_buildstate_alter_categoria_imagen_and_more'),
    ]

    operations = [
        migrations.DeleteModel(
            name='BuildState',
        ),
    ]
