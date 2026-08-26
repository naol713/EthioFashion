'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils/helpers';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface ProductGalleryProps {
  images: Array<{ id?: string; url: string; alt_text?: string | null }>;
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const fallback = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80';
  const galleryImages = images.length > 0 ? images : [{ url: fallback, alt_text: productName }];

  const prev = () => setActiveIdx(i => (i === 0 ? galleryImages.length - 1 : i - 1));
  const next = () => setActiveIdx(i => (i === galleryImages.length - 1 ? 0 : i + 1));

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div
        className={cn(
          'relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 group cursor-zoom-in',
          zoomed && 'cursor-zoom-out',
        )}
        onClick={() => setZoomed(z => !z)}
      >
        <Image
          src={galleryImages[activeIdx]?.url || fallback}
          alt={galleryImages[activeIdx]?.alt_text || productName}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className={cn(
            'object-cover object-center transition-transform duration-500',
            zoomed ? 'scale-150' : 'scale-100',
          )}
        />

        {/* Zoom icon */}
        <div className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="h-4 w-4 text-gray-600" />
        </div>

        {/* Arrow navigation (only when multiple images) */}
        {galleryImages.length > 1 && (
          <>
            <button
              onClick={e => { e.stopPropagation(); prev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm shadow flex items-center justify-center hover:bg-white transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={e => { e.stopPropagation(); next(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm shadow flex items-center justify-center hover:bg-white transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4 text-gray-700" />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {galleryImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {galleryImages.map((_, i) => (
              <button
                key={i}
                onClick={e => { e.stopPropagation(); setActiveIdx(i); }}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-200',
                  i === activeIdx ? 'w-5 bg-[#0a0a0a]' : 'w-1.5 bg-white/60',
                )}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {galleryImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {galleryImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={cn(
                'relative h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200',
                i === activeIdx
                  ? 'border-[#0a0a0a] shadow-md'
                  : 'border-transparent hover:border-gray-300',
              )}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={img.url}
                alt={img.alt_text || `${productName} image ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
