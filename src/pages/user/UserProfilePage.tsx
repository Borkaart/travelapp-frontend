import React, { useState, useEffect } from "react";
import { User, Mail, MapPin, Calendar, Phone, Globe, Instagram, Facebook, Camera, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "../../shared/contexts/AuthContext";
import api, { getApiErrorMessage } from "../../api/client";
import { useNavigate } from "react-router-dom";
import { ui } from "../../shared/ui/tokens";
import { inputSurfaceStyle, primaryButtonStyle, secondaryButtonStyle } from "../../shared/ui/styles";
import { useToast } from "../../shared/toast/toast";

export default function UserProfilePage({ isSetupMode = false }: { isSetupMode?: boolean }) {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [instagramLink, setInstagramLink] = useState("");
  const [facebookLink, setFacebookLink] = useState("");
  const [websiteLink, setWebsiteLink] = useState("");
  const [gender, setGender] = useState("");
  const [themePreference, setThemePreference] = useState("SYSTEM");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    
    // Fetch detailed profile
    api.get(`/users/${user.id}/profile`)
      .then(res => {
        const data = res.data;
        if (data) {
          setBio(data.bio || "");
          setPhoneNumber(data.phoneNumber || "");
          setBirthDate(data.birthDate || "");
          setCity(data.city || "");
          setCountry(data.country || "");
          setInstagramLink(data.instagramLink || "");
          setFacebookLink(data.facebookLink || "");
          setWebsiteLink(data.websiteLink || "");
          setGender(data.gender || "");
          setThemePreference(data.themePreference || "SYSTEM");
          setNotificationsEnabled(data.notificationsEnabled ?? true);
        }
      })
      .catch(err => {
        console.error("Failed to load profile details", err);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    try {
      await api.put("/users/profile", {
        name,
        bio,
        phoneNumber,
        birthDate,
        city,
        country,
        instagramLink,
        facebookLink,
        websiteLink,
        gender,
        themePreference,
        notificationsEnabled
      });
      
      await refreshUser();
      showToast("success", "Perfil salvo com sucesso!");
      
      navigate("/trips", { replace: true });
    } catch (err) {
      showToast("error", getApiErrorMessage(err) || "Erro ao salvar perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    setUploadingImage(true);
    try {
      // Converter para Base64 para persistência real no banco
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const base64Data = await base64Promise;

      await api.put("/users/profile/image", JSON.stringify(base64Data), {
        headers: { "Content-Type": "application/json" }
      });
      
      await refreshUser();
      showToast("success", "Foto de perfil atualizada!");
    } catch (err) {
      console.error(err);
      showToast("error", "Erro ao atualizar foto de perfil");
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <Loader2 className="animate-spin" size={32} color={ui.colors.primary[500]} />
      </div>
    );
  }

  // Fallback styling for Avatar (Premium glassmorphism dynamic)
  const getAvatarGradient = () => {
    if (gender === "MALE") return "linear-gradient(135deg, #3b82f6, #1d4ed8)";
    if (gender === "FEMALE") return "linear-gradient(135deg, #ec4899, #be185d)";
    return "linear-gradient(135deg, #f59e0b, #ea580c)";
  };

  return (
    <div className="fade-in" style={{
      maxWidth: 800,
      margin: "0 auto",
      padding: ui.space.xl,
      background: "var(--bg-default)",
      minHeight: "100vh"
    }}>
      
      <div className="slide-up" style={{ textAlign: "center", marginBottom: ui.space.xl }}>
        <h1 style={{ fontSize: ui.typography.fontSize["3xl"], fontWeight: ui.typography.fontWeight.bold, color: "var(--text-primary)", margin: 0 }}>
          {isSetupMode ? "Complete Seu Perfil" : "Meu Perfil"}
        </h1>
        <p style={{ color: "var(--text-secondary)", marginTop: ui.space.sm }}>
          {isSetupMode ? "Antes de começar a explorar, conte-nos um pouco sobre você." : "Gerencie suas informações pessoais e preferências."}
        </p>
      </div>

      <form onSubmit={handleSave} className="slide-up" style={{ animationDelay: "100ms" }}>
        {/* Avatar Section */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", marginBottom: ui.space.xl, padding: ui.space.lg,
          background: "var(--bg-surface)", borderRadius: ui.radius.xl, border: "1px solid var(--border-color)",
          boxShadow: ui.shadows.sm
        }}>
          <div style={{ position: "relative" }}>
            <div style={{
              width: 120, height: 120, borderRadius: "50%",
              background: user?.profileImage ? `url(${user.profileImage}) center/cover` : getAvatarGradient(),
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
              color: "white", fontSize: 40, fontWeight: "bold", textTransform: "uppercase"
            }}>
              {!user?.profileImage && (name ? name.charAt(0) : <User size={48} />)}
            </div>
            
            <label style={{
              position: "absolute", bottom: 0, right: 0,
              background: ui.colors.primary[500], color: "white",
              width: 36, height: 36, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", boxShadow: ui.shadows.md,
              transition: "transform 0.2s"
            }}>
              {uploadingImage ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
            </label>
          </div>
          <h2 style={{ marginTop: ui.space.md, marginBottom: 0, color: "var(--text-primary)" }}>{name}</h2>
          <span style={{ color: "var(--text-secondary)", fontSize: ui.typography.fontSize.sm }}>{user?.email}</span>
        </div>

        {/* Info Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ui.space.lg, marginBottom: ui.space.xl }}>
          
          {/* Col 1 */}
          <div style={{ display: "flex", flexDirection: "column", gap: ui.space.md }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, color: "var(--text-secondary)", fontSize: ui.typography.fontSize.sm }}>
              Nome Completo
              <div style={{ position: "relative" }}>
                <User size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--icon-color)" }} />
                <input required value={name} onChange={e => setName(e.target.value)} style={{ ...inputSurfaceStyle(), paddingLeft: 38 }} />
              </div>
            </label>
            
            <label style={{ display: "flex", flexDirection: "column", gap: 4, color: "var(--text-secondary)", fontSize: ui.typography.fontSize.sm }}>
              Data de Nascimento
              <div style={{ position: "relative" }}>
                <Calendar size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--icon-color)" }} />
                <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} style={{ ...inputSurfaceStyle(), paddingLeft: 38 }} />
              </div>
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 4, color: "var(--text-secondary)", fontSize: ui.typography.fontSize.sm }}>
              Gênero
              <select value={gender} onChange={e => setGender(e.target.value)} style={inputSurfaceStyle()}>
                <option value="">Prefiro não informar</option>
                <option value="MALE">Masculino</option>
                <option value="FEMALE">Feminino</option>
                <option value="OTHER">Outro</option>
              </select>
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 4, color: "var(--text-secondary)", fontSize: ui.typography.fontSize.sm }}>
              Cidade
              <div style={{ position: "relative" }}>
                <MapPin size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--icon-color)" }} />
                <input placeholder="Sua cidade atual" value={city} onChange={e => setCity(e.target.value)} style={{ ...inputSurfaceStyle(), paddingLeft: 38 }} />
              </div>
            </label>
          </div>

          {/* Col 2 */}
          <div style={{ display: "flex", flexDirection: "column", gap: ui.space.md }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, color: "var(--text-secondary)", fontSize: ui.typography.fontSize.sm }}>
              Biografia Curta
              <textarea placeholder="Fale um pouco sobre você e suas viagens..." value={bio} onChange={e => setBio(e.target.value)} rows={3} style={{ ...inputSurfaceStyle(), resize: "none" }} />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 4, color: "var(--text-secondary)", fontSize: ui.typography.fontSize.sm }}>
              Celular
              <div style={{ position: "relative" }}>
                <Phone size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--icon-color)" }} />
                <input placeholder="+55 11 99999-9999" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} style={{ ...inputSurfaceStyle(), paddingLeft: 38 }} />
              </div>
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 4, color: "var(--text-secondary)", fontSize: ui.typography.fontSize.sm }}>
              País
              <div style={{ position: "relative" }}>
                <Globe size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--icon-color)" }} />
                <input placeholder="Brasil" value={country} onChange={e => setCountry(e.target.value)} style={{ ...inputSurfaceStyle(), paddingLeft: 38 }} />
              </div>
            </label>
          </div>

        </div>

        {/* Social Links */}
        <div style={{
          padding: ui.space.lg, background: "var(--bg-surface)", borderRadius: ui.radius.xl,
          border: "1px solid var(--border-color)", marginBottom: ui.space.xl
        }}>
          <h3 style={{ margin: "0 0 16px 0", color: "var(--text-primary)" }}>Redes Sociais</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ui.space.md }}>
            <div style={{ position: "relative" }}>
              <Instagram size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#E1306C" }} />
              <input placeholder="@instagram" value={instagramLink} onChange={e => setInstagramLink(e.target.value)} style={{ ...inputSurfaceStyle(), paddingLeft: 38 }} />
            </div>
            <div style={{ position: "relative" }}>
              <Facebook size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#1877F2" }} />
              <input placeholder="/facebook" value={facebookLink} onChange={e => setFacebookLink(e.target.value)} style={{ ...inputSurfaceStyle(), paddingLeft: 38 }} />
            </div>
            <div style={{ position: "relative", gridColumn: "span 2" }}>
              <Globe size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--icon-color)" }} />
              <input placeholder="https://seu-site.com" value={websiteLink} onChange={e => setWebsiteLink(e.target.value)} style={{ ...inputSurfaceStyle(), paddingLeft: 38 }} />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: ui.space.md }}>
          {!isSetupMode && (
            <button type="button" onClick={() => navigate("/trips")} style={{ ...secondaryButtonStyle(), cursor: "pointer" }}>
              Cancelar
            </button>
          )}
          <button type="submit" disabled={saving} style={{ ...primaryButtonStyle(), cursor: "pointer", display: "flex", alignItems: "center", gap: 8, opacity: saving ? 0.7 : 1 }}>
            {saving ? <Loader2 className="animate-spin" size={20} /> : (isSetupMode ? "Começar Agora" : "Salvar Alterações")}
            {isSetupMode && !saving && <ArrowRight size={20} />}
          </button>
        </div>
      </form>
    </div>
  );
}
