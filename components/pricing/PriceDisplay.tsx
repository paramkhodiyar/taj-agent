import React from 'react';

interface PriceDisplayProps {
  amount: number | null | undefined;
  currency?: string;
  period?: string; // e.g. "/ night" or "total"
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTaxesNotice?: boolean;
  className?: string;
}

/**
 * Price Display Component conforming to 01-PRODUCT-AND-UI.md §6.1 & §8.3:
 * - Indian number formatting (lakhs/crores e.g. ₹1,25,000)
 * - Tabular figures (monospace digit widths) for scannability
 * - No hallucinated defaults: null renders "Unavailable"
 */
export function formatIndianCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Unavailable';
  }
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  amount,
  currency = 'INR',
  period = '/ night',
  size = 'md',
  showTaxesNotice = false,
  className = '',
}) => {
  if (amount === null || amount === undefined || isNaN(amount) || amount <= 0) {
    return (
      <span className="text-taj-gray-warm text-sm italic">
        Price not verified
      </span>
    );
  }

  const formatted = formatIndianCurrency(amount);
  const symbol = currency === 'INR' ? '₹' : currency + ' ';

  const sizeClasses = {
    sm: 'text-base font-semibold',
    md: 'text-xl font-semibold',
    lg: 'text-2xl font-bold tracking-tight',
    xl: 'text-3xl font-serif font-bold tracking-tight text-taj-burgundy',
  };

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <div className="flex items-baseline gap-1">
        <span className={`price-tabular text-taj-charcoal ${sizeClasses[size]}`}>
          {symbol}{formatted}
        </span>
        {period && (
          <span className="text-xs text-taj-gray-warm font-normal">
            {period}
          </span>
        )}
      </div>
      {showTaxesNotice && (
        <span className="text-[10px] text-taj-gray-warm uppercase tracking-wider">
          + Applicable taxes
        </span>
      )}
    </div>
  );
};
