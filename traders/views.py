from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from .models import TraderApplication, TraderProduct, TraderSale, TraderExpense
from .serializers import (
    TraderApplicationSerializer, TraderApplicationAdminSerializer,
    TraderProductSerializer, TraderSaleSerializer, TraderExpenseSerializer,
)


def _get_trader_by_uuid(uuid_str):
    try:
        return TraderApplication.objects.get(uuid=uuid_str, status='approved')
    except TraderApplication.DoesNotExist:
        return None


class IsTraderOwner(permissions.BasePermission):
    """Allow access only if the authenticated user owns the trader account (matched by email)."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        uuid_str = view.kwargs.get('trader_uuid')
        trader = _get_trader_by_uuid(uuid_str)
        if not trader:
            return False
        return trader.email == request.user.email or request.user.is_staff


# ── Public: submit application ────────────────────────────────────────────────

class TraderApplicationCreateView(generics.CreateAPIView):
    serializer_class = TraderApplicationSerializer
    permission_classes = (permissions.AllowAny,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user if request.user.is_authenticated else None
        serializer.save(user=user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ── Trader: get own profile by UUID ──────────────────────────────────────────

class TraderProfileView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, trader_uuid):
        trader = _get_trader_by_uuid(trader_uuid)
        if not trader:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        if trader.email != request.user.email and not request.user.is_staff:
            return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
        return Response(TraderApplicationAdminSerializer(trader).data)


# ── Trader: dashboard stats ───────────────────────────────────────────────────

class TraderDashboardView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, trader_uuid):
        trader = _get_trader_by_uuid(trader_uuid)
        if not trader:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        if trader.email != request.user.email and not request.user.is_staff:
            return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)

        sales = TraderSale.objects.filter(trader=trader)
        expenses = TraderExpense.objects.filter(trader=trader)
        products = TraderProduct.objects.filter(trader=trader)

        total_revenue = sum(s.total for s in sales)
        total_expenses = sum(e.amount for e in expenses)
        net_profit = total_revenue - total_expenses

        from django.utils import timezone as tz
        today = tz.now().date()
        today_sales = sales.filter(created_at__date=today)
        today_revenue = sum(s.total for s in today_sales)

        return Response({
            'total_revenue': float(total_revenue),
            'total_expenses': float(total_expenses),
            'net_profit': float(net_profit),
            'today_revenue': float(today_revenue),
            'today_orders': today_sales.count(),
            'total_products': products.count(),
            'active_products': products.filter(is_active=True).count(),
            'total_sales': sales.count(),
        })


# ── Trader: products ──────────────────────────────────────────────────────────

class TraderProductListView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, trader_uuid):
        trader = _get_trader_by_uuid(trader_uuid)
        if not trader:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        if trader.email != request.user.email and not request.user.is_staff:
            return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
        products = TraderProduct.objects.filter(trader=trader)
        return Response(TraderProductSerializer(products, many=True).data)

    def post(self, request, trader_uuid):
        trader = _get_trader_by_uuid(trader_uuid)
        if not trader:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        if trader.email != request.user.email and not request.user.is_staff:
            return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = TraderProductSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(trader=trader)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class TraderProductDetailView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def _get(self, trader_uuid, product_uuid):
        trader = _get_trader_by_uuid(trader_uuid)
        if not trader:
            return None, None
        try:
            product = TraderProduct.objects.get(uuid=product_uuid, trader=trader)
        except TraderProduct.DoesNotExist:
            return trader, None
        return trader, product

    def get(self, request, trader_uuid, product_uuid):
        trader, product = self._get(trader_uuid, product_uuid)
        if not trader or not product:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        if trader.email != request.user.email and not request.user.is_staff:
            return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
        return Response(TraderProductSerializer(product).data)

    def patch(self, request, trader_uuid, product_uuid):
        trader, product = self._get(trader_uuid, product_uuid)
        if not trader or not product:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        if trader.email != request.user.email and not request.user.is_staff:
            return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = TraderProductSerializer(product, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, trader_uuid, product_uuid):
        trader, product = self._get(trader_uuid, product_uuid)
        if not trader or not product:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        if trader.email != request.user.email and not request.user.is_staff:
            return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ── Trader: sales ─────────────────────────────────────────────────────────────

class TraderSaleListView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, trader_uuid):
        trader = _get_trader_by_uuid(trader_uuid)
        if not trader:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        if trader.email != request.user.email and not request.user.is_staff:
            return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
        return Response(TraderSaleSerializer(trader.sales.all(), many=True).data)

    def post(self, request, trader_uuid):
        trader = _get_trader_by_uuid(trader_uuid)
        if not trader:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        if trader.email != request.user.email and not request.user.is_staff:
            return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
        data = request.data.copy()
        # auto-compute total if not provided
        if 'total' not in data:
            try:
                data['total'] = float(data['unit_price']) * int(data['quantity'])
            except Exception:
                pass
        serializer = TraderSaleSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save(trader=trader)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ── Trader: expenses ──────────────────────────────────────────────────────────

class TraderExpenseListView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, trader_uuid):
        trader = _get_trader_by_uuid(trader_uuid)
        if not trader:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        if trader.email != request.user.email and not request.user.is_staff:
            return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
        return Response(TraderExpenseSerializer(trader.expenses.all(), many=True).data)

    def post(self, request, trader_uuid):
        trader = _get_trader_by_uuid(trader_uuid)
        if not trader:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        if trader.email != request.user.email and not request.user.is_staff:
            return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = TraderExpenseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(trader=trader)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ── Admin: list + filter ──────────────────────────────────────────────────────

class AdminTraderListView(generics.ListAPIView):
    serializer_class = TraderApplicationAdminSerializer
    permission_classes = (permissions.IsAdminUser,)

    def get_queryset(self):
        qs = TraderApplication.objects.select_related('reviewed_by', 'user')
        s = self.request.query_params.get('status')
        if s:
            qs = qs.filter(status=s)
        return qs


class AdminTraderDetailView(generics.RetrieveAPIView):
    queryset = TraderApplication.objects.select_related('reviewed_by', 'user')
    serializer_class = TraderApplicationAdminSerializer
    permission_classes = (permissions.IsAdminUser,)


# ── Admin: approve ────────────────────────────────────────────────────────────

class AdminTraderApproveView(APIView):
    permission_classes = (permissions.IsAdminUser,)

    def post(self, request, pk):
        try:
            app = TraderApplication.objects.get(pk=pk)
        except TraderApplication.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        if app.status == 'approved':
            return Response({'detail': 'Already approved.'}, status=status.HTTP_400_BAD_REQUEST)

        app.status = 'approved'
        app.admin_note = request.data.get('admin_note', '')
        app.reviewed_by = request.user
        app.reviewed_at = timezone.now()
        app.save()

        # Email notification
        try:
            from users.emails import send_trader_approved_email
            send_trader_approved_email(app.full_name, app.email, app.business_name, str(app.uuid))
        except Exception:
            pass

        # Push notification (if trader has a linked user account)
        if app.user:
            try:
                from users.models import Notification
                Notification.objects.create(
                    user=app.user,
                    type='system',
                    title='Your trader application is approved! 🎉',
                    body=f'Congratulations! {app.business_name} has been approved. Open your trader portal to start selling.',
                )
            except Exception:
                pass

        return Response(TraderApplicationAdminSerializer(app).data)


# ── Admin: reject ─────────────────────────────────────────────────────────────

class AdminTraderRejectView(APIView):
    permission_classes = (permissions.IsAdminUser,)

    def post(self, request, pk):
        try:
            app = TraderApplication.objects.get(pk=pk)
        except TraderApplication.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        reason = request.data.get('admin_note', '').strip()
        if not reason:
            return Response({'detail': 'A rejection reason is required.'}, status=status.HTTP_400_BAD_REQUEST)

        app.status = 'rejected'
        app.admin_note = reason
        app.reviewed_by = request.user
        app.reviewed_at = timezone.now()
        app.save()
        return Response(TraderApplicationAdminSerializer(app).data)
