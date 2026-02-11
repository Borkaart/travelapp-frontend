import api from "./client";

export type TripListItem = {
  id: number;
  title: string;
  destinationId: number;
  destinationName: string;
  status: string;
  startDate: string;
  endDate: string;
  createdAt: string;
};

type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

export async function getTrips(): Promise<TripListItem[]> {
  const res = await api.get<PageResponse<TripListItem>>("/trips");
  return res.data.content;
}

export async function getTripById(id: number): Promise<TripListItem> {
  const res = await api.get<TripListItem>(`/trips/${id}`);
  return res.data;
}

export type CreateTripRequest = {
  title: string;
  destinationId: number;
  startDate: string;
  endDate: string;
};

export async function createTrip(payload: CreateTripRequest) {
  const res = await api.post("/trips", payload);
  return res.data;
}
import type { TripSummary } from "../models/TripSummary";

// ...

export async function getTripSummary(tripId: number): Promise<TripSummary> {
  const res = await api.get<TripSummary>(`/trips/${tripId}/summary`);
  return res.data;
}
