import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api, { getApiErrorMessage } from "../api/client";
import AutocompleteField from "../components/AutocompleteField";
import SelectedItemCard from "../components/SelectedItemCard";
import Header from "../components/Header";
import {
  getDestinationCities,
  getDestinationCountries,
  resolveDestination,
  type DestinationCity,
  type DestinationCountry,
} from "../api/destinationApi";
import { useMediaQuery } from "../shared/hooks/useMediaQuery";
import {
  cardStyle,
  inputSurfaceStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
} from "../shared/ui/styles";
import { ui } from "../shared/ui/tokens";

type TripCreateResponse = { id?: number };

export default function TripCreatePage() {
  const navigate = useNavigate();
  const isNarrow = useMediaQuery("(max-width: 640px)");

  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [countries, setCountries] = useState<DestinationCountry[]>([]);
  const [countryQuery, setCountryQuery] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [selectedCountryName, setSelectedCountryName] = useState("");
  const [loadingCountries, setLoadingCountries] = useState(true);

  const [cityQuery, setCityQuery] = useState("");
  const [cities, setCities] = useState<DestinationCity[]>([]);
  const [selectedCity, setSelectedCity] = useState<DestinationCity | null>(null);
  const [loadingCities, setLoadingCities] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredCountries = useMemo(() => {
    const query = countryQuery.trim().toLowerCase();
    if (!query) return countries.slice(0, 12);
    return countries
      .filter((country) => country.name.toLowerCase().includes(query))
      .slice(0, 12);
  }, [countries, countryQuery]);

  const canSubmit = useMemo(() => {
    return (
      title.trim().length > 0 &&
      Boolean(selectedCountryCode) &&
      Boolean(selectedCity) &&
      Boolean(startDate) &&
      Boolean(endDate) &&
      !loading
    );
  }, [title, selectedCountryCode, selectedCity, startDate, endDate, loading]);

  useEffect(() => {
    let alive = true;

    setLoadingCountries(true);
    setError(null);

    getDestinationCountries()
      .then((list) => {
        if (!alive) return;
        setCountries(list);
      })
      .catch((e) => {
        if (!alive) return;
        setError(getApiErrorMessage(e));
      })
      .finally(() => {
        if (!alive) return;
        setLoadingCountries(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedCountryCode || cityQuery.trim().length < 2) {
      setCities([]);
      setLoadingCities(false);
      return;
    }

    let alive = true;
    console.log(`[TripCreatePage] Triggering city search for country: ${selectedCountryCode}, query: "${cityQuery}"`);
    const timeoutId = window.setTimeout(() => {
      setLoadingCities(true);
      getDestinationCities(selectedCountryCode, cityQuery)
        .then((list) => {
          if (!alive) return;
          console.log(`[TripCreatePage] Cities received for "${cityQuery}":`, list);
          setCities(list);
        })
        .catch((e) => {
          if (!alive) return;
          console.error(`[TripCreatePage] Error searching cities for "${cityQuery}":`, e);
          setCities([]);
          setError(getApiErrorMessage(e));
        })
        .finally(() => {
          if (!alive) return;
          setLoadingCities(false);
        });
    }, 250);

    return () => {
      alive = false;
      window.clearTimeout(timeoutId);
    };
  }, [cityQuery, selectedCountryCode]);

  function selectCountry(country: DestinationCountry) {
    setSelectedCountryCode(country.code);
    setSelectedCountryName(country.name);
    setCountryQuery(country.name);
    setSelectedCity(null);
    setCityQuery("");
    setCities([]);
    setError(null);
  }

  function clearCountry() {
    setSelectedCountryCode("");
    setSelectedCountryName("");
    setCountryQuery("");
    setSelectedCity(null);
    setCityQuery("");
    setCities([]);
  }

  function selectCity(city: DestinationCity) {
    setSelectedCity(city);
    setCityQuery(city.name);
    setError(null);
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();

    if (!trimmedTitle) return setError("Título é obrigatório.");
    if (!selectedCountryName) return setError("Selecione um país.");
    if (!selectedCity) return setError("Selecione uma cidade.");
    if (!startDate) return setError("Data inicial é obrigatória.");
    if (!endDate) return setError("Data final é obrigatória.");
    if (endDate < startDate) return setError("Data final não pode ser menor que a inicial.");

    try {
      setLoading(true);

      const destination = await resolveDestination({
        name: selectedCity.name,
        country: selectedCity.country || selectedCountryName,
      });

      const res = await api.post<TripCreateResponse>("/trips", {
        title: trimmedTitle,
        destinationId: destination.id,
        startDate,
        endDate,
      });

      const newId = res.data?.id;
      if (Number.isFinite(Number(newId))) {
        navigate(`/trips/${Number(newId)}/summary`, { replace: true });
      } else {
        navigate("/trips", { replace: true });
      }
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: ui.colors.neutral[50] }}>
      <Header />
      <div className="container" style={{ padding: `${ui.space.xl}px ${ui.space.md}px` }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ marginBottom: ui.space.xl }}>
            <h1
              style={{
                margin: 0,
                fontSize: ui.typography.fontSize["3xl"],
                fontWeight: ui.typography.fontWeight.bold,
                color: ui.colors.neutral[900],
              }}
            >
              Planeje sua Viagem
            </h1>
            <p
              style={{
                marginTop: ui.space.sm,
                color: ui.colors.neutral[600],
                fontSize: ui.typography.fontSize.lg,
              }}
            >
              Escolha o destino e as datas para começar.
            </p>
          </div>

          <div className="slide-up" style={cardStyle()}>
            <form onSubmit={onCreate} style={{ display: "grid", gap: ui.space.lg }}>
              <label style={field}>
                <span style={labelStyle}>Nome da viagem</span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading}
                  placeholder="Ex: Férias em Paris 2026"
                  style={inputSurfaceStyle()}
                />
              </label>

              <AutocompleteField
                disabled={loading || loadingCountries}
                emptyMessage="Nenhum país encontrado."
                getItemKey={(country) => country.code}
                inputPlaceholder={loadingCountries ? "Carregando países..." : "Digite para buscar um país"}
                items={filteredCountries}
                label="Buscar país"
                loading={loadingCountries}
                loadingMessage="Carregando países..."
                onChangeQuery={(value) => {
                  setCountryQuery(value);
                  setSelectedCountryCode("");
                  setSelectedCountryName("");
                  setSelectedCity(null);
                  setCityQuery("");
                  setCities([]);
                  setError(null);
                }}
                onSelect={selectCountry}
                query={countryQuery}
                renderItem={(country) => (
                  <>
                    <span style={{ display: "block", fontWeight: 700 }}>{country.name}</span>
                    <span style={{ display: "block", opacity: 0.7, marginTop: 4 }}>{country.code}</span>
                  </>
                )}
                selectedItem={
                  selectedCountryCode ? { code: selectedCountryCode, name: selectedCountryName } : null
                }
              />

              {selectedCountryCode && (
                <SelectedItemCard
                  actionLabel="Trocar país"
                  description={selectedCountryCode}
                  label="País selecionado"
                  onAction={clearCountry}
                  title={selectedCountryName}
                />
              )}

              <AutocompleteField
                disabled={loading || !selectedCountryCode}
                emptyMessage={
                  cityQuery.trim().length >= 2
                    ? "Nenhuma cidade encontrada para esse país."
                    : "Digite pelo menos 2 letras para buscar."
                }
                getItemKey={(city) => `${city.name}-${city.country}-${city.formatted}`}
                inputPlaceholder={selectedCountryCode ? "Digite ao menos 2 letras" : "Escolha um país primeiro"}
                items={cities}
                label="Buscar cidade"
                loading={loadingCities}
                loadingMessage="Buscando cidades..."
                minQueryLength={2}
                onChangeQuery={(value) => {
                  setCityQuery(value);
                  setSelectedCity(null);
                  setError(null);
                }}
                onSelect={selectCity}
                query={cityQuery}
                renderItem={(city) => (
                  <>
                    <span style={{ display: "block", fontWeight: 700 }}>{city.name}</span>
                    <span style={{ display: "block", opacity: 0.72, marginTop: 4 }}>
                      {city.formatted || city.country}
                    </span>
                  </>
                )}
                selectedItem={selectedCity}
              />

              {selectedCity && (
                <SelectedItemCard
                  actionLabel="Trocar cidade"
                  description={selectedCity.formatted || `${selectedCity.name}, ${selectedCity.country}`}
                  label="Cidade selecionada"
                  onAction={() => {
                    setSelectedCity(null);
                    setCityQuery("");
                  }}
                  title={selectedCity.name}
                />
              )}

              <div style={{ display: "grid", gridTemplateColumns: isNarrow ? "1fr" : "1fr 1fr", gap: ui.space.md }}>
                <label style={field}>
                  <span style={labelStyle}>Início</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={loading}
                    style={inputSurfaceStyle()}
                  />
                </label>

                <label style={field}>
                  <span style={labelStyle}>Fim</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={loading}
                    style={inputSurfaceStyle()}
                  />
                </label>
              </div>

              {error && (
                <div
                  className="slide-up"
                  style={{
                    padding: ui.space.md,
                    borderRadius: ui.radius.md,
                    background: "rgba(220,38,38,0.1)",
                    border: `1px solid ${ui.colors.error}`,
                    color: ui.colors.error,
                  }}
                >
                  {error}
                </div>
              )}

              <div style={{ display: "flex", gap: ui.space.md, marginTop: ui.space.sm, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => navigate("/trips")}
                  disabled={loading}
                  style={{
                    ...secondaryButtonStyle(),
                    flex: 1,
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  style={{
                    ...primaryButtonStyle(),
                    flex: 1,
                    opacity: canSubmit ? 1 : 0.6,
                    cursor: canSubmit ? "pointer" : "not-allowed",
                  }}
                >
                  {loading ? "Criando..." : "Criar viagem"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const field: CSSProperties = { display: "grid", gap: ui.space.xs };
const labelStyle: CSSProperties = {
  fontSize: ui.typography.fontSize.sm,
  fontWeight: ui.typography.fontWeight.medium,
  color: ui.colors.neutral[700],
};
