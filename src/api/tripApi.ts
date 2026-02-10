import api from "./client";

/**
 * Estrutura que o backend retorna dentro de Page<TripResponse>
 */
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

/**
 * Wrapper padrão do Spring Page<T>
 */
type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

/**
 * GET /api/trips
 * Retorna apenas o array de trips (content)
 */
export async function getTrips(): Promise<TripListItem[]> {
  const res = await api.get<PageResponse<TripListItem>>("/trips");
  return res.data.content;
}

/**
 * Opcional — buscar uma trip específica
 */
export async function getTripById(id: number): Promise<TripListItem> {
  const res = await api.get<TripListItem>(`/trips/${id}`);
  return res.data;
}

/**
 * Opcional — criar trip
 */
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
