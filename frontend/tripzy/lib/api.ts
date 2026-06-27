// ─────────────────────────────────────────────
//  Tripzy — API Client + TypeScript Types
// ─────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
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
}

export interface TripPlan {
  travel_details: TravelDetails;
  places: Place[];
  restaurants: Restaurant[];
  hotels: Hotel[];
  itinerary: ItineraryDay[];
  budget_breakdown: BudgetBreakdown;
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
  const response = await fetch(`${API_BASE}/trips`, {
    method: 'POST',
    headers: apiHeaders(true),
    body: JSON.stringify({ user_input: userInput }),
  });

  if (!response.ok) {
    throw await apiError(response);
  }

  return response.json();
}

export async function getTripStatus(tripId: string): Promise<TripJobStatus> {
  const response = await fetch(`${API_BASE}/trips/${tripId}/status`, {
    headers: apiHeaders(),
  });

  if (!response.ok) {
    throw await apiError(response);
  }

  return response.json();
}

export async function getTripResult(tripId: string): Promise<TripPlan> {
  const response = await fetch(`${API_BASE}/trips/${tripId}`, {
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

export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/health`, { method: 'GET' });
    return response.ok;
  } catch {
    return false;
  }
}

// ── Helpers ───────────────────────────────────

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
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
