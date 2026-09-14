from django.urls import path
from .data_views import ExportProductsView, ExportOrdersView, ExportUsersView

urlpatterns = [
    path('export/products/', ExportProductsView.as_view(), name='export-products'),
    path('export/orders/', ExportOrdersView.as_view(), name='export-orders'),
    path('export/users/', ExportUsersView.as_view(), name='export-users'),
]
