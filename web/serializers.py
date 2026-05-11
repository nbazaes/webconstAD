from django.core.validators import validate_email
from rest_framework import serializers

from .models import MensajeContacto


class MensajeContactoSerializer(serializers.ModelSerializer):
	class Meta:
		model = MensajeContacto
		fields = ('nombre', 'email', 'motivo', 'mensaje')

	def validate_nombre(self, value):
		value = value.strip()
		if not value:
			raise serializers.ValidationError('El nombre es obligatorio')
		return value

	def validate_email(self, value):
		value = value.strip().lower()
		validate_email(value)
		return value

	def validate_mensaje(self, value):
		value = value.strip()
		if not value:
			raise serializers.ValidationError('El mensaje es obligatorio')
		return value

	def validate_motivo(self, value):
		validos = {choice for choice, _ in MensajeContacto.MOTIVO_CHOICES}
		if value not in validos:
			raise serializers.ValidationError('Motivo invalido')
		return value
