'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';

type Slide = {
  src: string;
  bg: string;
  title: string;
  subtitle: string;
  href: string;
};

const SLIDES: Slide[] = [
  {
    src: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
    bg: '#b68f12',
    title: 'Heritage Dresses',
    subtitle: 'Hand-finished Ethiopian womenswear',
    href: '/products?gender=FEMALE',
  },
  {
    src: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
    bg: '#b3222f',
    title: 'Premium Shoes',
    subtitle: 'Leather styles made to last',
    href: '/products?category=shoes',
  },
  {
    src: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
    bg: '#26324a',
    title: 'Modern Tailoring',
    subtitle: 'Sharp menswear for everyday wear',
    href: '/products?gender=MALE',
  },
  {
    src: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80',
    bg: '#4c5f31',
    title: 'Made In Ethiopia',
    subtitle: 'Craft and texture with character',
    href: '/products',
  },
];

const GHOST_TEXT = 'ETHIOFASHION';

export function PremiumHero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const contentScale = isMobile ? 0.74 : 1;

  useEffect(() => {
    const updateMobile = () => setIsMobile(window.innerWidth < 640);
    updateMobile();
    window.addEventListener('resize', updateMobile);

    SLIDES.forEach((slide) => {
      const image = new window.Image();
      image.src = slide.src;
    });

    return () => window.removeEventListener('resize', updateMobile);
  }, []);

  function navigate(direction: 'next' | 'prev') {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex((current) => {
      if (direction === 'next') return (current + 1) % SLIDES.length;
      return (current + SLIDES.length - 1) % SLIDES.length;
    });
    window.setTimeout(() => setIsAnimating(false), 650);
  }

  const leftIndex = (activeIndex + SLIDES.length - 1) % SLIDES.length;
  const rightIndex = (activeIndex + 1) % SLIDES.length;
  const backIndex = (activeIndex + 2) % SLIDES.length;

  const activeSlide = SLIDES[activeIndex];
  const noiseSvg = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#n)" opacity="0.08"/></svg>`,
  );
  const sharedTransition = '650ms cubic-bezier(0.4, 0, 0.2, 1)';

  const roles = [leftIndex, activeIndex, rightIndex, backIndex] as const;

  if (isMobile) {
    return (
      <section
        className="relative w-full overflow-hidden text-white"
        style={{
          backgroundColor: activeSlide.bg,
          transition: `background-color ${sharedTransition}`,
        }}
      >
        <div className="relative min-h-[100svh] w-full overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none z-[50] opacity-40"
            style={{
              backgroundImage: `url("data:image/svg+xml,${noiseSvg}")`,
              backgroundRepeat: 'repeat',
              backgroundSize: '200px 200px',
            }}
          />

          <div
            className="absolute inset-x-0 flex items-center justify-center pointer-events-none select-none z-[2]"
            style={{ top: '11%' }}
          >
            <h2 className="text-center font-black uppercase leading-none text-white/10 text-[clamp(3.2rem,18vw,5.9rem)]">
              {GHOST_TEXT}
            </h2>
          </div>

          <div className="relative z-[20] flex min-h-[100svh] flex-col px-4 pb-5 pt-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/90">
                  EthioFashion
                </p>
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/45">
                  Premium Ethiopian style
                </p>
              </div>

              <div className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/70">
                Addis Ababa / Nationwide delivery
              </div>
            </div>

            <div className="mt-5 flex flex-1 flex-col items-center">
              <div className="w-full max-w-[21rem] space-y-3">
                <div className="space-y-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/60">
                    New season / premium essentials
                  </p>
                  <h1 className="text-[clamp(2.15rem,8.2vw,2.9rem)] font-black leading-[1.02]">
                    EthioFashion
                  </h1>
                  <p className="max-w-lg text-sm leading-7 text-white/70">
                    Discover handcrafted clothing, polished footwear, and modern staples with clearer
                    sizing, better presentation, and a calmer shopping experience.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 pt-1">
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-[#f1c94b]"
                  >
                    Shop Collection
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/products?featured=true"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/85 transition-colors hover:border-white/35 hover:bg-white/10 hover:text-white"
                  >
                    View Featured
                  </Link>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    { icon: Sparkles, label: 'Handpicked drops' },
                    { icon: Truck, label: 'Nationwide delivery' },
                    { icon: ShieldCheck, label: 'Reliable sizing' },
                  ].map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-[11px] font-medium text-white/80"
                    >
                      <Icon className="h-3.5 w-3.5 text-[#D4AF37]" />
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 w-full max-w-[21rem]">
                <div className="relative mx-auto aspect-[0.82/1] w-[78vw] max-w-[19rem] overflow-hidden rounded-[28px] border border-white/14 bg-white/5 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
                  <Image
                    src={activeSlide.src}
                    alt={activeSlide.title}
                    fill
                    draggable={false}
                    sizes="(max-width: 640px) 78vw, 19rem"
                    className="object-cover object-center"
                    priority
                  />
                </div>

                <div className="mt-3 rounded-2xl border border-white/14 bg-black/55 px-4 py-3 backdrop-blur-md">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/55">
                    Featured collection
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">{activeSlide.title}</p>
                  <p className="mt-1 text-xs leading-6 text-white/72">{activeSlide.subtitle}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <button
                onClick={() => navigate('prev')}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/5 text-white transition-colors hover:bg-white/12"
                aria-label="Previous featured look"
                type="button"
              >
                <ArrowLeft className="h-4.5 w-4.5" />
              </button>

              <Link
                href={activeSlide.href}
                className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/90 transition-opacity duration-200 hover:text-white"
              >
                Discover it
                <ArrowRight className="h-4 w-4" />
              </Link>

              <button
                onClick={() => navigate('next')}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/5 text-white transition-colors hover:bg-white/12"
                aria-label="Next featured look"
                type="button"
              >
                <ArrowRight className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative w-full overflow-hidden text-white"
      style={{
        backgroundColor: activeSlide.bg,
        transition: `background-color ${sharedTransition}`,
      }}
    >
      <div
        className="relative w-full overflow-hidden"
        style={{ minHeight: isMobile ? '100svh' : '92vh' }}
      >
        <div
          className="absolute inset-0 pointer-events-none z-[50] opacity-40"
          style={{
            backgroundImage: `url("data:image/svg+xml,${noiseSvg}")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '200px 200px',
          }}
        />

        <div
          className="absolute inset-0 z-[10] origin-top-center"
          style={{
            transform: `scale(${contentScale})`,
            transformOrigin: 'top center',
            width: '100%',
            height: '100%',
            transition: `transform ${sharedTransition}`,
          }}
        >
          <div
            className="absolute inset-x-0 flex items-center justify-center pointer-events-none select-none z-[2]"
            style={{ top: '18%' }}
          >
            <h2 className="text-center font-black uppercase leading-none text-white/10 text-6xl sm:text-8xl lg:text-[10rem]">
              {GHOST_TEXT}
            </h2>
          </div>

          <div className="absolute top-6 left-4 sm:left-8 z-[60] space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/90">
              EthioFashion
            </p>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/45">
              Premium Ethiopian style
            </p>
          </div>

          <div className="absolute top-6 right-4 sm:right-8 z-[60] hidden sm:block">
            <div className="rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 text-[10px] uppercase tracking-[0.26em] text-white/70">
              Addis Ababa / Nationwide delivery
            </div>
          </div>

          <div className="absolute inset-0 z-[10]">
            {roles.map((index, rolePosition) => {
              const slide = SLIDES[index];
              const role =
                rolePosition === 1 ? 'center' : rolePosition === 0 ? 'left' : rolePosition === 2 ? 'right' : 'back';
              const common = {
                position: 'absolute' as const,
                left:
                  role === 'left'
                    ? '28%'
                    : role === 'right'
                      ? '72%'
                      : '50%',
                bottom:
                  role === 'center'
                    ? '8%'
                    : '14%',
                height:
                  role === 'center'
                    ? '66%'
                    : role === 'back'
                      ? '22%'
                      : '28%',
                aspectRatio: '0.8 / 1',
                transform:
                  role === 'center'
                    ? 'translateX(-50%) scale(1.08)'
                    : `translateX(-50%) scale(${role === 'back' ? 0.88 : 0.98})`,
                opacity: role === 'center' ? 1 : role === 'back' ? 0.9 : 0.82,
                zIndex: role === 'center' ? 30 : role === 'back' ? 12 : 18,
                filter: role === 'center' ? 'blur(0px)' : role === 'back' ? 'blur(5px)' : 'blur(2px)',
                willChange: 'transform, filter, opacity, left, bottom, height',
                transition: `transform ${sharedTransition}, filter ${sharedTransition}, opacity ${sharedTransition}, left ${sharedTransition}, bottom ${sharedTransition}, height ${sharedTransition}`,
              };

              return (
                <div key={slide.src} style={common} className="pointer-events-none">
                  <div className="relative h-full w-full overflow-hidden rounded-[28px] border border-white/14 bg-white/5 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
                    <Image
                      src={slide.src}
                      alt={slide.title}
                      fill
                      draggable={false}
                      sizes={role === 'center' ? '(max-width: 640px) 72vw, 38vw' : '(max-width: 640px) 28vw, 18vw'}
                      className="object-cover object-center"
                      priority={index === activeIndex}
                    />

                    {role === 'center' && (
                      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                        <div className="rounded-2xl border border-white/14 bg-black/55 backdrop-blur-md px-4 py-3">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/55">
                            Featured collection
                          </p>
                          <p className="mt-1 text-sm font-semibold text-white">{slide.title}</p>
                          <p className="mt-1 text-xs leading-6 text-white/72">{slide.subtitle}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            className="absolute left-4 right-4 z-[60] sm:left-8 sm:right-auto sm:max-w-lg"
            style={{ top: '54%', transform: 'translateY(-50%)' }}
          >
            <div className="max-w-lg space-y-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/60">
                New season / premium essentials
              </p>
              <h1 className="text-4xl font-black leading-[1.02] sm:text-5xl lg:text-6xl">
                EthioFashion
              </h1>
              <p className="max-w-lg text-sm leading-7 text-white/70 sm:text-base">
                Discover handcrafted clothing, polished footwear, and modern staples with clearer
                sizing, better presentation, and a calmer shopping experience.
              </p>

              <div className="flex flex-wrap gap-3 pt-1">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-[#f1c94b]"
                >
                  Shop Collection
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/products?featured=true"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/85 transition-colors hover:border-white/35 hover:bg-white/10 hover:text-white"
                >
                  View Featured
                </Link>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { icon: Sparkles, label: 'Handpicked drops' },
                  { icon: Truck, label: 'Nationwide delivery' },
                  { icon: ShieldCheck, label: 'Reliable sizing' },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-[11px] font-medium text-white/80"
                  >
                    <Icon className="h-3.5 w-3.5 text-[#D4AF37]" />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute bottom-6 right-4 z-[60] sm:bottom-12 sm:right-8">
            <button
              onClick={() => navigate('prev')}
              className="group mr-2 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/5 text-white transition-all duration-150 hover:scale-105 hover:bg-white/12 disabled:opacity-40 sm:h-14 sm:w-14"
              aria-label="Previous featured look"
              type="button"
            >
              <ArrowLeft className="h-4.5 w-4.5 sm:h-5.5 sm:w-5.5" />
            </button>
            <button
              onClick={() => navigate('next')}
              className="group inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/5 text-white transition-all duration-150 hover:scale-105 hover:bg-white/12 disabled:opacity-40 sm:h-14 sm:w-14"
              aria-label="Next featured look"
              type="button"
            >
              <ArrowRight className="h-4.5 w-4.5 sm:h-5.5 sm:w-5.5" />
            </button>
          </div>

          <div className="absolute bottom-6 right-32 z-[60] hidden sm:block">
            <Link
              href={activeSlide.href}
              className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-white/90 transition-opacity duration-200 hover:text-white"
            >
              Discover it
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
