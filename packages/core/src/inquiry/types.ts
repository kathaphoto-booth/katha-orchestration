// Canonical InquiryPayload — union of all fields from pb-v3 and studio.
export type InquiryPayload = {
  client_name: string;
  client_email: string;
  client_phone?: string;
  event_date: string;
  // pb-v3 attribution
  tier_selected?: string;
  source?: string;
  // studio event context
  venue?: string;
  event_type?: string;
  guest_count?: string;
  indoors_outdoors?: string;
  referral?: string;
  selected_package?: string;
  addons?: string[];
};

export type DispatchResult = {
  target: string;
  ok: boolean;
  detail: string;
};

/**
 * Truthful calendar status for the auto-reply. 'open' only when the
 * available_dates allow-list confirms it at send time; anything else
 * (no row, closed, query failure, no Supabase) stays 'unknown' and the
 * email makes no availability claim.
 */
export type DateStatus = 'open' | 'unknown';

export type InquiryHandlerOptions = {
  /** Per-app gallery/portal link builder. Receives leadHash and baseUrl, returns full URL. */
  buildGalleryLink: (leadHash: string, baseUrl: string) => string;
};
