from django.http import JsonResponse
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

def home(request):
    return JsonResponse({
        "message": "Kendjino Pharma API is running "
    })

urlpatterns = [
    path('', home),  

    path('admin/', admin.site.urls),

    path('api/auth/', include('apps.users.urls')),
    path('api/produits/', include('apps.produits.urls')),
    path('api/ventes/', include('apps.ventes.urls')),
    path('api/stock/', include('apps.stock.urls')),
    path('api/clients/', include('apps.clients.urls')),
    path('api/fournisseurs/', include('apps.fournisseurs.urls')),
    path('api/achats/', include('apps.achats.urls')),
    path('api/ordonnances/', include('apps.ordonnances.urls')),
    path('api/rapports/', include('apps.rapports.urls')),
    path('api/dashboard/', include('apps.dashboard.urls')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)