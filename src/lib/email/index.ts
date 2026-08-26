import { renderToStaticMarkup } from 'react-dom/server';
import { OrderConfirmationEmail } from '@/emails/order-confirmation';
import { PasswordResetEmail } from '@/emails/password-reset';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function renderEmail(element: Parameters<typeof renderToStaticMarkup>[0]) {
  return `<!doctype html><html><body>${renderToStaticMarkup(element)}</body></html>`;
}

export async function sendEmail({ to, subject, html }: { to: string | string[]; subject: string; html: string }) {
  if (!process.env.RESEND_API_KEY) {
    return { success: false, skipped: true, error: 'RESEND_API_KEY is not configured' };
  }
  
  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev', // Mandatory sandbox sender
      to: 'delivered+user@resend.dev', // Sandbox testing email
      subject,
      html,
    });
    
    return { success: true, skipped: false, id: data.data?.id };
  } catch (error) {
    return { success: false, skipped: false, error: (error as Error).message || 'Email delivery failed' };
  }
}

export async function sendOrderConfirmationEmail(input: { to: string; orderNumber: string; totalAmount: number; currency?: string }) {
  return sendEmail({ to: input.to, subject: `Order confirmed: ${input.orderNumber}`, html: renderEmail(OrderConfirmationEmail(input)) });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  return sendEmail({ to, subject: 'Reset your EthioFashion password', html: renderEmail(PasswordResetEmail({ resetUrl })) });
}