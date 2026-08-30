'use client';

import { useState } from 'react';

const clothingSizes = ['S', 'M', 'L'];

interface ProductSizeFieldsProps {
  initialSizeType?: 'CLOTHING' | 'SHOE';
  initialSizes?: string[];
}

export function ProductSizeFields({ initialSizeType = 'CLOTHING', initialSizes }: ProductSizeFieldsProps) {
  const [sizeType, setSizeType] = useState<'CLOTHING' | 'SHOE'>(initialSizeType);
  const [clothingSizesSelected, setClothingSizesSelected] = useState<string[]>(
    initialSizeType === 'CLOTHING' && initialSizes
      ? initialSizes
      : clothingSizes
  );
  const [shoeSizesValue, setShoeSizesValue] = useState(
    initialSizeType === 'SHOE' && initialSizes
      ? initialSizes.join(', ')
      : ''
  );

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-gray-600">
          <span>Size type</span>
          <select
            name="sizeType"
            value={sizeType}
            onChange={(e) => setSizeType(e.target.value as 'CLOTHING' | 'SHOE')}
            className="h-10 w-full rounded-md border px-3"
          >
            <option value="CLOTHING">Clothing</option>
            <option value="SHOE">Shoe</option>
          </select>
        </label>

        {sizeType === 'SHOE' ? (
          <label className="space-y-2 text-sm font-medium text-gray-600">
            <span>Shoe sizes</span>
            <input
              name="shoeSizes"
              type="text"
              inputMode="numeric"
              placeholder="39, 40, 41 or 39-43"
              value={shoeSizesValue}
              onChange={(e) => setShoeSizesValue(e.target.value)}
              required
              className="h-10 w-full rounded-md border px-3"
            />
          </label>
        ) : (
          <div className="space-y-2 text-sm font-medium text-gray-600">
            <span>Clothing sizes</span>
            <div className="flex flex-wrap gap-3">
              {clothingSizes.map((size) => (
                <label
                  key={size}
                  className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700"
                >
                  <input
                    type="checkbox"
                    name="sizes"
                    value={size}
                    checked={clothingSizesSelected.includes(size)}
                    onChange={(e) => {
                      setClothingSizesSelected((current) =>
                        e.target.checked
                          ? [...current, size]
                          : current.filter((item) => item !== size),
                      );
                    }}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  {size}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500">
      
      </p>
    </div>
  );
}
