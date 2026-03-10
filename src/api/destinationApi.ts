import api from "./client";

export type Destination = {
  id: number;
  name: string;
  country?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  createdAt?: string;
};

export type DestinationPlace = {
  name: string;
  category?: string | null;
  formatted?: string | null;
  website?: string | null;
  imageUrl?: string | null;
  lat?: number | null;
  lon?: number | null;
};

export type DestinationCountry = {
  code: string;
  name: string;
};

export type DestinationHotel = {
  hotelId?: string | null;
  name: string;
  address?: string | null;
  city?: string | null;
  countryCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  distanceValue?: number | null;
  distanceUnit?: string | null;
  rating?: number | null;
};

export type DestinationHotelOffer = {
  offerId?: string | null;
  hotelId?: string | null;
  hotelName?: string | null;
  roomDescription?: string | null;
  boardType?: string | null;
  checkInDate?: string | null;
  checkOutDate?: string | null;
  adults?: number | null;
  currency?: string | null;
  totalPrice?: string | null;
  cancellationDescription?: string | null;
  paymentType?: string | null;
};

export type DestinationHotelBookingRequest = {
  offerId: string;
  guestTitle: string;
  guestFirstName: string;
  guestLastName: string;
  guestPhone: string;
  guestEmail: string;
  cardVendorCode: string;
  cardNumber: string;
  cardExpiryDate: string;
  cardHolderName?: string;
};

export type DestinationHotelBookingResponse = {
  bookingId?: string | null;
  providerConfirmationId?: string | null;
  hotelName?: string | null;
  status?: string | null;
  checkInDate?: string | null;
  checkOutDate?: string | null;
  currency?: string | null;
  totalPrice?: string | null;
  guestName?: string | null;
};

export type DestinationCity = {
  name: string;
  country: string;
  countryCode?: string | null;
  formatted?: string | null;
  lat?: number | null;
  lon?: number | null;
};

type PageResponse<T> = {
  content?: T[];
};

export async function getDestinations(): Promise<Destination[]> {
  const res = await api.get<Destination[] | PageResponse<Destination>>("/destinations");

  // se o backend retornar direto um array:
  if (Array.isArray(res.data)) return res.data;

  // se retornar paginado: { content: [...] }
  if (Array.isArray(res.data.content)) return res.data.content;

  return [];
}

export async function getDestinationPlaces(destinationId: number): Promise<DestinationPlace[]> {
  const res = await api.get<DestinationPlace[]>(`/destinations/${destinationId}/places`);
  return Array.isArray(res.data) ? res.data : [];
}

export async function getDestinationHotels(destinationId: number): Promise<DestinationHotel[]> {
  const res = await api.get<DestinationHotel[]>(`/destinations/${destinationId}/hotels`);
  return Array.isArray(res.data) ? res.data : [];
}

export async function getHotelOffers(params: {
  hotelId: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
}): Promise<DestinationHotelOffer[]> {
  const res = await api.get<DestinationHotelOffer[]>(`/destinations/hotels/${params.hotelId}/offers`, {
    params: {
      checkInDate: params.checkInDate,
      checkOutDate: params.checkOutDate,
      adults: params.adults,
    },
  });
  return Array.isArray(res.data) ? res.data : [];
}

export async function bookHotelOffer(
  payload: DestinationHotelBookingRequest,
): Promise<DestinationHotelBookingResponse> {
  const res = await api.post<DestinationHotelBookingResponse>("/destinations/hotels/bookings", payload);
  return res.data;
}

export async function getDestinationCountries(query?: string): Promise<DestinationCountry[]> {
  const res = await api.get<DestinationCountry[]>("/destinations/countries", {
    params: query?.trim() ? { q: query.trim() } : undefined,
  });
  return Array.isArray(res.data) ? res.data : [];
}

export async function getDestinationCities(
  countryCode: string,
  query: string,
): Promise<DestinationCity[]> {
  const res = await api.get<DestinationCity[]>("/destinations/cities", {
    params: { countryCode, q: query.trim() },
  });
  return Array.isArray(res.data) ? res.data : [];
}

export async function resolveDestination(payload: {
  name: string;
  country: string;
}): Promise<Destination> {
  const res = await api.post<Destination>("/destinations/resolve", payload);
  return res.data;
}
