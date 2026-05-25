from rest_framework.decorators import api_view
from rest_framework.decorators import permission_classes
from rest_framework.response import Response

from core.permissions import IsAdminOrSuperuser
from core.services.dashboard import montar_dashboard


@api_view(["GET"])
@permission_classes([IsAdminOrSuperuser])
def dashboard_data(request):
    return Response(montar_dashboard(request.GET.get("periodo")))
