from rest_framework import serializers
from .models import TraderApplication


class TraderApplicationSerializer(serializers.ModelSerializer):
    reviewed_by_name = serializers.CharField(source='reviewed_by.name', read_only=True, default=None)

    class Meta:
        model = TraderApplication
        fields = '__all__'
        read_only_fields = ('id', 'status', 'admin_note', 'reviewed_by', 'reviewed_by_name', 'reviewed_at', 'user', 'created_at', 'updated_at')


class TraderApplicationAdminSerializer(serializers.ModelSerializer):
    reviewed_by_name = serializers.CharField(source='reviewed_by.name', read_only=True, default=None)
    user_email = serializers.CharField(source='user.email', read_only=True, default=None)

    class Meta:
        model = TraderApplication
        fields = '__all__'
