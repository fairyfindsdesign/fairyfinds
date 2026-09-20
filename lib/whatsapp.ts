import { CartItem, CustomerOrderDetails, CustomInquiryDetails } from './types';

export function cleanPhoneNumber(phone: string): string {
  // Strip spaces, dashes, parentheses, leading plus for wa.me
  return phone.replace(/[^0-9]/g, '');
}

export function generateOrderWhatsAppUrl(
  items: CartItem[],
  customer: CustomerOrderDetails,
  currencySymbol: string,
  businessNumber: string,
  orderNumber?: string
): string {
  const cleanNumber = cleanPhoneNumber(businessNumber);

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = items.reduce((acc, item) => acc + (Number(item.product.delivery_fee) || 0) * item.quantity, 0);
  const total = subtotal + deliveryFee;

  const itemsList = items
    .map((item, idx) => {
      const productCode = item.product.product_code || item.product.id;
      const variantSku = item.product.variants?.find((v) => v.size === item.size)?.sku;
      const skuPart = variantSku ? `\n   • Variant SKU: ${variantSku}` : '';
      const lineTotal = item.price * item.quantity;
      const itemDelivery = Number(item.product.delivery_fee) || 0;
      const deliveryPart = itemDelivery > 0 ? `\n   • Delivery: ${currencySymbol} ${(itemDelivery * item.quantity).toLocaleString()}` : '\n   • Delivery: Free';
      return `${idx + 1}. *${item.product.name}*\n   • Product ID / Code: *${productCode}*${skuPart}\n   • Size: ${item.size}\n   • Quantity: ${item.quantity}\n   • Price: ${currencySymbol} ${item.price.toLocaleString()} (Item Total: ${currencySymbol} ${lineTotal.toLocaleString()})${deliveryPart}`;
    })
    .join('\n\n');

  const deliveryFeeText = deliveryFee > 0 ? `${currencySymbol} ${deliveryFee.toLocaleString()}` : 'Free Delivery';
  const orderRef = orderNumber ? `\n*Order Reference: #${orderNumber}*\n` : '';

  const message = `*Fairy Finds Boutique - New Order*${orderRef}

*Customer Details:*
• Name: ${customer.name}
• Phone: ${customer.phone}
• Delivery Address: ${customer.address}${customer.notes ? `\n• Special Notes: ${customer.notes}` : ''}

*Ordered Items:*
${itemsList}

*Order Summary:*
• Subtotal: ${currencySymbol} ${subtotal.toLocaleString()}
• Delivery Fee: ${deliveryFeeText}
• Total: ${currencySymbol} ${total.toLocaleString()}`;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

export function generateCustomInquiryWhatsAppUrl(
  inquiry: CustomInquiryDetails,
  businessNumber: string
): string {
  const cleanNumber = cleanPhoneNumber(businessNumber);

  const message = `*Fairy Finds Boutique - Custom Made Inquiry*

*Customer Name:* ${inquiry.name}
*Phone:* ${inquiry.phone}
*Garment Type:* ${inquiry.dressType}
*Size / Measurements:* ${inquiry.sizeOrMeasurements}
${inquiry.preferredFabric ? `*Preferred Fabric:* ${inquiry.preferredFabric}\n` : ''}${inquiry.preferredColor ? `*Preferred Color:* ${inquiry.preferredColor}\n` : ''}${inquiry.notes ? `*Additional Notes:* ${inquiry.notes}\n` : ''}
_(I will share reference images and photos directly in this chat)_`;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}
