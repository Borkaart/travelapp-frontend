import api from "./client";

export type ActivityType =
  | "SIGHTSEEING"
  | "FOOD"
  | "TRANSPORT"
  | "TOUR"
  | "HOTEL"
  | "SHOPPING"
  | "OTHER";

export type Activity = {
  id: number;
  itineraryDayId: number;
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

export async function updateActivity(id: number, payload: ActivityUpdateRequest): Promise<Activity> {
  const res = await api.put<Activity>(`/activities/${id}`, payload);
  return res.data;
}

export async function deleteActivity(id: number): Promise<void> {
  await api.delete(`/activities/${id}`);
}
