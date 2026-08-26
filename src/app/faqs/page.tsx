import type { Metadata } from 'next';
import { InfoPage } from '@/components/layout/info-page';

export const metadata: Metadata = {
  title: 'FAQs',
  description: 'Answers to common shopping, shipping, and returns questions.',
};

export default function FAQsPage() {
  return (
    <InfoPage
      eyebrow="Support"
      title="Frequently Asked Questions"
      intro="A quick place to find the answers customers ask most often."
      sections={[
        { title: 'When will my order arrive?', body: 'Orders within Addis Ababa usually arrive in 1 to 3 business days. Other locations depend on delivery service availability.' },
        { title: 'Can I change or cancel an order?', body: 'If your order has not yet shipped, contact support as soon as possible and we will help review the request.' },
        { title: 'How do I pick a size?', body: 'Use the size selector on the product page. Clothing uses letter sizes and shoes use numeric sizes.' },
      ]}
    />
  );
}
