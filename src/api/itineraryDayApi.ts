import api from "./client";

export type ItineraryDay = {
  id: number;
  tripId: number;
  date: string;
};

export type ItineraryDayCreateRequest = {
  tripId: number;
  date: string;
};

export async function getItineraryDaysByTrip(tripId: number): Promise<ItineraryDay[]> {
  const res = await api.get<ItineraryDay[]>(`/itinerary-days/trip/${tripId}`);
  return res.data;
}

export async function createItineraryDay(payload: ItineraryDayCreateRequest): Promise<ItineraryDay> {
  const res = await api.post<ItineraryDay>("/itinerary-days", payload);
  return res.data;
}
