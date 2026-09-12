import resend
from django.conf import settings

resend.api_key = settings.RESEND_API_KEY

FROM = 'Majo Gadgets <noreply@educfarm.com>'

LOGO = 'https://res.cloudinary.com/d5qqtsou/image/upload/v1788691351/Majo_Gadgets_logo_an2hbc.png'

BASE = '''
<body style="margin:0;padding:0;background:#F1F5F9;font-family:Inter,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;padding:40px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07)">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1E3A8A 0%,#2563EB 100%);padding:32px 40px;text-align:center">
            <img src="{logo}" height="52" alt="Majo Gadgets" style="display:block;margin:0 auto" />
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px">
            {body}
          </td>
        </tr>

        <!-- Divider -->
        <tr><td style="padding:0 40px"><hr style="border:none;border-top:1px solid #E2E8F0;margin:0" /></td></tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;text-align:center">
            <p style="margin:0 0 6px;font-size:13px;color:#64748B">Majo Gadgets &mdash; Quality gadgets, great value.</p>
            <p style="margin:0;font-size:12px;color:#94A3B8">
              &copy; 2025 Majo Gadgets. All rights reserved.<br/>
              You are receiving this email because you have an account with us.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
'''


def _wrap(body: str) -> str:
    return BASE.replace('{logo}', LOGO).replace('{body}', body)


def send_welcome_email(name: str, email: str):
    body = f'''
      <h2 style="margin:0 0 8px;font-size:22px;color:#0F172A">Welcome aboard, {name}! 🎉</h2>
      <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7">
        We're thrilled to have you join the <strong>Majo Gadgets</strong> family. Your account has been created successfully and you're all set to start shopping.
      </p>
      <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7">
        Here's what you can do right now:
      </p>
      <table cellpadding="0" cellspacing="0" style="margin-bottom:28px">
        <tr>
          <td style="padding:8px 0;font-size:14px;color:#334155">✅&nbsp;&nbsp;Browse hundreds of quality gadgets</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-size:14px;color:#334155">🔥&nbsp;&nbsp;Grab flash deals and exclusive offers</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-size:14px;color:#334155">❤️&nbsp;&nbsp;Save your favourite items to your wishlist</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-size:14px;color:#334155">🚚&nbsp;&nbsp;Fast and reliable delivery to your doorstep</td>
        </tr>
      </table>
      <a href="{settings.FRONTEND_URL}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#1E3A8A,#2563EB);color:#fff;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none;letter-spacing:0.3px">
        Start Shopping &rarr;
      </a>
      <p style="margin:28px 0 0;font-size:13px;color:#94A3B8">
        If you have any questions, just reply to this email — we're always happy to help.
      </p>
    '''
    resend.Emails.send({
        'from': FROM,
        'to': email,
        'subject': 'Welcome to Majo Gadgets! 🎉',
        'html': _wrap(body),
    })


def send_password_reset_email(name: str, email: str, reset_url: str):
    body = f'''
      <div style="text-align:center;margin-bottom:28px">
        <div style="display:inline-block;background:#EFF6FF;border-radius:50%;padding:16px;margin-bottom:16px">
          <span style="font-size:32px">🔐</span>
        </div>
        <h2 style="margin:0 0 8px;font-size:22px;color:#0F172A">Password Reset Request</h2>
        <p style="margin:0;font-size:14px;color:#64748B">We received a request to reset your password</p>
      </div>
      <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7">
        Hi <strong>{name}</strong>, no worries — it happens to the best of us! Click the button below to create a new password for your Majo Gadgets account.
      </p>
      <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:20px;margin-bottom:28px">
        <p style="margin:0 0 4px;font-size:12px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.5px">Security Notice</p>
        <p style="margin:0;font-size:13px;color:#475569;line-height:1.6">
          ⏱ This link expires in <strong>1 hour</strong>.<br/>
          🔒 For your security, this link can only be used once.<br/>
          📧 Only you should have access to this email.
        </p>
      </div>
      <div style="text-align:center;margin-bottom:28px">
        <a href="{reset_url}" style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#1E3A8A,#2563EB);color:#fff;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none;letter-spacing:0.3px">
          Reset My Password &rarr;
        </a>
      </div>
      <p style="margin:0 0 8px;font-size:13px;color:#64748B;line-height:1.6">
        If the button doesn't work, copy and paste this link into your browser:
      </p>
      <p style="margin:0 0 24px;font-size:12px;color:#2563EB;word-break:break-all">{reset_url}</p>
      <p style="margin:0;font-size:13px;color:#94A3B8;line-height:1.6">
        If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
      </p>
    '''
    resend.Emails.send({
        'from': FROM,
        'to': email,
        'subject': 'Reset your Majo Gadgets password 🔐',
        'html': _wrap(body),
    })
