import api from "./client";

export type ActivityType =
  | "SIGHTSEEING"
  | "FOOD"
  | "TRANSPORT"
  | "TOUR"
  | "HOTEL"
  | "SHOPPING"
  | "FLIGHT"
  | "HIKING"
  | "BEACH"
  | "NIGHTLIFE"
  | "CULTURE"
  | "SPORTS"
  | "RELAXATION"
  | "OTHER";

export type Activity = {
  id: number;
  itineraryDayId: number;
  sortOrder?: number | null;
  type: ActivityType;
  title: string;
  place?: string | null;
  notes?: string | null;
  time?: string | null; // pode vir "HH:mm:ss"
  cost?: number | null;
  createdAt?: string;
};

export type ActivityCreateRequest = {
  itineraryDayId: number;
  type: ActivityType;
  title: string;
  place?: string;
  notes?: string;
  time?: string; // "HH:mm"
  cost?: number;
};

export type ActivityUpdateRequest = {
  type?: ActivityType;
  title?: string;
  place?: string;
  notes?: string;
  time?: string; // "HH:mm"
  cost?: number;
};

// baseURL já contém /api, então NÃO use /api aqui
export async function getActivitiesByItineraryDay(itineraryDayId: number): Promise<Activity[]> {
  const res = await api.get<Activity[]>(`/activities/itinerary-day/${itineraryDayId}`);
  return res.data;
}

export async function createActivity(payload: ActivityCreateRequest): Promise<Activity> {
  const res = await api.post<Activity>("/activities", payload);
  return res.data;
}

export async function reorderActivities(payload: {
  itineraryDayId: number;
  activityIds: number[];
}): Promise<Activity[]> {
  const res = await api.post<Activity[]>("/activities/reorder", payload);
  return res.data;
}

export async function updateActivity(id: number, payload: ActivityUpdateRequest): Promise<Activity> {
  const res = await api.put<Activity>(`/activities/${id}`, payload);
  return res.data;
}

export async function deleteActivity(id: number): Promise<void> {
  await api.delete(`/activities/${id}`);
}

export type AmadeusActivityData = {
  id: string;
  name: string;
  description?: string;
  shortDescription?: string;
  price?: {
    amount: string;
    currencyCode: string;
  };
  pictures?: string[];
  bookingLink?: string;
  rating?: number;
};

export async function searchAmadeusActivities(
  lat: number,
  lon: number,
  radius?: number,
): Promise<AmadeusActivityData[]> {
  const res = await api.get<AmadeusActivityData[]>("/destinations/search-activities", {
    params: { lat, lon, radius },
  });
  return res.data;
}

export async function getAmadeusActivitiesByDestination(destinationId: number): Promise<AmadeusActivityData[]> {
  const res = await api.get<AmadeusActivityData[]>(`/destinations/${destinationId}/activities`);
  return res.data;
}
