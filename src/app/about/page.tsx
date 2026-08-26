import type { Metadata } from 'next';
import { InfoPage } from '@/components/layout/info-page';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about EthioFashion and our mission.',
};

export default function AboutPage() {
  return (
    <div className="bg-gray-50">
      <InfoPage
        eyebrow="Company"
        title="About Us"
        intro="EthioFashion is built to bring Ethiopian style, craftsmanship, and practical shopping into one place."
        sections={[
          { title: 'What we do', body: 'We curate clothing, shoes, and accessories that fit the modern Ethiopian shopper.' },
          { title: 'Our promise', body: 'We focus on quality products, clear sizing, and a shopping experience that feels dependable.' },
        ]}
      />
      <div id="story" className="px-6 pb-12">
        <div className="mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-[#0a0a0a]">Our Story</h2>
          <p className="mt-2 text-sm leading-7 text-gray-600">
            We started with a simple idea: make Ethiopian fashion easier to browse, easier to buy, and easier to trust.
          </p>
        </div>
      </div>
    </div>
  );
}
