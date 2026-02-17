import api from "./client";

export type Destination = {
  id: number;
  cityName: string;
};

export async function getDestinations(): Promise<Destination[]> {
  const res = await api.get("/destinations");

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log("DESTINATIONS STATUS:", res.status);
    // eslint-disable-next-line no-console
    console.log("DESTINATIONS DATA:", res.data);
  }

  // se o backend retornar direto um array:
  if (Array.isArray(res.data)) return res.data as Destination[];

  // se retornar paginado: { content: [...] }
  const data: any = res.data;
  if (Array.isArray(data?.content)) return data.content as Destination[];

  return [];
}
