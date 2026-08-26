import type { Metadata } from 'next';
import { InfoPage } from '@/components/layout/info-page';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Store terms for using EthioFashion.',
};

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="Company"
      title="Terms of Service"
      intro="These are the general terms that apply when shopping with EthioFashion."
      sections={[
        { title: 'Orders', body: 'Order submission does not guarantee acceptance until payment and availability are confirmed.' },
        { title: 'Pricing', body: 'Prices may change without notice, but confirmed orders follow the price shown at checkout.' },
        { title: 'Use of the site', body: 'Please use the site responsibly and keep your account information accurate.' },
      ]}
    />
  );
}
