import { Container } from './container';

type InfoSection = {
  title: string;
  body: string;
};

type InfoPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: InfoSection[];
};

export function InfoPage({ eyebrow, title, intro, sections }: InfoPageProps) {
  return (
    <div className="bg-gray-50 py-12">
      <Container className="max-w-4xl">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-bold text-[#0a0a0a]">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600">{intro}</p>
        </div>

        <div className="space-y-4">
          {sections.map((section) => (
            <section key={section.title} className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-[#0a0a0a]">{section.title}</h2>
              <p className="mt-2 text-sm leading-7 text-gray-600">{section.body}</p>
            </section>
          ))}
        </div>
      </Container>
    </div>
  );
}
