import api from "./client";

export type ActivityType = "SIGHTSEEING" | "FOOD" | "TRANSPORT" | "TOUR" | "HOTEL" | "SHOPPING" | "OTHER";

export type ActivityCreateRequest = {
  title: string;
  description?: string;
  itineraryDayId: number;
  startTime?: string; // "HH:mm"
  endTime?: string;   // "HH:mm"
};

export async function getActivitiesByItineraryDay(itineraryDayId: number): Promise<Activity[]> {
  const res = await api.get<Activity[]>(`/activities/itinerary-day/${itineraryDayId}`);
  return res.data;
}

export async function createActivity(payload: ActivityCreateRequest): Promise<Activity> {
  const res = await api.post<Activity>("/activities", payload);
  return res.data;
}
