# Generated by Django 5.1.2 on 2024-10-12 19:11

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_articulo_precio'),
    ]

    operations = [
        migrations.RenameField(
            model_name='articulo',
            old_name='nombre',
            new_name='descripcion',
        ),
    ]
