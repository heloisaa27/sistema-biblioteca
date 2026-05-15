from django.core.management.base import BaseCommand

from core.services.usuarios import remover_usuarios_desativados_expirados


class Command(BaseCommand):
    help = "Remove usuarios desativados ha 30 dias ou mais."

    def handle(self, *args, **options):
        quantidade = remover_usuarios_desativados_expirados()

        self.stdout.write(
            self.style.SUCCESS(
                f"{quantidade} usuario(s) desativado(s) removido(s)."
            )
        )
