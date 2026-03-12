import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, ArrowRight, Plus, Map as MapIcon } from "lucide-react";
import { getApiErrorMessage } from "../api/client";
import { getTrips, type TripListItem } from "../api/tripApi";
import { ui } from "../shared/ui/tokens";
import { images } from "../shared/ui/assets";
import { cardStyle, primaryButtonStyle } from "../shared/ui/styles";
import Header from "../components/Header";

export default function TripsListPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<TripListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getTrips();
      setTrips(data);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: ui.colors.neutral[50] }}>
      <Header />

      {/* Hero Section */}
      <div
        className="fade-in"
        style={{
          height: 300,
          background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${images.tripsBackground}) no-repeat center center / cover`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          textAlign: "center",
          padding: ui.space.lg,
        }}
      >
        <h1
          style={{
            fontSize: ui.typography.fontSize["4xl"],
            fontWeight: ui.typography.fontWeight.bold,
            marginBottom: ui.space.sm,
            textShadow: "0 2px 4px rgba(0,0,0,0.3)",
          }}
        >
          Suas Próximas Aventuras
        </h1>
        <p
          style={{
            fontSize: ui.typography.fontSize.lg,
            maxWidth: 600,
            opacity: 0.9,
            textShadow: "0 1px 2px rgba(0,0,0,0.3)",
          }}
        >
          Gerencie seus itinerários, orçamentos e memórias em um só lugar.
        </p>
      </div>

      <div className="container" style={{ marginTop: -60, paddingBottom: 60, position: "relative", zIndex: 1 }}>
        {error && (
          <div
            style={{
              padding: ui.space.md,
              borderRadius: ui.radius.md,
              background: "rgba(239, 68, 68, 0.1)",
              border: `1px solid ${ui.colors.error}`,
              color: ui.colors.error,
              marginBottom: ui.space.lg,
              backgroundColor: ui.colors.white,
            }}
          >
            {error}
            <button
              onClick={load}
              style={{
                marginLeft: ui.space.md,
                textDecoration: "underline",
                border: "none",
                background: "transparent",
                color: ui.colors.error,
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: ui.space.xl, color: ui.colors.neutral[500] }}>
            Carregando suas viagens...
          </div>
        ) : null}

        {!loading && !error && trips.length === 0 ? (
          <div
            className="slide-up"
            style={{
              ...cardStyle(),
              textAlign: "center",
              padding: ui.space.xxxl,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: ui.space.md,
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                background: ui.colors.primary[50],
                borderRadius: ui.radius.full,
                display: "grid",
                placeItems: "center",
                color: ui.colors.primary[500],
              }}
            >
              <MapIcon size={40} />
            </div>
            <h2 style={{ fontSize: ui.typography.fontSize.xl, fontWeight: ui.typography.fontWeight.semibold }}>
              Nenhuma viagem encontrada
            </h2>
            <p style={{ color: ui.colors.neutral[500], maxWidth: 400 }}>
              Parece que você ainda não planejou nenhuma viagem. Que tal começar agora?
            </p>
            <button
              onClick={() => navigate("/trips/new")}
              style={{
                ...primaryButtonStyle(),
                marginTop: ui.space.md,
              }}
            >
              <Plus size={18} style={{ marginRight: 8 }} />
              Criar Primeira Viagem
            </button>
          </div>
        ) : null}

        {!loading && !error && trips.length > 0 ? (
          <div
            className="slide-up"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: ui.space.lg,
            }}
          >
            {trips.map((trip) => (
              <div
                key={trip.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/trips/${trip.id}/summary`)}
                onKeyDown={(e) => (e.key === "Enter" ? navigate(`/trips/${trip.id}/summary`) : null)}
                style={{
                  ...cardStyle(),
                  padding: 0,
                  overflow: "hidden",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = ui.shadows.xl;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = ui.shadows.lg;
                }}
              >
                <div
                  style={{
                    height: 180,
                    background: `url(${trip.destinationImageUrl || images.defaultDestination}) no-repeat center center / cover`,
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: ui.space.md,
                      background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                      color: "white",
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: ui.typography.fontSize.lg,
                        fontWeight: ui.typography.fontWeight.bold,
                        textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                      }}
                    >
                      {trip.title}
                    </h3>
                  </div>
                </div>

                <div style={{ padding: ui.space.lg, flex: 1, display: "flex", flexDirection: "column", gap: ui.space.sm }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: ui.colors.neutral[600] }}>
                    <MapPin size={16} color={ui.colors.primary[500]} />
                    <span style={{ fontSize: ui.typography.fontSize.sm, fontWeight: ui.typography.fontWeight.medium }}>
                      {trip.destinationName}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: ui.colors.neutral[600] }}>
                    <Calendar size={16} color={ui.colors.secondary[500]} />
                    <span style={{ fontSize: ui.typography.fontSize.sm }}>
                      {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div style={{ marginTop: "auto", paddingTop: ui.space.md }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        color: ui.colors.primary[600],
                        fontSize: ui.typography.fontSize.sm,
                        fontWeight: ui.typography.fontWeight.semibold,
                      }}
                    >
                      Ver detalhes
                      <ArrowRight size={16} style={{ marginLeft: 4 }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
