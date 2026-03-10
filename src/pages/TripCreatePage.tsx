import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api, { getApiErrorMessage } from "../api/client";
import AutocompleteField from "../components/AutocompleteField";
import SelectedItemCard from "../components/SelectedItemCard";
import {
  getDestinationCities,
  getDestinationCountries,
  resolveDestination,
  type DestinationCity,
  type DestinationCountry,
} from "../api/destinationApi";
import { buildBackgroundStyle } from "../features/trips/backgrounds";
import { useMediaQuery } from "../shared/hooks/useMediaQuery";
import { inputSurfaceStyle, secondaryButtonStyle } from "../shared/ui/styles";
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
    const timeoutId = window.setTimeout(() => {
      setLoadingCities(true);
      getDestinationCities(selectedCountryCode, cityQuery)
        .then((list) => {
          if (!alive) return;
          setCities(list);
        })
        .catch((e) => {
          if (!alive) return;
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

    if (!trimmedTitle) return setError("Titulo e obrigatorio.");
    if (!selectedCountryName) return setError("Selecione um pais.");
    if (!selectedCity) return setError("Selecione uma cidade.");
    if (!startDate) return setError("Data inicial e obrigatoria.");
    if (!endDate) return setError("Data final e obrigatoria.");
    if (endDate < startDate) return setError("Data final nao pode ser menor que a inicial.");

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
    <div style={{ ...buildBackgroundStyle(), ...pageBg }}>
      <div style={{ width: "100%", maxWidth: 640 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, opacity: 0.65, marginBottom: 6 }}>Trips</div>
          <h1 style={{ margin: 0, fontSize: isNarrow ? 26 : 30, letterSpacing: -0.3 }}>Nova viagem</h1>
          <div style={{ opacity: 0.75, marginTop: 8 }}>
            Escolha o pais, busque a cidade e crie a viagem sem depender de um cadastro manual.
          </div>
        </div>

        <div style={card}>
          <form onSubmit={onCreate} style={{ display: "grid", gap: ui.space.md }}>
            <label style={field}>
              <span style={label}>Titulo</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                placeholder="Ex: Paris 2026"
                style={input}
              />
            </label>

            <AutocompleteField
              disabled={loading || loadingCountries}
              emptyMessage="Nenhum pais encontrado."
              getItemKey={(country) => country.code}
              inputPlaceholder={loadingCountries ? "Carregando paises..." : "Digite para buscar um pais"}
              items={filteredCountries}
              label="Buscar pais"
              loading={loadingCountries}
              loadingMessage="Carregando paises..."
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
                actionLabel="Trocar pais"
                description={selectedCountryCode}
                label="Pais selecionado"
                onAction={clearCountry}
                title={selectedCountryName}
              />
            )}

            <AutocompleteField
              disabled={loading || !selectedCountryCode}
              emptyMessage={
                cityQuery.trim().length >= 2
                  ? "Nenhuma cidade encontrada para esse pais."
                  : "Digite pelo menos 2 letras para buscar."
              }
              getItemKey={(city) => `${city.name}-${city.country}-${city.formatted}`}
              inputPlaceholder={selectedCountryCode ? "Digite ao menos 2 letras" : "Escolha um pais primeiro"}
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
                <span style={label}>Inicio</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={loading}
                  style={input}
                />
              </label>

              <label style={field}>
                <span style={label}>Fim</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={loading}
                  style={input}
                />
              </label>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: ui.space.xs, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => navigate("/trips")}
                disabled={loading}
                style={{ ...btnSecondary, width: isNarrow ? "100%" : undefined }}
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={!canSubmit}
                style={{ ...btnPrimary(canSubmit), width: isNarrow ? "100%" : undefined }}
              >
                {loading ? "Criando..." : "Criar viagem"}
              </button>
            </div>
          </form>

          {error && <div style={errorBox}>{error}</div>}
        </div>
      </div>
    </div>
  );
}

const pageBg: CSSProperties = {
  display: "grid",
  placeItems: "center",
  padding: ui.space.xxl,
  minHeight: "100vh",
};

const card: CSSProperties = {
  padding: ui.space.xl,
  borderRadius: ui.radius.xl,
  background: "rgba(4, 12, 24, 0.42)",
  border: "1px solid rgba(255,255,255,0.14)",
  backdropFilter: "blur(14px)",
};

const field: CSSProperties = { display: "grid", gap: ui.space.xs };
const label: CSSProperties = { fontSize: 13, opacity: 0.75 };

const input: CSSProperties = {
  ...inputSurfaceStyle(),
};

const btnPrimary = (enabled: boolean): CSSProperties => ({
  flex: 1,
  padding: "12px 14px",
  borderRadius: ui.radius.md,
  border: "1px solid rgba(74,222,128,0.35)",
  background: enabled ? "rgba(74,222,128,0.18)" : "rgba(74,222,128,0.08)",
  color: "#CFFFE0",
  fontWeight: 800,
  cursor: enabled ? "pointer" : "not-allowed",
  minHeight: ui.controlHeight.md,
});

const btnSecondary: CSSProperties = {
  ...secondaryButtonStyle(),
  padding: "12px 14px",
};

const errorBox: CSSProperties = {
  marginTop: ui.space.md,
  padding: ui.space.md,
  borderRadius: ui.radius.md,
  background: "rgba(220,38,38,0.12)",
  border: "1px solid rgba(220,38,38,0.30)",
  color: "#fecaca",
};
