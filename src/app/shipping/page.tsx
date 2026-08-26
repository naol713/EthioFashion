import type { Metadata } from 'next';
import { InfoPage } from '@/components/layout/info-page';

export const metadata: Metadata = {
  title: 'Shipping Info',
  description: 'Shipping details for EthioFashion orders.',
};

export default function ShippingPage() {
  return (
    <InfoPage
      eyebrow="Support"
      title="Shipping Info"
      intro="We aim to keep delivery simple, predictable, and clear for every customer."
      sections={[
        { title: 'Addis Ababa', body: 'Local deliveries usually arrive within 1 to 3 business days.' },
        { title: 'Outside Addis', body: 'Delivery times vary by location and courier availability.' },
        { title: 'Order updates', body: 'Once your order is processed, you will receive updates as it moves through fulfillment.' },
      ]}
    />
  );
}
