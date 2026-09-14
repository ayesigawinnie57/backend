import csv
import json
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework import permissions
from orders.models import Order
from products.models import Product
from django.contrib.auth import get_user_model

User = get_user_model()


class ExportProductsView(APIView):
    permission_classes = (permissions.IsAdminUser,)

    def get(self, request):
        fmt = request.query_params.get('format', 'csv')
        products = Product.objects.select_related('category').values(
            'id', 'name', 'category__name', 'price', 'stock', 'is_active', 'created_at'
        )
        if fmt == 'json':
            return HttpResponse(
                json.dumps(list(products), default=str),
                content_type='application/json',
                headers={'Content-Disposition': 'attachment; filename="products.json"'},
            )
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="products.csv"'
        writer = csv.DictWriter(response, fieldnames=['id', 'name', 'category__name', 'price', 'stock', 'is_active', 'created_at'])
        writer.writeheader()
        writer.writerows(products)
        return response


class ExportOrdersView(APIView):
    permission_classes = (permissions.IsAdminUser,)

    def get(self, request):
        fmt = request.query_params.get('format', 'csv')
        orders = Order.objects.select_related('user').values(
            'code', 'user__email', 'status', 'total', 'delivery_address', 'created_at'
        )
        if fmt == 'json':
            return HttpResponse(
                json.dumps(list(orders), default=str),
                content_type='application/json',
                headers={'Content-Disposition': 'attachment; filename="orders.json"'},
            )
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="orders.csv"'
        writer = csv.DictWriter(response, fieldnames=['code', 'user__email', 'status', 'total', 'delivery_address', 'created_at'])
        writer.writeheader()
        writer.writerows(orders)
        return response


class ExportUsersView(APIView):
    permission_classes = (permissions.IsAdminUser,)

    def get(self, request):
        fmt = request.query_params.get('format', 'csv')
        users = User.objects.values('id', 'name', 'email', 'is_active', 'date_joined')
        if fmt == 'json':
            return HttpResponse(
                json.dumps(list(users), default=str),
                content_type='application/json',
                headers={'Content-Disposition': 'attachment; filename="users.json"'},
            )
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="users.csv"'
        writer = csv.DictWriter(response, fieldnames=['id', 'name', 'email', 'is_active', 'date_joined'])
        writer.writeheader()
        writer.writerows(users)
        return response
