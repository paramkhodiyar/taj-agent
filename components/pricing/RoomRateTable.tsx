'use client';

import React, { useState } from 'react';
import { PriceDisplay } from './PriceDisplay';

interface RoomRateItem {
  id: string;
  room: string;
  sourceRoomName: string;
  ratePlan: string;
  mealPlan: string;
  cancellationPolicy: string;
  isFlexible: boolean;
  pricePerNight: number;
  totalPrice: number | null;
  availabilityStatus: string;
  verificationState: string;
  fetchedAt: string;
}

interface RoomRateTableProps {
  items: RoomRateItem[];
  currency?: string;
  nights?: number;
}

export const RoomRateTable: React.FC<RoomRateTableProps> = ({
  items,
  currency = 'INR',
  nights = 1,
}) => {
  // Group rates by room
  const groupedRooms = items.reduce((acc, item) => {
    if (!acc[item.room]) {
      acc[item.room] = [];
    }
    acc[item.room].push(item);
    return acc;
  }, {} as Record<string, RoomRateItem[]>);

  // By default, expand the first room, or resume from last expanded session state
  const [expandedRooms, setExpandedRooms] = useState<Record<string, boolean>>({
    [Object.keys(groupedRooms)[0] || '']: true,
  });

  React.useEffect(() => {
    try {
      const saved = sessionStorage.getItem('taj_expanded_rooms');
      if (saved) {
        setExpandedRooms(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

  const toggleRoom = (roomName: string) => {
    setExpandedRooms((prev) => {
      const next = {
        ...prev,
        [roomName]: !prev[roomName],
      };
      try {
        sessionStorage.setItem('taj_expanded_rooms', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  if (items.length === 0) {
    return (
      <div className="border border-taj-gray-border bg-white p-8 text-center text-xs text-taj-gray-warm">
        No room/rate inventory verified for these dates yet.
      </div>
    );
  }

  return (
    <div className="border border-taj-gray-border bg-white overflow-hidden">
      <div className="p-5 border-b border-taj-gray-border bg-taj-cream/50 flex items-center justify-between">
        <div>
          <h3 className="text-base font-serif text-taj-burgundy font-medium">
            Room & Rate Matrix
          </h3>
          <p className="text-xs text-taj-charcoal-muted mt-0.5">
            Compare like-for-like meal inclusions, cancellation terms, and verified nightly rates.
          </p>
        </div>
        <span className="text-xs text-taj-gray-warm">
          {items.length} verified rate plans
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-taj-gray-border bg-taj-cream text-taj-charcoal font-semibold uppercase tracking-wider text-[11px]">
              <th scope="col" className="py-3 px-4">Room & View</th>
              <th scope="col" className="py-3 px-4">Rate Plan</th>
              <th scope="col" className="py-3 px-4">Meal Plan</th>
              <th scope="col" className="py-3 px-4">Cancellation Terms</th>
              <th scope="col" className="py-3 px-4 text-right">Nightly</th>
              <th scope="col" className="py-3 px-4 text-right">Total ({nights}N)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-taj-gray-border">
            {Object.entries(groupedRooms).map(([roomName, rates]) => {
              const isExpanded = !!expandedRooms[roomName];
              const leadRate = rates[0];

              return (
                <React.Fragment key={roomName}>
                  {/* Room Summary Header Row */}
                  <tr
                    onClick={() => toggleRoom(roomName)}
                    className="bg-white hover:bg-taj-cream/30 cursor-pointer transition-colors"
                  >
                    <td colSpan={6} className="py-3 px-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-4 h-4 flex items-center justify-center border border-taj-gray-border text-taj-burgundy text-[10px] font-bold">
                            {isExpanded ? '−' : '+'}
                          </span>
                          <div>
                            <span className="font-serif font-medium text-sm text-taj-charcoal">
                              {roomName}
                            </span>
                            <span className="text-[11px] text-taj-gray-warm ml-2">
                              ({rates.length} rate option{rates.length > 1 ? 's' : ''})
                            </span>
                          </div>
                        </div>

                        {!isExpanded && (
                          <div className="flex items-center gap-4 text-xs">
                            <span className="text-taj-gray-warm">From</span>
                            <PriceDisplay amount={leadRate.pricePerNight} size="sm" />
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Rates Rows */}
                  {isExpanded &&
                    rates.map((rate, idx) => (
                      <tr
                        key={rate.id || idx}
                        className="bg-taj-cream/10 hover:bg-taj-cream/40 transition-colors border-t border-taj-gray-border/50"
                      >
                        <td className="py-3.5 px-4 pl-11 text-taj-charcoal-light">
                          <span className="text-[11px] block text-taj-gray-warm">
                            {rate.sourceRoomName}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-taj-charcoal">
                          {rate.ratePlan}
                        </td>
                        <td className="py-3.5 px-4 text-taj-charcoal-light">
                          {rate.mealPlan}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] border ${
                              rate.isFlexible
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-stone-50 text-stone-700 border-stone-200'
                            }`}
                          >
                            {rate.cancellationPolicy}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <PriceDisplay amount={rate.pricePerNight} size="sm" />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {rate.totalPrice ? (
                            <span className="price-tabular font-medium text-taj-charcoal">
                              ₹{rate.totalPrice.toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className="text-taj-gray-warm italic">Taxes at check-in</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
