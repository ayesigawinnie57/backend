from rest_framework import serializers
from .models import TraderApplication, TraderProduct, TraderSale, TraderExpense


class TraderApplicationSerializer(serializers.ModelSerializer):
    reviewed_by_name = serializers.CharField(source='reviewed_by.name', read_only=True, default=None)

    class Meta:
        model = TraderApplication
        fields = '__all__'
        read_only_fields = ('id', 'uuid', 'status', 'admin_note', 'reviewed_by', 'reviewed_by_name', 'reviewed_at', 'user', 'created_at', 'updated_at')

    def validate_email(self, value):
        # Allow re-application if existing record is rejected
        qs = TraderApplication.objects.filter(email=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.filter(status__in=('pending', 'approved')).exists():
            raise serializers.ValidationError('An active application with this email already exists.')
        # Delete old rejected record so new one can be created cleanly
        qs.filter(status='rejected').delete()
        return value


class TraderApplicationAdminSerializer(serializers.ModelSerializer):
    reviewed_by_name = serializers.CharField(source='reviewed_by.name', read_only=True, default=None)
    user_email = serializers.CharField(source='user.email', read_only=True, default=None)

    class Meta:
        model = TraderApplication
        fields = '__all__'


class TraderProductSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = TraderProduct
        fields = ('id', 'uuid', 'name', 'description', 'price', 'stock', 'image_url', 'is_active', 'created_at', 'updated_at')
        read_only_fields = ('id', 'uuid', 'created_at', 'updated_at')

    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return obj.image_url or None


class TraderSaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = TraderSale
        fields = ('id', 'uuid', 'product', 'product_name', 'quantity', 'unit_price', 'total', 'customer_name', 'note', 'created_at')
        read_only_fields = ('id', 'uuid', 'created_at')


class TraderExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TraderExpense
        fields = ('id', 'uuid', 'description', 'amount', 'date', 'note', 'created_at')
        read_only_fields = ('id', 'uuid', 'created_at')
