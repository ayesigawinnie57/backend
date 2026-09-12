import resend
from django.conf import settings

resend.api_key = settings.RESEND_API_KEY

FROM = 'Majo Gadgets <noreply@educfarm.com>'


def send_welcome_email(name: str, email: str):
    resend.Emails.send({
        'from': FROM,
        'to': email,
        'subject': 'Welcome to Majo Gadgets! 🎉',
        'html': f'''
        <div style="font-family:Inter,sans-serif;max-width:520px;margin:auto;padding:32px;background:#fff;border-radius:12px;border:1px solid #E2E8F0">
          <img src="https://res.cloudinary.com/d5qqtsou/image/upload/v1788691351/Majo_Gadgets_logo_an2hbc.png" height="48" style="margin-bottom:24px" />
          <h2 style="color:#071A2B;margin:0 0 8px">Welcome, {name}! 👋</h2>
          <p style="color:#64748B;font-size:14px;line-height:1.6">Your account has been created successfully. Start exploring quality gadgets and great deals.</p>
          <a href="{settings.FRONTEND_URL}" style="display:inline-block;margin-top:24px;padding:12px 28px;background:#1E3A8A;color:#fff;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none">Shop Now</a>
          <p style="color:#94A3B8;font-size:12px;margin-top:32px">Majo Gadgets · Quality gadgets, great value.</p>
        </div>
        ''',
    })


def send_password_reset_email(name: str, email: str, reset_url: str):
    resend.Emails.send({
        'from': FROM,
        'to': email,
        'subject': 'Reset your Majo Gadgets password',
        'html': f'''
        <div style="font-family:Inter,sans-serif;max-width:520px;margin:auto;padding:32px;background:#fff;border-radius:12px;border:1px solid #E2E8F0">
          <img src="https://res.cloudinary.com/d5qqtsou/image/upload/v1788691351/Majo_Gadgets_logo_an2hbc.png" height="48" style="margin-bottom:24px" />
          <h2 style="color:#071A2B;margin:0 0 8px">Reset your password</h2>
          <p style="color:#64748B;font-size:14px;line-height:1.6">Hi {name}, we received a request to reset your password. Click the button below. This link expires in <strong>1 hour</strong>.</p>
          <a href="{reset_url}" style="display:inline-block;margin-top:24px;padding:12px 28px;background:#1E3A8A;color:#fff;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none">Reset Password</a>
          <p style="color:#64748B;font-size:13px;margin-top:24px">If you didn't request this, you can safely ignore this email.</p>
          <p style="color:#94A3B8;font-size:12px;margin-top:32px">Majo Gadgets · Quality gadgets, great value.</p>
        </div>
        ''',
    })
