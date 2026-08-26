import type { Metadata } from 'next';
import { InfoPage } from '@/components/layout/info-page';

export const metadata: Metadata = {
  title: 'Size Guide',
  description: 'Clothing and shoe sizing guidance for EthioFashion products.',
};

export default function SizeGuidePage() {
  return (
    <InfoPage
      eyebrow="Support"
      title="Size Guide"
      intro="Use the product size selector for the most accurate options the seller has added."
      sections={[
        { title: 'Clothing', body: 'Clothing items typically use S, M, L, XL, and similar letter-based options.' },
        { title: 'Shoes', body: 'Shoe listings use numeric sizes such as 39, 40, 41, 42, and 43.' },
        { title: 'Best fit', body: 'Check the product page for the exact sizes available on each item before checkout.' },
      ]}
    />
  );
}
