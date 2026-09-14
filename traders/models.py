from django.db import models
from django.conf import settings


class TraderApplication(models.Model):
    STATUS = [
        ('pending',  'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    BUSINESS_TYPES = [
        ('sole_proprietor', 'Sole Proprietor'),
        ('partnership',     'Partnership'),
        ('limited_company', 'Limited Company'),
        ('other',           'Other'),
    ]

    # Personal info
    full_name       = models.CharField(max_length=150)
    email           = models.EmailField(unique=True)
    phone           = models.CharField(max_length=30)
    national_id     = models.CharField(max_length=50, blank=True)

    # Business info
    business_name   = models.CharField(max_length=255)
    business_type   = models.CharField(max_length=20, choices=BUSINESS_TYPES)
    business_reg_no = models.CharField(max_length=100, blank=True)
    tin             = models.CharField(max_length=50, blank=True, verbose_name='TIN')
    location        = models.CharField(max_length=255)
    district        = models.CharField(max_length=100, blank=True)
    website         = models.URLField(blank=True)

    # What they want to sell
    product_categories = models.TextField(help_text='Categories/products they intend to sell')
    monthly_volume     = models.CharField(max_length=100, blank=True, help_text='Expected monthly sales volume')
    experience         = models.TextField(blank=True, help_text='Trading/business experience')

    # Agreement
    agreed_to_terms = models.BooleanField(default=False)

    # Status
    status       = models.CharField(max_length=10, choices=STATUS, default='pending')
    admin_note   = models.TextField(blank=True)
    reviewed_by  = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='reviewed_trader_applications'
    )
    reviewed_at  = models.DateTimeField(null=True, blank=True)

    # Linked user account (set on approval)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='trader_application'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.business_name} — {self.status}'
