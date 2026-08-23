// ─────────────────────────────────────────────
//  Tripzy — API Client + TypeScript Types
// ─────────────────────────────────────────────

function getApiBase(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname || 'localhost';
    return `http://${hostname}:5000/api`;
  }
  return envUrl || 'http://localhost:5000/api';
}

const API_KEY = process.env.NEXT_PUBLIC_TRIPZY_API_KEY;
const PLAN_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_TRIPZY_PLAN_TIMEOUT_MS || 180000);
const POLL_INTERVAL_MS = Number(process.env.NEXT_PUBLIC_TRIPZY_POLL_INTERVAL_MS || 2000);

function apiHeaders(includeJson = false): HeadersInit {
  const headers: Record<string, string> = {};
  if (includeJson) {
    headers['Content-Type'] = 'application/json';
  }
  if (API_KEY) {
    headers['X-Tripzy-API-Key'] = API_KEY;
  }
  return headers;
}

async function apiError(response: Response): Promise<Error> {
  const body = await response.json().catch(() => ({ error: 'Request failed' }));
  return new Error(body.error || `HTTP ${response.status}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Types ─────────────────────────────────────

export interface TravelDetails {
  destination: string;
  duration: number;
  budget: number;
  travel_type: string;
  travelers: number;
  interests: string[];
  overview: string;
}

export interface Place {
  name: string;
  description: string;
  category: string;
  location: string;
  how_to_reach: string;
  best_time: string;
  duration: string;
  entry_fee: string;
  rating: number;
  tips: string;
  image_url: string;
  coordinates?: string;
  maps_link?: string;
  image_search?: string;
  source_url?: string;
}

export interface Restaurant {
  name: string;
  cuisine: string;
  description: string;
  budget_level: string;
  avg_cost_per_person: string;
  location: string;
  rating: number;
  specialties: string[];
  atmosphere: string;
  best_time: string;
  reservation_needed: boolean;
  image_url: string;
  maps_link?: string;
  source_url?: string;
}

export interface Hotel {
  name: string;
  category: string;
  description: string;
  location: string;
  price_per_night: string;
  total_estimated: string;
  rating: number;
  amenities: string[];
  room_type: string;
  proximity: string;
  booking_tip: string;
  image_url: string;
  maps_link?: string;
  source_url?: string;
}

export interface TimeSlot {
  time: string;
  activity?: string;
  description?: string;
  place?: string;
  duration?: string;
  restaurant?: string;
  cuisine?: string;
  estimated_cost?: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  theme: string;
  destination: string;
  travel_type: string;
  morning: TimeSlot;
  lunch: TimeSlot;
  afternoon: TimeSlot;
  dinner: TimeSlot;
  evening: TimeSlot;
  transportation: string;
  tips: string[];
  estimated_daily_cost: string;
}

export interface BudgetBreakdown {
  accommodation: number;
  food: number;
  activities: number;
  transportation: number;
  miscellaneous: number;
  total_estimated: number;
  user_budget: number;
  remaining: number;
  within_budget: boolean;
  is_estimate?: boolean;   // true while using % estimates before actual data arrives
}

export interface SeasonItem {
  season_name: string;
  weather_summary: string;
  clothing_items: string[];
  packing_essentials: string[];
  dress_code_tips: string;
}

export interface SeasonalClothing {
  climate_overview: string;
  seasons: SeasonItem[];
  general_dress_tips?: string[];
}

export interface ScamAlert {
  title: string;
  risk_level: 'High' | 'Medium' | 'Low' | string;
  description: string;
  prevention: string;
  warning_signs?: string;
}

export interface MustDoActivity {
  title: string;
  category: string;
  description: string;
  insider_tip: string;
  best_time?: string;
  estimated_cost?: string;
}

export interface LocalHack {
  topic: string;
  category?: string;
  tip: string;
}

export interface EmergencyContacts {
  police?: string;
  ambulance?: string;
  tourist_helpline?: string;
  emergency_notes?: string;
}

export interface SuggestionsData {
  seasonal_clothing?: SeasonalClothing;
  scams_and_safety?: ScamAlert[];
  must_do_activities?: MustDoActivity[];
  local_hacks_and_etiquette?: LocalHack[];
  emergency_contacts?: EmergencyContacts;
}

export interface TripPlan {
  travel_details: TravelDetails;
  places: Place[];
  restaurants: Restaurant[];
  hotels: Hotel[];
  itinerary: ItineraryDay[];
  budget_breakdown: BudgetBreakdown;
  suggestions?: SuggestionsData;
  error?: string | null;
}

export interface TripJob {
  trip_id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  status_url: string;
  result_url: string;
}

export interface TripJobStatus {
  trip_id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  started_at?: string | null;
  completed_at?: string | null;
  error?: string | null;
}

// ── API Functions ─────────────────────────────

export async function createTrip(userInput: string): Promise<TripJob> {
  const url = `${getApiBase()}/trips`;
  console.log('[Tripzy API] createTrip → POST', url, '| input:', userInput.substring(0, 60));
  const response = await fetch(url, {
    method: 'POST',
    headers: apiHeaders(true),
    body: JSON.stringify({ user_input: userInput }),
  });

  if (!response.ok) {
    console.error('[Tripzy API] createTrip failed:', response.status, response.statusText);
    throw await apiError(response);
  }

  const data = await response.json();
  console.log('[Tripzy API] createTrip success:', data);
  return data;
}

export async function getTripStatus(tripId: string): Promise<TripJobStatus> {
  const response = await fetch(`${getApiBase()}/trips/${tripId}/status`, {
    headers: apiHeaders(),
  });

  if (!response.ok) {
    throw await apiError(response);
  }

  return response.json();
}

export async function getTripResult(tripId: string): Promise<TripPlan> {
  const response = await fetch(`${getApiBase()}/trips/${tripId}`, {
    headers: apiHeaders(),
  });

  if (response.status === 202) {
    throw new Error('Trip is still processing');
  }

  if (!response.ok) {
    throw await apiError(response);
  }

  return response.json();
}

export async function getTripPartial(tripId: string): Promise<{
  status: string;
  partial: Partial<TripPlan>;
}> {
  const response = await fetch(`${getApiBase()}/trips/${tripId}/partial`, {
    headers: apiHeaders(),
  });
  if (!response.ok) throw await apiError(response);
  return response.json();
}

export async function planTrip(userInput: string): Promise<TripPlan> {
  const job = await createTrip(userInput);
  const deadline = Date.now() + PLAN_TIMEOUT_MS;

  if (job.status === 'completed') {
    return getTripResult(job.trip_id);
  }

  while (Date.now() < deadline) {
    const status = await getTripStatus(job.trip_id);

    if (status.status === 'completed') {
      return getTripResult(job.trip_id);
    }

    if (status.status === 'failed') {
      throw new Error(status.error || 'Trip planning failed');
    }

    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error('Trip planning timed out. Please try again.');
}

/** Progressive version – fires onPartial whenever a new section arrives */
export async function planTripProgressive(
  userInput: string,
  onPartial: (partial: Partial<TripPlan>) => void,
): Promise<TripPlan> {
  const job = await createTrip(userInput);
  const deadline = Date.now() + PLAN_TIMEOUT_MS;

  if (job.status === 'completed') {
    return getTripResult(job.trip_id);
  }

  let lastPartialJson = '';

  while (Date.now() < deadline) {
    let partial: { status: string; partial: Partial<TripPlan> } | null = null;

    try {
      partial = await getTripPartial(job.trip_id);
    } catch (e: unknown) {
      // Only swallow network/404 errors — treat everything else as fatal
      const msg = e instanceof Error ? e.message : '';
      if (msg !== 'Trip not found') {
        console.warn('Partial poll error:', msg);
      }
      await sleep(POLL_INTERVAL_MS);
      continue;
    }

    if (partial.status === 'completed') {
      return getTripResult(job.trip_id);
    }

    if (partial.status === 'failed') {
      throw new Error('Trip planning failed. Please try again.');
    }

    // Fire callback only when something new arrived
    const newJson = JSON.stringify(partial.partial);
    if (newJson !== lastPartialJson) {
      lastPartialJson = newJson;
      onPartial(partial.partial);
    }

    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error('Trip planning timed out. Please try again.');
}

export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${getApiBase()}/health`, { method: 'GET' });
    return response.ok;
  } catch {
    return false;
  }
}

// ── Helpers ───────────────────────────────────

export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return '—';
  // Strip currency symbols/commas if string comes from the AI (e.g. "$4,500")
  const num = typeof amount === 'string'
    ? parseFloat(amount.replace(/[^0-9.-]/g, ''))
    : amount;
  if (!isFinite(num) || isNaN(num)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function getRatingStars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - half);
}

export function getBudgetPercent(amount: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(Math.round((amount / total) * 100), 100);
}

export function getDestinationImageUrl(destination: string): string {
  // Use Unsplash source for destination hero images
  const query = encodeURIComponent(destination.split(',')[0].trim());
  return `https://source.unsplash.com/1600x900/?${query},travel,city`;
}

// ── Saved Trips ─────────────────────────────────────────────────────────────

export interface SaveTripResult {
  saved: boolean;
  id: string;
  destination: string;
}

export async function saveTrip(
  tripPlan: Partial<TripPlan>,
  token: string,
): Promise<SaveTripResult> {
  const res = await fetch(`${getApiBase()}/saved-trips`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ trip_plan: tripPlan }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Save failed' }));
    throw new Error((err as { error?: string }).error ?? 'Save failed');
  }
  return res.json() as Promise<SaveTripResult>;
}

export interface SavedTripSummary {
  id: string;
  destination: string;
  travel_details: Partial<TravelDetails>;
  saved_at: string;
}

export async function getSavedTrips(token: string): Promise<SavedTripSummary[]> {
  const res = await fetch(`${getApiBase()}/saved-trips`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch saved trips');
  const data = (await res.json()) as { trips: SavedTripSummary[] };
  return data.trips;
}
