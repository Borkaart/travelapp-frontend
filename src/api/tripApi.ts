import api from "./client";
import type { TripSummary } from "../models/TripSummary";

export type TripListItem = {
  id: number;
  title: string;
  destinationId: number;
  destinationName: string;
  destinationImageUrl?: string | null;
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
  console.log("[tripApi] getTrips request");
  try {
    const res = await api.get<PageResponse<TripListItem>>("/trips");
    console.log(`[tripApi] getTrips response:`, res.data);
    return res.data.content;
  } catch (err) {
    console.error(`[tripApi] getTrips error:`, err);
    throw err;
  }
}

export async function getTripById(id: number): Promise<TripListItem> {
  console.log(`[tripApi] getTripById id: ${id}`);
  try {
    const res = await api.get<TripListItem>(`/trips/${id}`);
    console.log(`[tripApi] getTripById response:`, res.data);
    return res.data;
  } catch (err) {
    console.error(`[tripApi] getTripById error:`, err);
    throw err;
  }
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

export async function getTripSummary(tripId: number): Promise<TripSummary> {
  const res = await api.get<TripSummary>(`/trips/${tripId}/summary`);
  return res.data;
}

export type TripParserResponse = {
  data: {
    trip: {
      title?: string;
      startDate?: string;
      endDate?: string;
      travelProducts: Array<{
        startStatus?: string;
        flightData?: {
          departureAt?: string;
          arrivalAt?: string;
          iataCode?: string;
          flightNumber?: string;
          departureLocation?: { name?: string; address?: string; cityName?: string };
          arrivalLocation?: { name?: string; address?: string; cityName?: string };
        };
        hotelData?: {
          checkInAt?: string;
          checkOutAt?: string;
          hotelName?: string;
          hotelLocation?: { name?: string; address?: string; cityName?: string };
          confirmationNumber?: string;
        };
        trainData?: {
          departureAt?: string;
          arrivalAt?: string;
          departureLocation?: { name?: string; address?: string; cityName?: string };
          arrivalLocation?: { name?: string; address?: string; cityName?: string };
        };
      }>;
    };
  };
};

export async function parseTripConfirmation(tripId: number, base64Content: string): Promise<TripParserResponse> {
  const res = await api.post<TripParserResponse>(`/trips/${tripId}/parse-confirmation`, { base64Content });
  return res.data;
}
