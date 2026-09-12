import resend
from django.conf import settings

resend.api_key = settings.RESEND_API_KEY

FROM = 'Majo Gadgets <noreply@educfarm.com>'
LOGO = 'https://res.cloudinary.com/d5qqtsou/image/upload/v1788691351/Majo_Gadgets_logo_an2hbc.png'

# ── Icon paths ───────────────────────────────────────────────────────────────
ICO_CHECK       = '<polyline points="20 6 9 17 4 12"/>'
ICO_PACKAGE     = '<path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 2 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/>'
ICO_TRUCK       = '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>'
ICO_STAR        = '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'
ICO_X_CIRCLE    = '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'
ICO_LOCK        = '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'
ICO_CLOCK       = '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'
ICO_MAIL        = '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>'
ICO_SHOPPING    = '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>'
ICO_HEART       = '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>'
ICO_SETTINGS    = '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>'
ICO_MAP_PIN     = '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>'
ICO_PHONE       = '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>'

# ── Email-safe glyphs ────────────────────────────────────────────────────────
def _icon(path_d: str, color: str = '#ffffff', size: int = 20) -> str:
    glyph_map = {
        ICO_CHECK: '✓',
        ICO_PACKAGE: '▣',
        ICO_TRUCK: '🚚',
        ICO_STAR: '★',
        ICO_X_CIRCLE: '✕',
        ICO_LOCK: '🔒',
        ICO_CLOCK: '◔',
        ICO_MAIL: '✉',
        ICO_SHOPPING: '🛒',
        ICO_HEART: '♥',
        ICO_SETTINGS: '⚙',
        ICO_MAP_PIN: '⌖',
        ICO_PHONE: '☎',
    }
    glyph = glyph_map.get(path_d, '•')
    return (
        f'<span style="display:inline-block;font-size:{size}px;line-height:1;color:{color};'
        f'font-family:Arial,Helvetica,sans-serif;font-weight:700;vertical-align:middle">{glyph}</span>'
    )


def _circle_icon(path_d: str, bg: str, icon_color: str = '#ffffff', size: int = 48) -> str:
    """Icon inside a colored circle — used as email section header."""
    svg = _icon(path_d, icon_color, 24)
    return (
        f'<table cellpadding="0" cellspacing="0" style="margin:0 auto 12px"><tr><td align="center" valign="middle" '
        f'style="width:{size}px;height:{size}px;border-radius:50%;background:{bg};text-align:center">'
        f'{svg}</td></tr></table>'
    )


BASE = '''
<body style="margin:0;padding:0;background:#F1F5F9;font-family:Inter,Arial,sans-serif">
  <style>
    a, a:link, a:visited, a:hover, a:active { color:#ffffff !important; text-decoration:none !important; }
  </style>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;padding:40px 0">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07)">
        <tr>
          <td style="background:#ffffff;padding:28px 40px;text-align:center;border-bottom:1px solid #E2E8F0">
            <img src="{logo}" height="48" alt="Majo Gadgets" style="display:block;margin:0 auto" />
          </td>
        </tr>
        <tr><td style="padding:36px 40px 28px">{body}</td></tr>
        <tr><td style="padding:0 40px"><hr style="border:none;border-top:1px solid #E2E8F0;margin:0" /></td></tr>
        <tr>
          <td style="padding:20px 40px;text-align:center">
            <p style="margin:0 0 4px;font-size:13px;color:#64748B">Majo Gadgets &mdash; Quality gadgets, great value.</p>
            <p style="margin:0;font-size:11px;color:#94A3B8">&copy; 2025 Majo Gadgets. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
'''


def _wrap(body: str) -> str:
    return BASE.replace('{logo}', LOGO).replace('{body}', body)


def _progress_bar(active: str) -> str:
    steps = [
        ('pending',    ICO_PACKAGE,  'Placed'),
        ('processing', ICO_SETTINGS, 'Confirmed'),
        ('shipped',    ICO_TRUCK,    'Shipped'),
        ('delivered',  ICO_CHECK,    'Delivered'),
    ]
    order = [s[0] for s in steps]
    active_idx = order.index(active) if active in order else 0

    circle_cells = ''
    label_cells = ''
    for idx, (key, icon_path, label) in enumerate(steps):
        done = idx <= active_idx
        is_active = idx == active_idx
        circle_bg = '#F59E0B' if done else '#E2E8F0'
        icon_color = '#ffffff' if done else '#94A3B8'
        label_color = '#F59E0B' if is_active or done else '#94A3B8'
        label_weight = '700' if is_active or done else '400'
        svg = _icon(icon_path, icon_color, 18)

        if idx < len(steps) - 1:
            line_color = '#F59E0B' if idx < active_idx else '#E2E8F0'
            circle_cells += (
                f'<td align="center" valign="middle" style="width:25%;padding:0">'
                f'<table width="100%" cellpadding="0" cellspacing="0"><tr>'
                f'<td align="center" valign="middle" style="padding:0">'
                f'<table cellpadding="0" cellspacing="0" style="margin:0 auto"><tr>'
                f'<td align="center" valign="middle" style="width:40px;height:40px;border-radius:50%;background:{circle_bg};text-align:center">'
                f'{svg}</td></tr></table></td>'
                f'<td valign="middle" style="width:100%;padding:0"><div style="height:3px;background:{line_color};margin-left:6px;margin-right:6px;border-radius:999px"></div></td>'
                f'</tr></table></td>'
            )
        else:
            circle_cells += (
                f'<td align="center" valign="middle" style="width:25%;padding:0">'
                f'<table cellpadding="0" cellspacing="0" style="margin:0 auto"><tr>'
                f'<td align="center" valign="middle" style="width:40px;height:40px;border-radius:50%;background:{circle_bg};text-align:center">'
                f'{svg}</td></tr></table></td>'
            )

        label_cells += (
            f'<td align="center" style="width:25%;padding-top:8px">'
            f'<p style="margin:0;font-size:11px;color:{label_color};font-weight:{label_weight};white-space:nowrap">{label}</p>'
            f'</td>'
        )

    return f'''
    <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:20px 16px 16px;margin-bottom:28px">
      <p style="margin:0 0 16px;font-size:11px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.5px;text-align:center">Order Progress</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>{circle_cells}</tr>
        <tr>{label_cells}</tr>
      </table>
    </div>'''


def _item_rows(items: list) -> str:
    rows = ''
    for item in items:
        img_html = (
            f'<img src="{item["image"]}" width="56" height="56" alt="" style="border-radius:8px;object-fit:cover;display:block" />'
            if item.get('image') else
            f'<div style="width:56px;height:56px;background:#F1F5F9;border-radius:8px;text-align:center;line-height:56px">{_icon(ICO_PACKAGE, "#CBD5E1", 24)}</div>'
        )
        rows += f'''
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #F1F5F9;vertical-align:middle;width:68px">{img_html}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #F1F5F9;vertical-align:middle">
            <p style="margin:0 0 2px;font-size:13px;font-weight:600;color:#0F172A">{item["name"]}</p>
            <p style="margin:0;font-size:12px;color:#64748B">Qty: {item["qty"]}</p>
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #F1F5F9;vertical-align:middle;text-align:right;white-space:nowrap">
            <p style="margin:0;font-size:13px;font-weight:700;color:#16A34A">UGX {item["price"]}</p>
          </td>
        </tr>'''
    return rows


def _info_row(icon_path: str, text: str, color: str = '#334155') -> str:
    return f'''
    <p style="margin:0 0 10px;font-size:14px;color:{color};display:flex;align-items:center;gap:8px">
      {_icon(icon_path, color, 16)}&nbsp;&nbsp;{text}
    </p>'''


def send_welcome_email(name: str, email: str):
    body = f'''
      <div style="text-align:center;margin-bottom:24px">
        {_circle_icon(ICO_SHOPPING, '#DCFCE7', '#16A34A')}
        <h2 style="margin:0 0 6px;font-size:22px;color:#0F172A">Welcome aboard, {name}!</h2>
        <p style="margin:0;font-size:14px;color:#64748B">Your account has been created successfully</p>
      </div>
      <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.7">
        We're thrilled to have you join the <strong>Majo Gadgets</strong> family. You're all set to start shopping.
      </p>
      <div style="background:#ffffff;border:1px solid #E2E8F0;border-radius:10px;padding:16px 20px;margin-bottom:28px">
        {_info_row(ICO_CHECK,    'Browse hundreds of quality gadgets', '#334155')}
        {_info_row(ICO_STAR,     'Grab flash deals and exclusive offers', '#334155')}
        {_info_row(ICO_HEART,    'Save your favourite items to your wishlist', '#334155')}
        {_info_row(ICO_TRUCK,    'Fast and reliable delivery to your doorstep', '#334155')}
      </div>
      <a href="{settings.FRONTEND_URL}" style="display:inline-block;padding:14px 32px;background:#F59E0B !important;background-color:#F59E0B !important;color:#ffffff !important;border:1px solid #F59E0B;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none !important">
        Start Shopping &rarr;
      </a>
      <p style="margin:28px 0 0;font-size:13px;color:#94A3B8">If you have any questions, just reply to this email — we're always happy to help.</p>
    '''
    resend.Emails.send({'from': FROM, 'to': email, 'subject': 'Welcome to Majo Gadgets!', 'html': _wrap(body)})


def send_order_confirmed_email(name: str, email: str, order_code: str, total: str, items: list, delivery_address: str):
    body = f'''
      <div style="text-align:center;margin-bottom:24px">
        {_circle_icon(ICO_CHECK, '#ECFDF5', '#059669')}
        <h2 style="margin:0 0 6px;font-size:22px;color:#0F172A">Order Confirmed!</h2>
        <p style="margin:0;font-size:14px;color:#64748B">Hi <strong>{name}</strong>,</p>
      </div>

      <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7">
        Great news! 🎉 Your order <strong>#{order_code}</strong> has been confirmed.
      </p>
      <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7">
        We’re now preparing your items for shipment.
      </p>
      <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7">
        <strong>Order total:</strong> UGX {total}
      </p>
      <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7">
        We’ll keep you updated as your order moves through the delivery process.
      </p>

      {_progress_bar('processing')}

      <div style="background:#ffffff;border:1px solid #E2E8F0;border-radius:10px;padding:16px 20px;margin-bottom:24px">
        <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.5px">Order Code</p>
        <p style="margin:0 0 12px;font-size:22px;font-weight:800;color:#F59E0B;letter-spacing:1.5px">{order_code}</p>
        <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.5px">Delivering To</p>
        <p style="margin:0 0 16px;font-size:13px;color:#334155">{delivery_address}</p>
        <hr style="border:none;border-top:1px solid #E2E8F0;margin:0 0 16px" />
        <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.5px">Items Ordered</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          {_item_rows(items)}
          <tr>
            <td colspan="2" style="padding-top:12px;font-size:14px;font-weight:700;color:#0F172A">Total</td>
            <td style="padding-top:12px;font-size:15px;font-weight:800;color:#F59E0B;text-align:right">UGX {total}</td>
          </tr>
        </table>
      </div>

      <p style="margin:0 0 12px;font-size:15px;color:#475569;line-height:1.7">Thank you for shopping with Majo Gadgets! 🛍️</p>
      <p style="margin:0;font-size:13px;color:#94A3B8;line-height:1.6">— The Majo Gadgets Team</p>
    '''
    resend.Emails.send({'from': FROM, 'to': email, 'subject': f'Order Confirmed — #{order_code}', 'html': _wrap(body)})


def send_order_shipped_email(name: str, email: str, order_code: str, delivery_address: str):
    safe_address = (delivery_address or '').replace('{', '{{').replace('}', '}}')
    body = f'''
      <div style="text-align:center;margin-bottom:24px">
        {_circle_icon(ICO_TRUCK, '#DCFCE7', '#16A34A')}
        <h2 style="margin:0 0 6px;font-size:22px;color:#0F172A">Your Order is On Its Way!</h2>
        <p style="margin:0;font-size:14px;color:#64748B">Hi <strong>{name}</strong>, your package has been shipped and is heading to you.</p>
      </div>

      {_progress_bar('shipped')}

      <div style="background:#ffffff;border:1px solid #E2E8F0;border-radius:10px;padding:16px 20px;margin-bottom:24px">
        <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.5px">Order Code</p>
        <p style="margin:0 0 12px;font-size:22px;font-weight:800;color:#16A34A;letter-spacing:1.5px">{order_code}</p>
        <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.5px">Delivering To</p>
        <p style="margin:0 0 16px;font-size:13px;color:#334155">{safe_address}</p>
        <hr style="border:none;border-top:1px solid #E2E8F0;margin:0 0 16px" />
        {_info_row(ICO_PACKAGE,  'Your package is on the way')}
        {_info_row(ICO_MAP_PIN,  'Please ensure someone is available to receive it')}
        {_info_row(ICO_PHONE,    'Our delivery team may call you before arrival')}
      </div>

      <p style="margin:0;font-size:13px;color:#94A3B8;line-height:1.6">If you have any questions about your delivery, reply to this email and we&#39;ll be happy to help.</p>
    '''
    resend.Emails.send({'from': FROM, 'to': email, 'subject': f'Your Order is Shipped — #{order_code}', 'html': _wrap(body)})


def send_order_delivered_email(name: str, email: str, order_code: str, total: str = '', items: list | None = None, delivery_address: str = ''):
    items = items or []
    item_rows = _item_rows(items) if items else ''
    body = f'''
      <div style="text-align:center;margin-bottom:24px">
        {_circle_icon(ICO_CHECK, '#ECFDF5', '#059669')}
        <h2 style="margin:0 0 6px;font-size:22px;color:#0F172A">Order Delivered!</h2>
        <p style="margin:0;font-size:14px;color:#64748B">Hi <strong>{name}</strong>,</p>
      </div>

      <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7">
        Your order <strong>#{order_code}</strong> has been delivered! 🎉📦
      </p>
      <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7">
        We hope you enjoy your new purchase from Majo Gadgets.
      </p>
      <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7">
        Thank you for trusting us with your order. We truly appreciate your support and hope to see you again soon.
      </p>
      <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7">
        Enjoy your new gadget! ❤️
      </p>

      {_progress_bar('delivered')}

      <div style="background:#ffffff;border:1px solid #E2E8F0;border-radius:10px;padding:16px 20px;margin-bottom:24px">
        <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.5px">Order Code</p>
        <p style="margin:0 0 12px;font-size:22px;font-weight:800;color:#F59E0B;letter-spacing:1.5px">{order_code}</p>
        <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.5px">Your Items</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px">
          {item_rows}
          <tr>
            <td colspan="2" style="padding-top:12px;font-size:14px;font-weight:700;color:#0F172A">Total</td>
            <td style="padding-top:12px;font-size:15px;font-weight:800;color:#F59E0B;text-align:right">{f'UGX {total}' if total else '—'}</td>
          </tr>
        </table>
      </div>

      <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.7">Enjoyed your experience? Please take a moment to rate your order — it helps us serve you better.</p>
      <a href="{settings.FRONTEND_URL}/rate/{order_code}" style="display:inline-block;padding:14px 32px;background:#F59E0B !important;background-color:#F59E0B !important;color:#ffffff !important;border:1px solid #F59E0B;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none !important;line-height:1.4;vertical-align:middle">Rate Your Order</a>
      <p style="margin:28px 0 0;font-size:13px;color:#94A3B8;line-height:1.6">— The Majo Gadgets Team</p>
    '''
    resend.Emails.send({'from': FROM, 'to': email, 'subject': f'Order Delivered — #{order_code}', 'html': _wrap(body)})


def send_order_rating_email(name: str, email: str, order_code: str, rating_url: str):
    body = f'''
      <div style="text-align:center;margin-bottom:24px">
        {_circle_icon(ICO_STAR, '#FEF3C7', '#F59E0B')}
        <h2 style="margin:0 0 6px;font-size:22px;color:#0F172A">Rate Your Experience</h2>
        <p style="margin:0;font-size:14px;color:#64748B">Hi <strong>{name}</strong>,</p>
      </div>

      <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7">
        We’d love to hear about your experience with Majo Gadgets! ⭐
      </p>
      <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7">
        Your order <strong>#{order_code}</strong> has been delivered, and we’d appreciate it if you could take a moment to rate the <strong>service and delivery experience</strong>.
      </p>
      <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7">
        Your feedback helps us improve and provide an even better shopping experience for you and other customers.
      </p>

      <div style="text-align:center;margin-bottom:28px">
        <a href="{rating_url}" style="display:inline-block;padding:14px 40px;background:#F59E0B !important;background-color:#F59E0B !important;color:#ffffff !important;border:1px solid #F59E0B;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none !important">
          Rate your experience
        </a>
      </div>

      <p style="margin:0 0 12px;font-size:15px;color:#475569;line-height:1.7">Thank you for shopping with Majo Gadgets! ❤️</p>
      <p style="margin:0;font-size:13px;color:#94A3B8;line-height:1.6">— The Majo Gadgets Team</p>
    '''
    resend.Emails.send({'from': FROM, 'to': email, 'subject': f'Rate Your Experience — #{order_code}', 'html': _wrap(body)})


def send_order_cancelled_email(name: str, email: str, order_code: str, reason: str):
    body = f'''
      <div style="text-align:center;margin-bottom:24px">
        {_circle_icon(ICO_X_CIRCLE, '#FEF2F2', '#DC2626')}
        <h2 style="margin:0 0 6px;font-size:22px;color:#0F172A">Order Cancelled</h2>
        <p style="margin:0;font-size:14px;color:#64748B">Hi <strong>{name}</strong>, your order <strong>#{order_code}</strong> has been cancelled.</p>
      </div>

      <div style="background:#ffffff;border:1px solid #E2E8F0;border-radius:10px;padding:16px 20px;margin-bottom:24px">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.5px">Cancellation Reason</p>
        <p style="margin:0;font-size:14px;color:#334155;line-height:1.6">{reason}</p>
      </div>

      <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7">If you believe this was a mistake or need further assistance, please don't hesitate to contact us.</p>
      <a href="{settings.FRONTEND_URL}" style="display:inline-block;padding:14px 32px;background:#F59E0B !important;background-color:#F59E0B !important;color:#ffffff !important;border:1px solid #F59E0B;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none !important;line-height:1.4;vertical-align:middle">Continue Shopping &rarr;</a>
      <p style="margin:28px 0 0;font-size:13px;color:#94A3B8;line-height:1.6">We hope to serve you again soon. Thank you for choosing Majo Gadgets.</p>
    '''
    resend.Emails.send({'from': FROM, 'to': email, 'subject': f'Order Cancelled — #{order_code}', 'html': _wrap(body)})


def send_password_reset_email(name: str, email: str, reset_url: str):
    body = f'''
      <div style="text-align:center;margin-bottom:28px">
        {_circle_icon(ICO_LOCK, '#DCFCE7', '#16A34A')}
        <h2 style="margin:0 0 8px;font-size:22px;color:#0F172A">Password Reset Request</h2>
        <p style="margin:0;font-size:14px;color:#64748B">We received a request to reset your password</p>
      </div>
      <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7">
        Hi <strong>{name}</strong>, no worries — it happens to the best of us! Click the button below to create a new password for your Majo Gadgets account.
      </p>
      <div style="background:#ffffff;border:1px solid #E2E8F0;border-radius:10px;padding:20px;margin-bottom:28px">
        <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.5px">Security Notice</p>
        {_info_row(ICO_CLOCK, 'This link expires in <strong>1 hour</strong>', '#475569')}
        {_info_row(ICO_LOCK,  'For your security, this link can only be used once', '#475569')}
        {_info_row(ICO_MAIL,  'Only you should have access to this email', '#475569')}
      </div>
      <div style="text-align:center;margin-bottom:28px">
        <a href="{reset_url}" style="display:inline-block;padding:14px 40px;background:#F59E0B !important;background-color:#F59E0B !important;color:#ffffff !important;border:1px solid #F59E0B;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none !important">
          Reset My Password &rarr;
        </a>
      </div>
      <p style="margin:0 0 8px;font-size:13px;color:#64748B;line-height:1.6">If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="margin:0 0 24px;font-size:12px;color:#16A34A;word-break:break-all">{reset_url}</p>
      <p style="margin:0;font-size:13px;color:#94A3B8;line-height:1.6">If you didn't request a password reset, you can safely ignore this email.</p>
    '''
    resend.Emails.send({'from': FROM, 'to': email, 'subject': 'Reset your Majo Gadgets password', 'html': _wrap(body)})
