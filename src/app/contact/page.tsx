import Link from 'next/link';
import type { Metadata } from 'next';
import { InfoPage } from '@/components/layout/info-page';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Reach the EthioFashion support team for help with orders, delivery, and products.',
};

export default function ContactPage() {
  return (
    <>
      <InfoPage
        eyebrow="Support"
        title="Contact Us"
        intro="Our team is here for order help, delivery questions, product support, and general store inquiries."
        sections={[
          { title: 'Phone', body: '+251 911 000 000' },
          { title: 'Email', body: 'support@ethiofashion.com' },
          { title: 'Location', body: 'Addis Ababa, Ethiopia' },
        ]}
      />
      <div className="bg-gray-50 px-6 pb-12">
        <div className="mx-auto flex max-w-4xl gap-3">
          <Button asChild className="bg-[#0a0a0a] text-white hover:bg-[#1a1a1a]">
            <Link href="mailto:support@ethiofashion.com">Email Support</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
