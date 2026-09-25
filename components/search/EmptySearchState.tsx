import React from 'react';

interface EmptySearchStateProps {
  searchId: string;
  checkIn: string;
  checkOut: string;
  totalProperties: number;
  onTriggerFetch: () => void;
  isFetching: boolean;
}

export const EmptySearchState: React.FC<EmptySearchStateProps> = ({
  checkIn,
  checkOut,
  totalProperties,
  onTriggerFetch,
  isFetching,
}) => {
  return (
    <div className="border border-taj-gray-border bg-white p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-6">
      <div className="w-12 h-12 border border-taj-gold text-taj-gold flex items-center justify-center mx-auto text-xl font-serif">
        T
      </div>

      <div className="space-y-2">
        <h3 className="text-xl sm:text-2xl font-serif text-taj-burgundy">
          No verified rates found for these dates yet
        </h3>
        <p className="text-xs text-taj-charcoal-muted max-w-md mx-auto leading-relaxed">
          Our records currently hold no prior rate checks for {checkIn} to {checkOut}.
          We never fabricate or estimate hotel pricing.
        </p>
      </div>

      <div className="bg-taj-cream border border-taj-gray-border p-4 text-xs text-taj-charcoal-muted max-w-md mx-auto text-left space-y-1">
        <p className="font-semibold text-taj-charcoal">How rate verification works:</p>
        <p>1. We check official Taj reservation systems directly.</p>
        <p>2. Available rooms, tariffs, and meal plans are verified.</p>
        <p>3. Authentic rates are safely recorded for your review.</p>
      </div>

      <div className="pt-2">
        <button
          onClick={onTriggerFetch}
          disabled={isFetching}
          className="px-8 py-3.5 bg-taj-burgundy hover:bg-taj-burgundy-deep text-white font-medium text-xs uppercase tracking-widest transition-colors disabled:opacity-50"
        >
          {isFetching ? `Checking ${totalProperties} Taj properties across India…` : `Check Official Rates Across ${totalProperties} Properties`}
        </button>
      </div>
    </div>
  );
};
