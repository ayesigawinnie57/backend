from django.urls import path
from .views import (
    TraderApplicationCreateView,
    AdminTraderListView, AdminTraderDetailView,
    AdminTraderApproveView, AdminTraderRejectView,
)

urlpatterns = [
    path('apply/',           TraderApplicationCreateView.as_view(), name='trader-apply'),
    path('admin/',           AdminTraderListView.as_view(),         name='admin-trader-list'),
    path('admin/<int:pk>/',  AdminTraderDetailView.as_view(),       name='admin-trader-detail'),
    path('admin/<int:pk>/approve/', AdminTraderApproveView.as_view(), name='admin-trader-approve'),
    path('admin/<int:pk>/reject/',  AdminTraderRejectView.as_view(),  name='admin-trader-reject'),
]
