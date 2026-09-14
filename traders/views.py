from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from .models import TraderApplication
from .serializers import TraderApplicationSerializer, TraderApplicationAdminSerializer


# ── Public: submit application ────────────────────────────────────────────────

class TraderApplicationCreateView(generics.CreateAPIView):
    serializer_class = TraderApplicationSerializer
    permission_classes = (permissions.AllowAny,)

    def create(self, request, *args, **kwargs):
        # Link to logged-in user if authenticated
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user if request.user.is_authenticated else None
        serializer.save(user=user)
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
