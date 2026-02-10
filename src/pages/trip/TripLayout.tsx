import { NavLink, Outlet, useNavigate, useParams } from "react-router-dom";

export default function TripLayout() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const tabClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded ${isActive ? "bg-black text-white" : "bg-gray-100"}`;

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <button onClick={() => navigate("/trips")}>← Voltar</button>
        <h2 style={{ margin: 0 }}>Trip #{tripId}</h2>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <NavLink to="summary" className={tabClass}>Summary</NavLink>
        <NavLink to="itinerary" className={tabClass}>Itinerary</NavLink>
        <NavLink to="activities" className={tabClass}>Activities</NavLink>
        <NavLink to="expenses" className={tabClass}>Expenses</NavLink>
      </div>

      <Outlet />
    </div>
  );
}
