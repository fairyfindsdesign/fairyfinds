import { Resend } from 'resend';
import { Order } from '@/lib/types';
import { SITE_URL } from '@/lib/seo/constants';

/**
 * Formats order timestamp into Indian Standard Time (IST / Asia-Kolkata)
 * Example output: "21 Sep 2026, 10:45 AM IST"
 */
function formatOrderDateTimeIST(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const formatted = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);

    return `${formatted} IST`;
  } catch {
    return dateString;
  }
}

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Builds responsive, email-client-safe HTML notification
 */
export function buildOrderEmailHtml(order: Order, currencySymbol: string = '₹'): string {
  const adminUrl = `${process.env.NEXT_PUBLIC_BASE_URL || SITE_URL}/admin/orders`;
  const formattedDate = formatOrderDateTimeIST(order.created_at);
  const cleanPhone = order.customer_phone.replace(/[^0-9]/g, '');

  const itemsRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 10px; border-bottom: 1px solid #EFEFEF; vertical-align: top;">
          <div style="font-weight: 600; color: #1A1A1A; font-size: 14px; line-height: 1.3;">
            ${escapeHtml(item.product_name)}
          </div>
          <div style="font-size: 11px; color: #888888; margin-top: 2px;">
            Code: ${escapeHtml(item.product_code || 'N/A')}
          </div>
        </td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #EFEFEF; text-align: center; font-size: 13px; color: #333333; vertical-align: top;">
          <span style="display: inline-block; background-color: #F3F3F3; padding: 2px 8px; border-radius: 3px; font-weight: 500;">
            ${escapeHtml(item.size)}
          </span>
        </td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #EFEFEF; text-align: center; font-size: 13px; color: #333333; vertical-align: top;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #EFEFEF; text-align: right; font-size: 13px; color: #1A1A1A; font-weight: 600; vertical-align: top; white-space: nowrap;">
          ${currencySymbol}&nbsp;${Number(item.line_total).toLocaleString('en-IN')}
        </td>
      </tr>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Order #${escapeHtml(order.order_number)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF9F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1A1A1A;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FAF9F6; padding: 25px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #E8E6E1; border-radius: 4px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
          
          <!-- Top Boutique Accent Stripe -->
          <tr>
            <td style="background-color: #FF55D2; height: 4px; line-height: 4px; font-size: 1px;">&nbsp;</td>
          </tr>

          <!-- Header Section -->
          <tr>
            <td style="padding: 30px 25px 20px 25px; text-align: center; border-bottom: 1px solid #F0EFEA;">
              <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #FF55D2; font-weight: 700; display: block; margin-bottom: 6px;">
                Fairy Finds Boutique
              </span>
              <h1 style="margin: 0 0 8px 0; font-family: Georgia, serif; font-size: 26px; font-weight: normal; color: #1A1A1A; letter-spacing: 0.5px;">
                New Order Received
              </h1>
              <div style="display: inline-block; background-color: #FAF9F6; border: 1px solid #E8E6E1; padding: 4px 14px; border-radius: 20px; font-size: 14px; font-weight: 600; color: #1A1A1A;">
                Order #${escapeHtml(order.order_number)}
              </div>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #888888;">
                Placed on ${formattedDate}
              </p>
            </td>
          </tr>

          <!-- Customer Details -->
          <tr>
            <td style="padding: 24px 25px; background-color: #FCFBF9; border-bottom: 1px solid #F0EFEA;">
              <h2 style="margin: 0 0 14px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #666666; font-weight: 700;">
                Customer Details
              </h2>
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="35%" style="font-size: 13px; color: #777777; padding-bottom: 8px; vertical-align: top;">Customer Name</td>
                  <td style="font-size: 13px; color: #1A1A1A; font-weight: 600; padding-bottom: 8px; vertical-align: top;">${escapeHtml(order.customer_name)}</td>
                </tr>
                <tr>
                  <td style="font-size: 13px; color: #777777; padding-bottom: 8px; vertical-align: top;">WhatsApp / Phone</td>
                  <td style="font-size: 13px; padding-bottom: 8px; vertical-align: top;">
                    <a href="https://wa.me/${cleanPhone}" style="color: #25D366; text-decoration: none; font-weight: 600;">
                      ${escapeHtml(order.customer_phone)} &#8594; (Chat on WhatsApp)
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 13px; color: #777777; padding-bottom: 8px; vertical-align: top;">Delivery Address</td>
                  <td style="font-size: 13px; color: #333333; line-height: 1.4; padding-bottom: 8px; vertical-align: top;">
                    ${escapeHtml(order.delivery_address).replace(/\n/g, '<br>')}
                  </td>
                </tr>
                ${
                  order.notes
                    ? `
                <tr>
                  <td style="font-size: 13px; color: #777777; vertical-align: top; padding-top: 4px;">Customer Notes</td>
                  <td style="font-size: 13px; color: #9A3412; background-color: #FFF7ED; padding: 6px 10px; border-radius: 4px; border: 1px solid #FED7AA; line-height: 1.4; vertical-align: top;">
                    ${escapeHtml(order.notes)}
                  </td>
                </tr>
                `
                    : ''
                }
              </table>
            </td>
          </tr>

          <!-- Items Ordered -->
          <tr>
            <td style="padding: 24px 25px 15px 25px;">
              <h2 style="margin: 0 0 14px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #666666; font-weight: 700;">
                Items Ordered
              </h2>
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #F8F7F4; border-bottom: 1px solid #EAE8E3;">
                    <th align="left" style="padding: 8px 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #777777;">Item</th>
                    <th align="center" style="padding: 8px 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #777777;">Size</th>
                    <th align="center" style="padding: 8px 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #777777;">Qty</th>
                    <th align="right" style="padding: 8px 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #777777;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Price Summary -->
          <tr>
            <td style="padding: 0 25px 25px 25px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FAF9F6; border: 1px solid #EAE8E3; border-radius: 4px; padding: 14px 16px;">
                <tr>
                  <td style="font-size: 13px; color: #666666; padding-bottom: 6px;">Subtotal</td>
                  <td align="right" style="font-size: 13px; color: #1A1A1A; padding-bottom: 6px; font-weight: 500;">
                    ${currencySymbol}&nbsp;${Number(order.subtotal).toLocaleString('en-IN')}
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 13px; color: #666666; padding-bottom: 8px;">Delivery Fee</td>
                  <td align="right" style="font-size: 13px; color: #1A1A1A; padding-bottom: 8px; font-weight: 500;">
                    ${
                      Number(order.delivery_fee) > 0
                        ? `${currencySymbol}&nbsp;${Number(order.delivery_fee).toLocaleString('en-IN')}`
                        : '<span style="color: #059669; font-weight: 600;">Free Delivery</span>'
                    }
                  </td>
                </tr>
                <tr style="border-top: 1px solid #E0DED7;">
                  <td style="font-size: 15px; color: #1A1A1A; font-weight: 700; padding-top: 8px;">Total</td>
                  <td align="right" style="font-size: 17px; color: #1A1A1A; font-weight: 700; padding-top: 8px;">
                    ${currencySymbol}&nbsp;${Number(order.total).toLocaleString('en-IN')}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- View in Admin CTA -->
          <tr>
            <td style="padding: 0 25px 30px 25px; text-align: center;">
              <a href="${adminUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #1A1A1A; color: #FFFFFF; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; text-decoration: none; padding: 14px 32px; border-radius: 2px;">
                View Order in Admin &#8594;
              </a>
              <p style="margin: 12px 0 0 0; font-size: 11px; color: #999999;">
                Authenticate to manage status, review fulfillment, or update customer.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 25px; background-color: #F5F4F0; border-top: 1px solid #EAE8E3; text-align: center; font-size: 11px; color: #888888; line-height: 1.5;">
              <p style="margin: 0 0 4px 0; font-weight: 600; color: #555555;">Fairy Finds Boutique</p>
              <p style="margin: 0;">Neendoor, Kottayam, Kerala &bull; Free Order Alert Service</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  skipped?: boolean;
}

/**
 * Sends order alert email to the store owner using Resend.
 * Safe and non-blocking: never throws an unhandled error to the customer.
 */
export async function sendOrderEmailAlert(
  order: Order,
  currencySymbol: string = '₹'
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.ORDER_NOTIFICATION_EMAIL;
  const isEnabled = process.env.EMAIL_NOTIFICATIONS_ENABLED !== 'false';

  // Guard against missing configuration or disabled state
  if (!apiKey || !toEmail || !isEnabled) {
    const reason = !apiKey
      ? 'RESEND_API_KEY is missing'
      : !toEmail
      ? 'ORDER_NOTIFICATION_EMAIL is missing'
      : 'EMAIL_NOTIFICATIONS_ENABLED is set to false';

    console.warn(`[order-email] Notification skipped for order #${order.order_number}: ${reason}`);
    return {
      success: false,
      skipped: true,
      error: `Email notification skipped: ${reason}`,
    };
  }

  const fromEmail =
    process.env.RESEND_FROM_EMAIL ||
    'Fairy Finds <orders@fairyfindsboutique.store>';

  try {
    const resend = new Resend(apiKey);
    const subject = `🛍️ New Fairy Finds Order — #${order.order_number}`;
    const html = buildOrderEmailHtml(order, currencySymbol);

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail.trim()],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error(`[order-email] Resend API error for order #${order.order_number}:`, error.message);
      return {
        success: false,
        error: error.message || 'Resend API returned an error',
      };
    }

    console.log(`[order-email] Successfully sent order alert for #${order.order_number} (ID: ${data?.id})`);
    return {
      success: true,
      messageId: data?.id,
    };
  } catch (err: any) {
    console.error(`[order-email] Unexpected error sending email for #${order.order_number}:`, err?.message || err);
    return {
      success: false,
      error: err?.message || 'Failed to dispatch email via Resend',
    };
  }
}

/**
 * Sends a test email to verify Resend setup without creating an actual customer order.
 */
export async function sendTestOrderEmail(currencySymbol: string = '₹'): Promise<SendEmailResult> {
  const mockOrder: Order = {
    id: 'test-order-sample',
    order_number: 'FF260921-TEST',
    customer_name: 'Anu Joseph (Sample Client)',
    customer_phone: '+91 98765 43210',
    delivery_address: 'Fairy Finds Atelier, Neendoor PO, Kottayam, Kerala - 686601',
    notes: 'Please verify packaging with signature pink tissue paper.',
    status: 'new',
    is_read: false,
    email_notification_status: 'pending',
    created_at: new Date().toISOString(),
    subtotal: 3499,
    delivery_fee: 100,
    total: 3599,
    items: [
      {
        product_id: 'prod-sample-1',
        product_code: 'FF-SAR-01',
        product_name: 'Crimson Heritage Kanjivaram Saree',
        size: 'Free Size',
        quantity: 1,
        unit_price: 2499,
        delivery_fee: 100,
        line_total: 2499,
      },
      {
        product_id: 'prod-sample-2',
        product_code: 'FF-BLS-04',
        product_name: 'Bespoke Silk Embellished Blouse',
        size: 'M',
        quantity: 1,
        unit_price: 1000,
        delivery_fee: 0,
        line_total: 1000,
      },
    ],
  };

  return sendOrderEmailAlert(mockOrder, currencySymbol);
}
