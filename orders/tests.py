from unittest.mock import patch

from django.conf import settings
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from orders.models import Order, Payment

User = get_user_model()


class OrderDeliveryEmailTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            email='admin@example.com',
            name='Admin User',
            password='Password123!',
        )
        self.user = User.objects.create_user(
            email='customer@example.com',
            name='Jane Doe',
            password='Password123!',
        )
        self.order = Order.objects.create(
            user=self.user,
            code='12345678-ABCD',
            status='shipped',
            total=25000,
            delivery_address='Kampala, Uganda',
            phone='+256700000000',
        )

    @patch('orders.views.send_product_rating_notifications.apply_async')
    @patch('orders.views.send_order_rating_email')
    @patch('orders.views.send_order_delivered_email')
    def test_admin_deliver_view_sends_rating_email(self, mock_delivered, mock_rating, mock_queue):
        self.client.force_authenticate(user=self.admin)
        self.order.status = 'ready_for_pickup'
        self.order.save(update_fields=['status'])

        response = self.client.post(f'/api/orders/admin/{self.order.code}/deliver/')

        self.assertEqual(response.status_code, 200)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'delivered')
        mock_delivered.assert_called_once_with(
            self.user.name,
            self.user.email,
            self.order.code,
            f'{self.order.total:,.0f}',
            [],
            self.order.delivery_address,
        )
        mock_queue.assert_called_once_with((self.order.id,), countdown=300)
        mock_rating.assert_not_called()

    def test_admin_order_and_payment_lists_return_200(self):
        self.client.force_authenticate(user=self.admin)
        self.order.status_changed_by = self.admin
        self.order.save(update_fields=['status_changed_by'])
        Payment.objects.create(
            order=self.order,
            pesapal_order_tracking_id='track-123',
            amount=self.order.total,
            status='completed',
            payment_method='Pesapal',
        )

        orders_response = self.client.get('/api/orders/admin/')
        payments_response = self.client.get('/api/orders/admin/payments/')

        self.assertEqual(orders_response.status_code, 200)
        self.assertEqual(payments_response.status_code, 200)
        self.assertEqual(payments_response.json()['results'][0]['order_code'], self.order.code)

    def test_admin_lists_handle_null_related_fields(self):
        self.client.force_authenticate(user=self.admin)
        Payment.objects.create(
            order=None,
            pesapal_order_tracking_id='track-null-order',
            amount=25000,
            status='completed',
            payment_method='Pesapal',
        )
        self.order.status_changed_by = None
        self.order.save(update_fields=['status_changed_by'])

        orders_response = self.client.get('/api/orders/admin/')
        payments_response = self.client.get('/api/orders/admin/payments/')

        self.assertEqual(orders_response.status_code, 200)
        self.assertEqual(payments_response.status_code, 200)
        self.assertIsNone(orders_response.json()['results'][0]['status_changed_by_name'])
        self.assertIsNone(payments_response.json()['results'][-1]['order_code'])
