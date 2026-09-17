from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse

from orders.models import Order, OrderItem
from products.models import Category, Product

User = get_user_model()


class ProductRecommendationsAPITest(TestCase):
    def setUp(self):
        self.phone_category = Category.objects.create(name='Phones', slug='phones')
        self.audio_category = Category.objects.create(name='Audio', slug='audio')

        self.purchased_product = Product.objects.create(
            name='Smartphone X', category=self.phone_category, price=550000, original_price=650000,
            stock=10, rating=4.9, is_active=True,
        )
        self.related_product = Product.objects.create(
            name='Smartphone Y', category=self.phone_category, price=600000, original_price=700000,
            stock=10, rating=4.8, is_active=True,
        )
        self.other_product = Product.objects.create(
            name='Bluetooth Speaker', category=self.audio_category, price=250000, original_price=300000,
            stock=5, rating=4.7, is_active=True,
        )

        self.user = User.objects.create_user(email='buyer@example.com', password='strong-pass-123', name='Buyer')
        self.order = Order.objects.create(
            user=self.user,
            subtotal=550000,
            total=550000,
            delivery_address='Test address',
            phone='0770000000',
        )
        OrderItem.objects.create(order=self.order, product=self.purchased_product, quantity=1, price=self.purchased_product.price)

    def test_authenticated_user_gets_category_based_recommendations(self):
        self.client.force_login(self.user)
        response = self.client.get(reverse('product-recommendations'))

        self.assertEqual(response.status_code, 200)
        product_ids = [item['id'] for item in response.data]
        self.assertIn(self.related_product.id, product_ids)
        self.assertNotIn(self.other_product.id, product_ids[:3])

    def test_guest_user_gets_fallback_products(self):
        response = self.client.get(reverse('product-recommendations'))

        self.assertEqual(response.status_code, 200)
        self.assertTrue(len(response.data) >= 1)
        self.assertIn(self.purchased_product.id, [item['id'] for item in response.data])
