import Image from "next/image";
import Link from "next/link";
import { Container } from "./container";
import { ExpandableSocialLinks } from "./expandable-social-links";

export function Footer() {
  return (
    <footer className="bg-[#070707] text-white">
      <Container>
        <div className="py-4 lg:py-5">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-2 max-w-xl">
              <Link href="/" className="flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="EthioFashion"
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-lg object-contain"
                />
                <span className="font-bold text-white text-base tracking-tight">
                  EthioFashion
                </span>
              </Link>
              <p className="text-[11px] leading-5 text-white/48 max-w-lg">
                Premium Ethiopian fashion for the modern shopper, with a calmer
                buying experience and delivery that feels dependable.
              </p>

              <div className="flex flex-wrap gap-2">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-full bg-[#D4AF37] px-3 py-1.5 text-[10px] font-semibold text-black transition-colors hover:bg-[#f1c94b]"
                >
                  Shop Collection
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-semibold text-white/78 transition-colors hover:border-white/30 hover:text-white"
                >
                  Contact Support
                </Link>
              </div>

              <ExpandableSocialLinks />
            </div>

            <div className="lg:justify-self-end">
              <div className="inline-flex flex-col gap-1 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
                  Contact
                </p>
                <p className="text-[11px] text-white/72">+251 911 000 000</p>
                <p className="text-[11px] text-white/72">
                  support@ethiofashion.com
                </p>
                <p className="text-[11px] text-white/72">
                  Addis Ababa, Ethiopia
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[9px] text-white/26">
            © {new Date().getFullYear()} EthioFashion Store. All rights
            reserved.
          </p>
          <p className="text-[9px] text-white/16">
            Made in Addis Ababa, Ethiopia
          </p>
        </div>
      </Container>
    </footer>
  );
}
