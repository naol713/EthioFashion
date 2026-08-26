import type { ReactElement } from 'react';

export function OrderConfirmationEmail({ orderNumber, totalAmount, currency = 'ETB' }: { orderNumber: string; totalAmount: number; currency?: string }): ReactElement {
  return <div style={{ fontFamily: 'Arial, sans-serif', color: '#0a0a0a' }}><h1>Order confirmed</h1><p>Thank you for shopping with EthioFashion.</p><p>Your order number is <strong>{orderNumber}</strong>.</p><hr /><p>Total: <strong>{totalAmount.toLocaleString()} {currency}</strong></p><p>We will update you as your order moves through delivery.</p></div>;
}