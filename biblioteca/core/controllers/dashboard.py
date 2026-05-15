from rest_framework.decorators import api_view
from rest_framework.response import Response

from core.services.dashboard import montar_dashboard


@api_view(["GET"])
def dashboard_data(request):
    return Response(montar_dashboard(request.GET.get("periodo")))
