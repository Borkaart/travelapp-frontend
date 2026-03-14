import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { createActivity, getActivitiesByItineraryDay } from "../api/activityApi";
import { getApiErrorMessage } from "../api/client";
import {
  bookHotelOffer,
  getHotelOffers,
  getDestinationHotels,
  getDestinationPlaces,
  type DestinationHotelBookingResponse,
  type DestinationHotel,
  type DestinationHotelOffer,
  type DestinationPlace,
} from "../api/destinationApi";
import { getItineraryDaysByTrip, type ItineraryDay } from "../api/itineraryDayApi";
import BudgetProgressBar from "../features/trip-summary/components/BudgetProgressBar";
import { useTripSummary } from "../features/trip-summary/hooks/useTripSummary";
import { useMediaQuery } from "../shared/hooks/useMediaQuery";
import {
  ghostButtonStyle,
  inputSurfaceStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
} from "../shared/ui/styles";
import { ui } from "../shared/ui/tokens";
import { useToast } from "../shared/toast/toast";

type Props = {
  tripId: number;
  destinationId?: number | null;
  onBack: () => void;
  refreshKey: number;
};

export default function TripSummary({ tripId, destinationId, onBack, refreshKey }: Props) {
  const navigate = useNavigate();
  const { push } = useToast();
  const isNarrow = useMediaQuery("(max-width: 720px)");
  const { data, loading, error, health } = useTripSummary(tripId, refreshKey);
  const [places, setPlaces] = useState<DestinationPlace[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [placesError, setPlacesError] = useState<string | null>(null);
  const [hotels, setHotels] = useState<DestinationHotel[]>([]);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [hotelsError, setHotelsError] = useState<string | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<DestinationHotel | null>(null);
  const [hotelOffers, setHotelOffers] = useState<DestinationHotelOffer[]>([]);
  const [loadingHotelOffers, setLoadingHotelOffers] = useState(false);
  const [hotelOffersError, setHotelOffersError] = useState<string | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<DestinationHotelOffer | null>(null);
  const [bookingGuestTitle, setBookingGuestTitle] = useState("MR");
  const [bookingGuestFirstName, setBookingGuestFirstName] = useState("");
  const [bookingGuestLastName, setBookingGuestLastName] = useState("");
  const [bookingGuestPhone, setBookingGuestPhone] = useState("");
  const [bookingGuestEmail, setBookingGuestEmail] = useState("");
  const [bookingCardVendorCode, setBookingCardVendorCode] = useState("VI");
  const [bookingCardNumber, setBookingCardNumber] = useState("");
  const [bookingCardExpiryDate, setBookingCardExpiryDate] = useState("");
  const [bookingCardHolderName, setBookingCardHolderName] = useState("");
  const [savingBooking, setSavingBooking] = useState(false);
  const [bookingResult, setBookingResult] = useState<DestinationHotelBookingResponse | null>(null);
  const [hotelAdults, setHotelAdults] = useState("1");
  const [hotelCheckInDate, setHotelCheckInDate] = useState("");
  const [hotelCheckOutDate, setHotelCheckOutDate] = useState("");
  const [itineraryDays, setItineraryDays] = useState<ItineraryDay[]>([]);
  const [dayActivityCounts, setDayActivityCounts] = useState<Record<number, number>>({});
  const [selectedDayActivities, setSelectedDayActivities] = useState<Awaited<ReturnType<typeof getActivitiesByItineraryDay>>>([]);
  const [selectedPlace, setSelectedPlace] = useState<DestinationPlace | null>(null);
  const [selectedDayId, setSelectedDayId] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedCost, setSelectedCost] = useState("");
  const [openItineraryAfterAdd, setOpenItineraryAfterAdd] = useState(true);
  const [savingPlace, setSavingPlace] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  useEffect(() => {
    let alive = true;

    getItineraryDaysByTrip(tripId)
      .then(async (days) => {
        if (!alive) return;
        setItineraryDays(days);
        setSelectedDayId(days[0] ? String(days[0].id) : "");

        const countsEntries = await Promise.all(
          days.map(async (day) => {
            try {
              const activities = await getActivitiesByItineraryDay(day.id);
              return [day.id, activities.length] as const;
            } catch {
              return [day.id, 0] as const;
            }
          }),
        );

        if (!alive) return;
        setDayActivityCounts(Object.fromEntries(countsEntries));
      })
      .catch(() => {
        if (!alive) return;
        setItineraryDays([]);
        setDayActivityCounts({});
      });

    return () => {
      alive = false;
    };
  }, [tripId, refreshKey]);

  useEffect(() => {
    if (!selectedPlace || !selectedDayId) {
      setSelectedDayActivities([]);
      return;
    }

    let alive = true;

    getActivitiesByItineraryDay(Number(selectedDayId))
      .then((activities) => {
        if (!alive) return;
        setSelectedDayActivities(activities);
      })
      .catch(() => {
        if (!alive) return;
        setSelectedDayActivities([]);
      });

    return () => {
      alive = false;
    };
  }, [selectedDayId, selectedPlace, refreshKey]);

  useEffect(() => {
    if (!destinationId) {
      setPlaces([]);
      setPlacesError(null);
      return;
    }

    let alive = true;
    setLoadingPlaces(true);
    setPlacesError(null);
    setLoadingHotels(true);
    setHotelsError(null);

    getDestinationPlaces(destinationId)
      .then((items) => {
        if (!alive) return;
        setPlaces(items);
      })
      .catch((err) => {
        if (!alive) return;
        setPlaces([]);
        setPlacesError(getApiErrorMessage(err));
      })
      .finally(() => {
        if (!alive) return;
        setLoadingPlaces(false);
      });

    getDestinationHotels(destinationId)
      .then((items) => {
        if (!alive) return;
        setHotels(items);
      })
      .catch((err) => {
        if (!alive) return;
        setHotels([]);
        setHotelsError(getApiErrorMessage(err));
      })
      .finally(() => {
        if (!alive) return;
        setLoadingHotels(false);
      });

    return () => {
      alive = false;
    };
  }, [destinationId]);

  useEffect(() => {
    if (!data) return;
    setHotelCheckInDate(data.startDate);
    setHotelCheckOutDate(data.endDate);
  }, [data]);

  if (loading) return <p>Carregando summary...</p>;

  if (error) {
    return (
      <div>
        <button onClick={onBack} style={btn()}>
          Voltar
        </button>
        <p style={{ color: "crimson", marginTop: 12 }}>Erro: {error}</p>
      </div>
    );
  }

  if (!data || !health) return <p>Nenhum dado.</p>;

  const hasBudget = Number(data.budgetTotal ?? 0) > 0;
  const hasExpenses = Number(data.expensesCount ?? 0) > 0;
  const hasTimeConflict = Boolean(selectedTime) && selectedDayActivities.some((activity) => sameTime(activity.time, selectedTime));
  const suggestedFreeSlot = suggestFreeSlot(selectedDayActivities, selectedTime || suggestTimeForCategory(selectedPlace?.category));

  async function addPlaceToItinerary() {
    if (!selectedPlace) return;
    if (!selectedDayId) {
      push({
        kind: "error",
        title: "Sem dia disponivel",
        message: "Nao foi encontrado um dia do itinerario para adicionar a atracao.",
      });
      return;
    }

    setSavingPlace(true);
    try {
      const parsedCost =
        selectedCost.trim() === ""
          ? undefined
          : (() => {
              const value = Number(selectedCost);
              if (!Number.isFinite(value) || value < 0) {
                throw new Error("Custo previsto invalido.");
              }
              return value;
            })();

      await createActivity({
        itineraryDayId: Number(selectedDayId),
        type: "SIGHTSEEING",
        title: selectedPlace.name,
        place: selectedPlace.formatted || selectedPlace.name,
        notes: selectedPlace.website ? `Site oficial: ${selectedPlace.website}` : undefined,
        time: selectedTime || undefined,
        cost: parsedCost,
      });

      setSelectedPlace(null);
      setSelectedTime("");
      setSelectedCost("");
      if (openItineraryAfterAdd) {
        navigate("../itinerary");
      }
      push({
        kind: "success",
        title: "Atracao adicionada",
        message: "A sugestao foi enviada para o itinerary.",
      });
    } catch (err) {
      push({
        kind: "error",
        title: "Falha ao adicionar atracao",
        message: err instanceof Error ? err.message : getApiErrorMessage(err),
      });
    } finally {
      setSavingPlace(false);
    }
  }

  async function loadHotelOffers() {
    if (!selectedHotel?.hotelId) {
      setHotelOffersError("Hotel sem identificador para busca.");
      return;
    }

    setLoadingHotelOffers(true);
    setHotelOffersError(null);
    setSelectedOffer(null);
    setBookingResult(null);
    try {
      const offers = await getHotelOffers({
        hotelId: selectedHotel.hotelId,
        checkInDate: hotelCheckInDate,
        checkOutDate: hotelCheckOutDate,
        adults: Math.max(1, Number(hotelAdults) || 1),
      });
      setHotelOffers(offers);
    } catch (err) {
      setHotelOffers([]);
      setHotelOffersError(getApiErrorMessage(err));
    } finally {
      setLoadingHotelOffers(false);
    }
  }

  async function submitHotelBooking() {
    if (!selectedOffer?.offerId) {
      push({
        kind: "error",
        title: "Oferta invalida",
        message: "Selecione uma oferta valida para reservar.",
      });
      return;
    }

    setSavingBooking(true);
    try {
      const booking = await bookHotelOffer({
        offerId: selectedOffer.offerId,
        guestTitle: bookingGuestTitle,
        guestFirstName: bookingGuestFirstName,
        guestLastName: bookingGuestLastName,
        guestPhone: bookingGuestPhone,
        guestEmail: bookingGuestEmail,
        cardVendorCode: bookingCardVendorCode,
        cardNumber: bookingCardNumber,
        cardExpiryDate: bookingCardExpiryDate,
        cardHolderName: bookingCardHolderName || undefined,
      });
      setBookingResult(booking);
      push({
        kind: "success",
        title: "Reserva enviada",
        message: booking.bookingId
          ? `Reserva criada com o codigo ${booking.bookingId}.`
          : "Reserva criada com sucesso.",
      });
    } catch (err) {
      push({
        kind: "error",
        title: "Falha ao reservar hotel",
        message: getApiErrorMessage(err),
      });
    } finally {
      setSavingBooking(false);
    }
  }

  return (
    <div style={{ minHeight: "100%", display: "grid", alignContent: "start" }}>
      <button onClick={onBack} style={btn()}>
        Voltar
      </button>

      <h1 style={{ marginTop: 12, fontSize: isNarrow ? 28 : 36, wordBreak: "break-word" }}>{data.title}</h1>

      <p style={{ opacity: 0.8 }}>
        {data.startDate} - {data.endDate} - {data.totalDays} dias
      </p>

      {!hasBudget && (
        <div style={emptyBox}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>
            Defina um orcamento para acompanhar seus gastos
          </div>

          <div style={{ marginTop: 6, opacity: 0.85 }}>
            Sem orcamento nao e possivel calcular progresso e status financeiro da viagem.
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" onClick={() => navigate("../budget")} style={primaryBtn}>
              Definir Budget
            </button>

            <button type="button" onClick={() => navigate("../expenses")} style={secondaryBtn}>
              Registrar despesa
            </button>
          </div>
        </div>
      )}

      {hasBudget && (
        <div style={{ marginTop: 16 }}>
          <BudgetProgressBar health={health} />
        </div>
      )}

      <div style={{ ...grid, gap: isNarrow ? 10 : ui.space.md }}>
        <Card label="Dias do Itinerario" value={data.itineraryDaysCount} />
        <Card label="Atividades" value={data.activitiesCount} />
        <Card label="Previsto no Itinerario" value={formatMoney(data.itineraryPlannedTotal)} />
        <Card label="Despesas" value={data.expensesCount} />
        <Card label="Total de Despesas" value={formatMoney(data.expensesTotal)} />
        <Card label="Budget Total" value={hasBudget ? formatMoney(data.budgetTotal) : "-"} />
        <Card label="Saldo do Orcamento" value={hasBudget ? formatMoney(health.remaining) : "-"} />
      </div>

      <PlacesSection
        itineraryDays={itineraryDays}
        loading={loadingPlaces}
        onAddToItinerary={(place) => {
          setSelectedPlace(place);
          setSelectedDayId((current) => current || suggestBestDayId(itineraryDays, dayActivityCounts));
          setSelectedTime(suggestTimeForCategory(place.category));
          setSelectedCost("");
          setOpenItineraryAfterAdd(true);
        }}
        error={placesError}
        places={places}
        destinationName={data.destinationName}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
      />

      <HotelsSection
        destinationName={data.destinationName}
        error={hotelsError}
        hotels={hotels}
        loading={loadingHotels}
        onViewOffers={(hotel) => {
          setSelectedHotel(hotel);
          setHotelOffers([]);
          setHotelOffersError(null);
          setSelectedOffer(null);
          setBookingResult(null);
        }}
      />

      {selectedHotel && (
        <div style={modalBackdrop}>
          <div style={{ ...modalBox, maxWidth: isNarrow ? "100%" : modalBox.maxWidth, maxHeight: "calc(100vh - 32px)", overflowY: "auto", padding: isNarrow ? ui.space.lg : 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.72 }}>Ofertas de hotel</div>
                <div style={{ marginTop: 6, fontSize: 28, fontWeight: 800 }}>{selectedHotel.name}</div>
                <div style={{ marginTop: 6, opacity: 0.84 }}>
                  {selectedHotel.address || selectedHotel.city || "Busque ofertas para as datas da viagem"}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedHotel(null);
                  setSelectedOffer(null);
                  setBookingResult(null);
                }}
                style={btn()}
              >
                Fechar
              </button>
            </div>

            <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: isNarrow ? "1fr" : "1fr 1fr 120px", gap: 10 }}>
                <label>
                  Check-in
                  <input
                    type="date"
                    value={hotelCheckInDate}
                    onChange={(e) => setHotelCheckInDate(e.target.value)}
                    style={selectInput}
                  />
                </label>
                <label>
                  Check-out
                  <input
                    type="date"
                    value={hotelCheckOutDate}
                    onChange={(e) => setHotelCheckOutDate(e.target.value)}
                    style={selectInput}
                  />
                </label>
                <label>
                  Adultos
                  <input
                    value={hotelAdults}
                    onChange={(e) => setHotelAdults(e.target.value)}
                    inputMode="numeric"
                    style={selectInput}
                  />
                </label>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={loadHotelOffers}
                  style={primaryBtn}
                >
                  {loadingHotelOffers ? "Buscando..." : "Ver ofertas"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedHotel(null);
                    setSelectedOffer(null);
                    setBookingResult(null);
                  }}
                  style={secondaryBtn}
                >
                  Cancelar
                </button>
              </div>

              {hotelOffersError ? <div style={emptyBox}>{hotelOffersError}</div> : null}

              {loadingHotelOffers ? <div style={{ opacity: 0.8 }}>Carregando ofertas do hotel...</div> : null}

              {!loadingHotelOffers && hotelOffers.length > 0 ? (
                <div style={{ display: "grid", gap: 12 }}>
                  {hotelOffers.map((offer, index) => (
                    <div
                      key={`${offer.offerId || "offer"}-${index}`}
                      style={{
                        ...offerCard,
                        border:
                          selectedOffer?.offerId === offer.offerId
                            ? "1px solid rgba(74,222,128,0.34)"
                            : "1px solid rgba(255,255,255,0.10)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                        <div>
                          <div style={{ fontSize: 12, opacity: 0.68 }}>{offer.roomDescription || "Oferta de hospedagem"}</div>
                          <div style={{ marginTop: 6, fontSize: 22, fontWeight: 800 }}>
                            {offer.currency || "BRL"} {offer.totalPrice || "-"}
                          </div>
                          <div style={{ marginTop: 8, opacity: 0.82 }}>
                            {offer.checkInDate} ate {offer.checkOutDate}
                            {offer.adults ? ` · ${offer.adults} adulto(s)` : ""}
                          </div>
                          {offer.boardType ? (
                            <div style={{ marginTop: 8, opacity: 0.78 }}>Regime: {offer.boardType}</div>
                          ) : null}
                          {offer.paymentType ? (
                            <div style={{ marginTop: 8, opacity: 0.78 }}>Pagamento: {offer.paymentType}</div>
                          ) : null}
                          {offer.cancellationDescription ? (
                            <div style={{ marginTop: 8, opacity: 0.76 }}>{offer.cancellationDescription}</div>
                          ) : null}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOffer(offer);
                            setBookingResult(null);
                          }}
                          style={ghostBtn}
                        >
                          {selectedOffer?.offerId === offer.offerId ? "Selecionada" : "Reservar"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {!loadingHotelOffers && !hotelOffersError && hotelOffers.length === 0 ? (
                <div style={emptyBox}>Busque ofertas para ver quartos, preços e condições para esse hotel.</div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {selectedOffer && selectedHotel && (
        <div style={modalBackdrop}>
          <div style={{ ...bookingModalBox, maxWidth: isNarrow ? "100%" : bookingModalBox.maxWidth, maxHeight: "calc(100vh - 32px)", overflowY: "auto", padding: isNarrow ? ui.space.lg : 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.72 }}>Reserva de hotel</div>
                <div style={{ marginTop: 6, fontSize: 28, fontWeight: 800 }}>{selectedHotel.name}</div>
                <div style={{ marginTop: 6, opacity: 0.84 }}>
                  {selectedOffer.roomDescription || "Oferta selecionada"}
                </div>
              </div>

              <button type="button" onClick={() => setSelectedOffer(null)} style={btn()}>
                Fechar
              </button>
            </div>

            <div style={{ marginTop: 16, display: "grid", gap: 14 }}>
              <div style={bookingHeaderBox}>
                <div style={{ fontSize: 12, opacity: 0.68 }}>Oferta</div>
                <div style={{ marginTop: 6, fontSize: 20, fontWeight: 800 }}>
                  {selectedOffer.currency || "BRL"} {selectedOffer.totalPrice || "-"}
                </div>
                <div style={{ marginTop: 8, opacity: 0.82 }}>
                  {selectedOffer.checkInDate} ate {selectedOffer.checkOutDate}
                  {selectedOffer.adults ? ` · ${selectedOffer.adults} adulto(s)` : ""}
                </div>
              </div>

              <div style={modalInfoGrid}>
                <label>
                  Tratamento
                  <select value={bookingGuestTitle} onChange={(e) => setBookingGuestTitle(e.target.value)} style={selectInput}>
                    <option value="MR">MR</option>
                    <option value="MRS">MRS</option>
                    <option value="MS">MS</option>
                  </select>
                </label>
                <label>
                  Nome
                  <input value={bookingGuestFirstName} onChange={(e) => setBookingGuestFirstName(e.target.value)} style={selectInput} />
                </label>
                <label>
                  Sobrenome
                  <input value={bookingGuestLastName} onChange={(e) => setBookingGuestLastName(e.target.value)} style={selectInput} />
                </label>
                <label>
                  Telefone
                  <input value={bookingGuestPhone} onChange={(e) => setBookingGuestPhone(e.target.value)} style={selectInput} />
                </label>
                <label>
                  Email
                  <input type="email" value={bookingGuestEmail} onChange={(e) => setBookingGuestEmail(e.target.value)} style={selectInput} />
                </label>
                <label>
                  Bandeira
                  <select value={bookingCardVendorCode} onChange={(e) => setBookingCardVendorCode(e.target.value)} style={selectInput}>
                    <option value="VI">Visa</option>
                    <option value="MC">Mastercard</option>
                    <option value="AX">Amex</option>
                  </select>
                </label>
                <label>
                  Numero do cartao
                  <input value={bookingCardNumber} onChange={(e) => setBookingCardNumber(e.target.value)} style={selectInput} />
                </label>
                <label>
                  Expira em
                  <input
                    value={bookingCardExpiryDate}
                    onChange={(e) => setBookingCardExpiryDate(e.target.value)}
                    placeholder="2027-08"
                    style={selectInput}
                  />
                </label>
                <label>
                  Nome no cartao
                  <input
                    value={bookingCardHolderName}
                    onChange={(e) => setBookingCardHolderName(e.target.value)}
                    placeholder="Opcional"
                    style={selectInput}
                  />
                </label>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button type="button" onClick={submitHotelBooking} disabled={savingBooking} style={primaryBtn}>
                  {savingBooking ? "Reservando..." : "Confirmar reserva"}
                </button>
                <button type="button" onClick={() => setSelectedOffer(null)} disabled={savingBooking} style={secondaryBtn}>
                  Voltar para ofertas
                </button>
              </div>

              {bookingResult ? (
                <div style={bookingSuccessBox}>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>Reserva confirmada</div>
                  <div style={{ marginTop: 6, fontSize: 20, fontWeight: 800 }}>
                    {bookingResult.hotelName || selectedHotel.name}
                  </div>
                  <div style={{ marginTop: 8, opacity: 0.82 }}>
                    Codigo: {bookingResult.bookingId || "-"}
                    {bookingResult.providerConfirmationId ? ` · Confirmacao: ${bookingResult.providerConfirmationId}` : ""}
                  </div>
                  <div style={{ marginTop: 8, opacity: 0.82 }}>
                    Hospede: {bookingResult.guestName || `${bookingGuestFirstName} ${bookingGuestLastName}`.trim() || "-"}
                  </div>
                  <div style={{ marginTop: 8, opacity: 0.82 }}>
                    {bookingResult.currency || selectedOffer.currency || "BRL"} {bookingResult.totalPrice || selectedOffer.totalPrice || "-"}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {selectedPlace && (
        <div style={modalBackdrop}>
          <div style={{ ...modalBox, maxWidth: isNarrow ? "100%" : modalBox.maxWidth, maxHeight: "calc(100vh - 32px)", overflowY: "auto", padding: isNarrow ? ui.space.lg : 16 }}>
            <div style={modalHero(selectedPlace.imageUrl)}>
              <div style={modalHeroOverlay}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", width: "100%" }}>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.72 }}>Adicionar ao itinerário</div>
                    <div style={{ marginTop: 6, fontSize: 28, fontWeight: 800 }}>{selectedPlace.name}</div>
                    <div style={{ marginTop: 6, opacity: 0.84 }}>
                      {selectedPlace.formatted || "Escolha um dia da viagem"}
                    </div>
                  </div>

                  <button type="button" onClick={() => setSelectedPlace(null)} style={btn()}>
                    Fechar
                  </button>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 16, display: "grid", gap: 16 }}>
              {selectedPlace.description && (
                <div style={descriptionBox}>
                  {selectedPlace.description}
                </div>
              )}

              <div style={modalInfoGrid}>
                <InfoBox
                  label="Categoria"
                  value={formatCategory(selectedPlace.category)}
                />
                {selectedPlace.openingHours && (
                  <InfoBox
                    label="Funcionamento"
                    value={selectedPlace.openingHours}
                  />
                )}
                {selectedPlace.price && (
                  <InfoBox
                    label="Preço/Taxas"
                    value={selectedPlace.price}
                  />
                )}
                {selectedPlace.rating && (
                  <InfoBox
                    label="Avaliação"
                    value={`⭐ ${selectedPlace.rating.toFixed(1)} / 5.0`}
                  />
                )}
              </div>

              {selectedPlace.visitationTips && selectedPlace.visitationTips.length > 0 && (
                <div style={tipsBox}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, color: "#bbf7d0" }}>💡 Dicas de visitação</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {selectedPlace.visitationTips.map((tip, i) => (
                      <div key={i} style={{ fontSize: 14, opacity: 0.9 }}>• {tip}</div>
                    ))}
                  </div>
                </div>
              )}

              {selectedPlace.suggestedRoutes && selectedPlace.suggestedRoutes.length > 0 && (
                <div style={routesBox}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: "#93c5fd" }}>🗺️ Roteiros sugeridos</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {selectedPlace.suggestedRoutes.map((route, i) => (
                      <span key={i} style={routeTag}>{route}</span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "8px 0" }} />

              <div style={quickRow}>
                <button type="button" onClick={() => setSelectedTime("09:00")} style={quickBtn}>
                  Manhã
                </button>
                <button type="button" onClick={() => setSelectedTime("14:00")} style={quickBtn}>
                  Tarde
                </button>
                <button type="button" onClick={() => setSelectedTime("20:00")} style={quickBtn}>
                  Noite
                </button>
                {suggestedFreeSlot ? (
                  <button type="button" onClick={() => setSelectedTime(suggestedFreeSlot)} style={quickBtnAccent}>
                    Próximo livre {suggestedFreeSlot}
                  </button>
                ) : null}
              </div>

              <label>
                Dia da viagem
                <select value={selectedDayId} onChange={(e) => setSelectedDayId(e.target.value)} style={selectInput}>
                  {itineraryDays.map((day, index) => (
                    <option key={day.id} value={String(day.id)}>
                      Dia {index + 1} - {day.date}
                    </option>
                  ))}
                </select>
              </label>

              <div style={{ display: "grid", gridTemplateColumns: isNarrow ? "1fr" : "1fr 1fr", gap: 10 }}>
                <label>
                  Horário sugerido
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    style={selectInput}
                  />
                </label>

                <label>
                  Custo previsto
                  <input
                    value={selectedCost}
                    onChange={(e) => setSelectedCost(e.target.value)}
                    inputMode="decimal"
                    placeholder="ex: 80.00"
                    style={selectInput}
                  />
                </label>
              </div>

              {selectedDayActivities.length > 0 ? (
                <div style={dayLoadBox}>
                  <div style={{ fontSize: 12, opacity: 0.68 }}>
                    Esse dia já tem {selectedDayActivities.length} atividade(s).
                  </div>
                  {hasTimeConflict ? (
                    <div style={{ marginTop: 6, color: "#fecaca" }}>
                      Já existe uma atividade nesse horário. Considere usar {suggestedFreeSlot || "outro horário"}.
                    </div>
                  ) : selectedTime ? (
                    <div style={{ marginTop: 6, color: "#bbf7d0" }}>Horário livre para esse dia.</div>
                  ) : null}
                </div>
              ) : null}

              <label style={checkboxRow}>
                <input
                  type="checkbox"
                  checked={openItineraryAfterAdd}
                  onChange={(e) => setOpenItineraryAfterAdd(e.target.checked)}
                />
                <span>Abrir o itinerário depois de adicionar</span>
              </label>

              <div style={{ display: "flex", gap: 10, marginTop: 4, flexWrap: "wrap" }}>
                <button type="button" onClick={addPlaceToItinerary} disabled={savingPlace || !selectedDayId} style={primaryBtn}>
                  {savingPlace ? "Adicionando..." : "Adicionar ao Itinerary"}
                </button>
                <button type="button" onClick={() => setSelectedPlace(null)} disabled={savingPlace} style={secondaryBtn}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!hasExpenses && (
        <div style={{ marginTop: 14, opacity: 0.85 }}>
          Voce ainda nao registrou despesas. Adicione a primeira na aba <b>Expenses</b>.
        </div>
      )}

      {hasBudget && health.status === "exceeded" && (
        <p style={{ marginTop: 12, color: "crimson" }}>
          Orcamento estourado em {formatMoney(Math.abs(health.remaining))}
        </p>
      )}
    </div>
  );
}

function PlacesSection({
  destinationName,
  error,
  itineraryDays,
  loading,
  onAddToItinerary,
  places,
  categoryFilter,
  onCategoryChange,
}: {
  destinationName?: string | null;
  error: string | null;
  itineraryDays: ItineraryDay[];
  loading: boolean;
  onAddToItinerary: (place: DestinationPlace) => void;
  places: DestinationPlace[];
  categoryFilter: string;
  onCategoryChange: (cat: string) => void;
}) {
  const filtered =
    categoryFilter === "ALL"
      ? places
      : places.filter((p) => p.categoryGroup?.toUpperCase() === categoryFilter);

  const categories = ["ALL", "CULTURAL", "NATURAL", "GASTRONOMICA"];

  return (
    <section style={{ marginTop: 24 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 20 }}>Pontos turísticos</h2>
          <div style={{ marginTop: 6, opacity: 0.76 }}>
            Sugestões enriquecidas para {destinationName || "o destino selecionado"}.
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              style={{
                ...btn(),
                fontSize: 12,
                background: categoryFilter === cat ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)",
                borderColor: categoryFilter === cat ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.14)",
                fontWeight: categoryFilter === cat ? 700 : 400,
              }}
            >
              {cat === "ALL" ? "Todos" : formatCategory(cat)}
            </button>
          ))}
        </div>
      </div>

      {loading && <div style={{ marginTop: 12, opacity: 0.8 }}>Buscando lugares incríveis...</div>}

      {!loading && error && (
        <div style={{ ...emptyBox, marginTop: 12 }}>
          Não foi possível carregar os pontos turísticos: {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div style={{ ...emptyBox, marginTop: 12 }}>
          {categoryFilter === "ALL"
            ? "Nenhum ponto turístico encontrado para esse destino no momento."
            : `Nenhum local na categoria ${formatCategory(categoryFilter)} encontrado.`}
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div style={placesGrid}>
          {filtered.map((place, index) => (
            <div key={`${place.name}-${index}`} style={placeCardLink}>
              <div style={placeCard(place.imageUrl)}>
                <div style={placeCardOverlay}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      {place.rating && (
                        <div style={ratingBadge}>
                          ⭐ {place.rating.toFixed(1)}
                        </div>
                      )}
                    </div>
                    {itineraryDays.length > 0 ? (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          onAddToItinerary(place);
                        }}
                        style={placeActionBtn}
                      >
                        + Itinerário
                      </button>
                    ) : null}
                  </div>
                  
                  <div style={{ cursor: "pointer" }} onClick={() => onAddToItinerary(place)}>
                    <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.9, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      {formatCategory(place.category)}
                    </div>
                    <div style={{ marginTop: 4, fontSize: 18, fontWeight: 800, lineHeight: 1.2 }}>{place.name}</div>
                    {place.price && (
                      <div style={{ marginTop: 6, fontSize: 12, color: "#bbf7d0", fontWeight: 600 }}>
                        💰 {place.price}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function HotelsSection({
  destinationName,
  error,
  hotels,
  loading,
  onViewOffers,
}: {
  destinationName?: string | null;
  error: string | null;
  hotels: DestinationHotel[];
  loading: boolean;
  onViewOffers: (hotel: DestinationHotel) => void;
}) {
  return (
    <section style={{ marginTop: 24 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 20 }}>Hoteis na regiao</h2>
        <div style={{ marginTop: 6, opacity: 0.76 }}>
          Sugestoes de hospedagem para {destinationName || "o destino selecionado"}.
        </div>
      </div>

      {loading && <div style={{ marginTop: 12, opacity: 0.8 }}>Buscando hoteis...</div>}

      {!loading && error && (
        <div style={{ ...emptyBox, marginTop: 12 }}>
          Nao foi possivel carregar os hoteis: {error}
        </div>
      )}

      {!loading && !error && hotels.length === 0 && (
        <div style={{ ...emptyBox, marginTop: 12 }}>
          Nenhum hotel encontrado para esse destino no momento.
        </div>
      )}

      {!loading && !error && hotels.length > 0 && (
        <div style={placesGrid}>
          {hotels.slice(0, 6).map((hotel, index) => (
            <a
              key={`${hotel.hotelId || hotel.name}-${index}`}
              href={buildHotelMapsUrl(hotel)}
              target="_blank"
              rel="noreferrer"
              style={placeCardLink}
            >
              <div style={hotelCard}>
                <div style={placeActions}>
                  {hotel.hotelId ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        onViewOffers(hotel);
                      }}
                      style={placeActionBtn}
                    >
                      Ver ofertas
                    </button>
                  ) : null}
                </div>
                <div style={{ fontSize: 12, opacity: 0.68 }}>
                  {hotel.rating ? `${hotel.rating} estrelas` : "Hospedagem"}
                </div>
                <div style={{ marginTop: 8, fontSize: 20, fontWeight: 800 }}>{hotel.name}</div>
                {hotel.address ? <div style={{ marginTop: 8, opacity: 0.82 }}>{hotel.address}</div> : null}
                {hotel.distanceValue != null ? (
                  <div style={{ marginTop: 12, opacity: 0.76 }}>
                    Aproximadamente {hotel.distanceValue} {hotel.distanceUnit || "KM"} do centro pesquisado
                  </div>
                ) : null}
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

function Card({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div style={card}>
      <div style={{ fontSize: 12, opacity: 0.8 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>{value}</div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div style={infoBox}>
      <div style={{ fontSize: 12, opacity: 0.68 }}>{label}</div>
      <div style={{ marginTop: 6, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function formatMoney(v: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(v ?? 0));
}

function formatCategory(value?: string | null) {
  if (!value) return "Lugar para conhecer";
  const upper = value.toUpperCase();
  if (upper === "CULTURAL") return "🏛️ Cultural";
  if (upper === "NATURAL") return "🌳 Natural";
  if (upper === "GASTRONOMICAL") return "🍴 Gastronômica";
  return value
    .split(".")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" / ");
}

function buildHotelMapsUrl(hotel: DestinationHotel) {
  if (hotel.latitude != null && hotel.longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${hotel.latitude},${hotel.longitude}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name)}`;
}

function suggestTimeForCategory(category?: string | null) {
  if (!category) return "09:00";
  const upper = category.toUpperCase();
  if (upper === "GASTRONOMICAL") return "12:30";
  if (upper === "CULTURAL") return "10:00";
  if (upper === "NATURAL") return "08:30";
  if (category.includes("food")) return "12:30";
  if (category.includes("night")) return "20:00";
  return "09:00";
}

function suggestBestDayId(itineraryDays: ItineraryDay[], dayActivityCounts: Record<number, number>) {
  if (itineraryDays.length === 0) return "";

  return String(
    itineraryDays.reduce((bestDay, currentDay) =>
      (dayActivityCounts[currentDay.id] ?? 0) < (dayActivityCounts[bestDay.id] ?? 0) ? currentDay : bestDay,
    itineraryDays[0]).id,
  );
}

function sameTime(activityTime?: string | null, selectedTime?: string | null) {
  if (!activityTime || !selectedTime) return false;
  return String(activityTime).slice(0, 5) === selectedTime.slice(0, 5);
}

function suggestFreeSlot(
  activities: Awaited<ReturnType<typeof getActivitiesByItineraryDay>>,
  preferredTime: string,
) {
  const occupied = new Set(
    activities
      .map((activity) => activity.time ? String(activity.time).slice(0, 5) : null)
      .filter((time): time is string => Boolean(time)),
  );

  if (!occupied.has(preferredTime)) return preferredTime;

  const [startHour] = preferredTime.split(":").map(Number);
  for (let offset = 1; offset <= 10; offset++) {
    const candidate = `${String(Math.min(startHour + offset, 22)).padStart(2, "0")}:00`;
    if (!occupied.has(candidate)) return candidate;
  }

  return "";
}

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: ui.space.md,
  marginTop: 16,
};

const placesGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: ui.space.md,
  marginTop: 14,
};

const card: React.CSSProperties = {
  borderRadius: ui.radius.lg,
  padding: ui.space.lg,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.04)",
};

const placeCardLink: React.CSSProperties = {
  textDecoration: "none",
  color: "inherit",
};

const placeCard = (imageUrl?: string | null): React.CSSProperties => ({
  borderRadius: 18,
  minHeight: 220,
  border: "1px solid rgba(255,255,255,0.10)",
  background: imageUrl
    ? `linear-gradient(180deg, rgba(4,12,24,0.10), rgba(4,12,24,0.72)), url("${imageUrl}") center/cover`
    : "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
  overflow: "hidden",
  boxShadow: "0 18px 42px rgba(0,0,0,0.18)",
});

const hotelCard: React.CSSProperties = {
  borderRadius: ui.radius.xl,
  minHeight: 180,
  padding: 18,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
  boxShadow: "0 18px 42px rgba(0,0,0,0.14)",
  display: "grid",
  alignContent: "space-between",
};

const offerCard: React.CSSProperties = {
  borderRadius: 16,
  padding: 16,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.04)",
};

const placeCardOverlay: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  minHeight: 220,
  padding: 18,
  background: "linear-gradient(180deg, rgba(4,12,24,0.00), rgba(4,12,24,0.65))",
};

const placeActions: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
};

const placeActionBtn: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(4,12,24,0.48)",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 700,
  minHeight: 40,
};

function btn(): React.CSSProperties {
  return {
    padding: "8px 12px",
    borderRadius: ui.radius.sm,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "#e8eefc",
    cursor: "pointer",
    minHeight: ui.controlHeight.md,
  };
}

const selectInput: React.CSSProperties = {
  ...inputSurfaceStyle(),
};

const emptyBox: React.CSSProperties = {
  marginTop: 16,
  borderRadius: ui.radius.lg,
  padding: ui.space.lg,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.03)",
};

const primaryBtn: React.CSSProperties = {
  ...primaryButtonStyle(),
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.10)",
  color: "#e8eefc",
};

const secondaryBtn: React.CSSProperties = {
  ...secondaryButtonStyle(),
  border: "1px solid rgba(255,255,255,0.10)",
  color: "rgba(255,255,255,0.85)",
  fontWeight: 600,
};

const ghostBtn: React.CSSProperties = {
  ...ghostButtonStyle(),
};

const bookingModalBox: React.CSSProperties = {
  borderRadius: ui.radius.xl,
  padding: 16,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(4,12,24,0.64)",
  width: "100%",
  maxWidth: 860,
};

const modalBox: React.CSSProperties = {
  borderRadius: ui.radius.xl,
  padding: 16,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(4,12,24,0.42)",
  width: "100%",
  maxWidth: 780,
};

const modalBackdrop: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 30,
  display: "grid",
  placeItems: "center",
  padding: 16,
  background: "rgba(4,12,24,0.48)",
  backdropFilter: "blur(10px)",
};

const modalHero = (imageUrl?: string | null): React.CSSProperties => ({
  minHeight: 220,
  borderRadius: 16,
  overflow: "hidden",
  background: imageUrl
    ? `linear-gradient(180deg, rgba(4,12,24,0.08), rgba(4,12,24,0.72)), url("${imageUrl}") center/cover`
    : "linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03))",
});

const modalHeroOverlay: React.CSSProperties = {
  minHeight: 220,
  padding: 18,
  display: "flex",
  alignItems: "flex-end",
  background: "linear-gradient(180deg, rgba(4,12,24,0.00), rgba(4,12,24,0.66))",
};

const modalInfoGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: 10,
};

const infoBox: React.CSSProperties = {
  borderRadius: ui.radius.lg,
  padding: 12,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.04)",
};

const bookingHeaderBox: React.CSSProperties = {
  borderRadius: 16,
  padding: 14,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.04)",
};

const bookingSuccessBox: React.CSSProperties = {
  borderRadius: 16,
  padding: 14,
  border: "1px solid rgba(74,222,128,0.24)",
  background: "rgba(74,222,128,0.10)",
};

const checkboxRow: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  fontSize: 14,
  opacity: 0.9,
  cursor: "pointer",
};

const ratingBadge: React.CSSProperties = {
  padding: "4px 8px",
  borderRadius: 8,
  background: "rgba(0,0,0,0.6)",
  backdropFilter: "blur(4px)",
  fontSize: 12,
  fontWeight: 700,
  color: "#facc15",
  border: "1px solid rgba(255,255,255,0.1)",
};

const descriptionBox: React.CSSProperties = {
  padding: 16,
  borderRadius: 12,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  fontSize: 15,
  lineHeight: 1.6,
  color: "rgba(255,255,255,0.9)",
};

const tipsBox: React.CSSProperties = {
  padding: 14,
  borderRadius: 12,
  background: "rgba(74, 222, 128, 0.05)",
  border: "1px solid rgba(74, 222, 128, 0.15)",
};

const routesBox: React.CSSProperties = {
  padding: 14,
  borderRadius: 12,
  background: "rgba(59, 130, 246, 0.05)",
  border: "1px solid rgba(59, 130, 246, 0.15)",
};

const routeTag: React.CSSProperties = {
  padding: "4px 10px",
  borderRadius: 20,
  background: "rgba(59, 130, 246, 0.15)",
  border: "1px solid rgba(59, 130, 246, 0.2)",
  fontSize: 12,
  fontWeight: 600,
  color: "#93c5fd",
};

const quickRow: React.CSSProperties = {
  display: "flex",
  gap: ui.space.sm,
  flexWrap: "wrap",
};

const quickBtn: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.05)",
  color: "#fff",
  cursor: "pointer",
};

const quickBtnAccent: React.CSSProperties = {
  ...quickBtn,
  border: "1px solid rgba(74,222,128,0.28)",
  background: "rgba(74,222,128,0.14)",
  color: "#d9ffe9",
};

const dayLoadBox: React.CSSProperties = {
  borderRadius: ui.radius.lg,
  padding: ui.space.md,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.04)",
};
