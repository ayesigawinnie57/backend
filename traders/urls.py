from django.urls import path
from .views import (
    TraderApplicationCreateView,
    TraderProfileView, TraderDashboardView,
    TraderProductListView, TraderProductDetailView,
    TraderSaleListView, TraderExpenseListView,
    AdminTraderListView, AdminTraderDetailView,
    AdminTraderApproveView, AdminTraderRejectView,
)

urlpatterns = [
    # Public
    path('apply/',                                                      TraderApplicationCreateView.as_view(), name='trader-apply'),

    # Trader portal (UUID-scoped)
    path('<uuid:trader_uuid>/profile/',                                 TraderProfileView.as_view(),           name='trader-profile'),
    path('<uuid:trader_uuid>/dashboard/',                               TraderDashboardView.as_view(),         name='trader-dashboard'),
    path('<uuid:trader_uuid>/products/',                                TraderProductListView.as_view(),       name='trader-products'),
    path('<uuid:trader_uuid>/products/<uuid:product_uuid>/',            TraderProductDetailView.as_view(),     name='trader-product-detail'),
    path('<uuid:trader_uuid>/sales/',                                   TraderSaleListView.as_view(),          name='trader-sales'),
    path('<uuid:trader_uuid>/expenses/',                                TraderExpenseListView.as_view(),       name='trader-expenses'),

    # Admin
    path('admin/',                                                      AdminTraderListView.as_view(),         name='admin-trader-list'),
    path('admin/<int:pk>/',                                             AdminTraderDetailView.as_view(),       name='admin-trader-detail'),
    path('admin/<int:pk>/approve/',                                     AdminTraderApproveView.as_view(),      name='admin-trader-approve'),
    path('admin/<int:pk>/reject/',                                      AdminTraderRejectView.as_view(),       name='admin-trader-reject'),
]
