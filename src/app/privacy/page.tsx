import type { Metadata } from 'next';
import { InfoPage } from '@/components/layout/info-page';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How EthioFashion handles customer information.',
};

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="Company"
      title="Privacy Policy"
      intro="This page explains the basic way we handle customer data on the store."
      sections={[
        { title: 'Information we collect', body: 'We collect the details needed to process orders, deliver products, and support your account.' },
        { title: 'How we use it', body: 'We use your information to manage orders, improve service, and communicate about purchases.' },
        { title: 'Your control', body: 'You can contact support if you need help with account or order data questions.' },
      ]}
    />
  );
}
