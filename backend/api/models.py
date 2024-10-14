from django.db import models

# Create your models here.
class Cliente(models.Model):
    nombre = models.CharField(max_length=100, unique=True, blank=False, null=False)  # Added blank=False and null=False
    
    def __str__(self):
        return self.nombre

# Cada Cliente puede tener muchos Articulo y puede que entre ellos los codigos se repitan
# Por eso es necesario que el codigo sea unico pero dentro de cada cliente
class Articulo(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='articulos')
    codigo = models.CharField(max_length=50, null=False, blank=False)
    descripcion = models.CharField(max_length=100, null=False, blank=False)
    precio = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, null=False)

    class Meta:
        unique_together = ['cliente', 'codigo']
        constraints = [
            models.UniqueConstraint(fields=['cliente', 'codigo'], name='unique_articulo_cliente', violation_error_message="El codigo del articulo ya existe para este cliente")
        ]

    def __str__(self):
        return f"{self.cliente.nombre} - {self.codigo} - {self.descripcion} - {self.precio}"
