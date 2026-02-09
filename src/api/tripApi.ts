import api from "./client";
import type { Trip } from "../models/Trip";
import type { TripSummary } from "../models/TripSummary";

export async function getMyTrips(page = 0, size = 20): Promise<Trip[]> {
  const res = await api.get("/trips", { params: { page, size } });
  return res.data.content ?? [];
}

export async function getTripSummary(tripId: number): Promise<TripSummary> {
  const res = await api.get(`/trips/${tripId}/summary`);
  return res.data;
}

