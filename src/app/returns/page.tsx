import type { Metadata } from 'next';
import { InfoPage } from '@/components/layout/info-page';

export const metadata: Metadata = {
  title: 'Returns & Exchanges',
  description: 'Return and exchange guidance for EthioFashion orders.',
};

export default function ReturnsPage() {
  return (
    <InfoPage
      eyebrow="Support"
      title="Returns & Exchanges"
      intro="We want returns to feel straightforward, not stressful."
      sections={[
        { title: 'Eligibility', body: 'Items should be unworn, unused, and returned in their original condition when possible.' },
        { title: 'Exchanges', body: 'If a size or color does not fit, contact support and we will help review exchange options.' },
        { title: 'Damaged items', body: 'If something arrives damaged or incorrect, reach out right away with your order number.' },
      ]}
    />
  );
}
