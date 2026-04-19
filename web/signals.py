from django.db.models.signals import post_save
from django.dispatch import receiver

from .build_status import trigger_build_async
from .models import Categoria


@receiver(post_save, sender=Categoria)
def trigger_frontend_build_on_categoria_change(sender, instance, created, **kwargs):
    trigger_build_async()
