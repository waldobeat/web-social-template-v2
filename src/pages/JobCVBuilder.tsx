import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ref, get, set } from 'firebase/database';
import { db } from '../lib/firebase';
import { useAuthContext } from '../lib/AuthContext';
import Navbar from '../components/Navbar';
import { compressImage } from '../utils/compressImage';
import {
  VENEZUELA_STATES,
  type CandidateCV,
  type CandidateWorkExperience,
  type CandidateEducation
} from '../types/jobs';
import {
  User, ShieldCheck, Camera, Plus, Trash2,
  Briefcase, GraduationCap, Sparkles, CheckCircle2,
  ArrowLeft, Phone, MapPin, Eye, FileText
} from 'lucide-react';

export default function JobCVBuilder() {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [title, setTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Venezuela');
  const [state, setState] = useState('Carabobo');
  const [city, setCity] = useState('');
  const [addressSummary, setAddressSummary] = useState('');
  const [summary, setSummary] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Skills / Aptitudes
  const [skills, setSkills] = useState<string[]>([
    'Responsabilidad',
    'Trabajo en equipo',
    'Puntualidad'
  ]);
  const [newSkill, setNewSkill] = useState('');

  // Experience
  const [experience, setExperience] = useState<CandidateWorkExperience[]>([]);
  // Education
  const [education, setEducation] = useState<CandidateEducation[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing CV
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadCV = async () => {
      try {
        const cvSnap = await get(ref(db, `candidateCVs/${user.uid}`));
        if (cvSnap.exists()) {
          const data: CandidateCV = cvSnap.val();
          setFirstName(data.firstName || '');
          setLastName(data.lastName || '');
          setTitle(data.title || '');
          setPhone(data.phone || '');
          setCountry(data.country || 'Venezuela');
          setState(data.state || 'Carabobo');
          setCity(data.city || '');
          setAddressSummary(data.addressSummary || '');
          setSummary(data.summary || '');
          setPhotoUrl(data.photoUrl || '');
          setSkills(data.skills || []);
          setExperience(data.experience || []);
          setEducation(data.education || []);
        } else {
          // Pre-populate with auth info if available
          const nameParts = (user.displayName || '').split(' ');
          setFirstName(nameParts[0] || '');
          setLastName(nameParts.slice(1).join(' ') || '');
          if (user.photoURL) setPhotoUrl(user.photoURL);
        }
      } catch (err) {
        console.error('Error cargando CV:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCV();
  }, [user]);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      const compressed = await compressImage(file, 400, 0.8);
      setPhotoUrl(compressed);
    } catch (err) {
      console.error('Error comprimiendo foto:', err);
      alert('Hubo un error al procesar la foto.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    if (!skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddExperience = () => {
    const newExp: CandidateWorkExperience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    };
    setExperience([...experience, newExp]);
  };

  const handleUpdateExperience = (
    id: string,
    field: keyof CandidateWorkExperience,
    val: any
  ) => {
    setExperience(
      experience.map((exp) => (exp.id === id ? { ...exp, [field]: val } : exp))
    );
  };

  const handleRemoveExperience = (id: string) => {
    setExperience(experience.filter((exp) => exp.id !== id));
  };

  const handleAddEducation = () => {
    const newEdu: CandidateEducation = {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      startDate: '',
      endDate: '',
      current: false
    };
    setEducation([...education, newEdu]);
  };

  const handleUpdateEducation = (
    id: string,
    field: keyof CandidateEducation,
    val: any
  ) => {
    setEducation(
      education.map((edu) => (edu.id === id ? { ...edu, [field]: val } : edu))
    );
  };

  const handleRemoveEducation = (id: string) => {
    setEducation(education.filter((edu) => edu.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Debes iniciar sesión para guardar tu currículum.');
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      alert('Por favor ingresa tu nombre y apellido.');
      return;
    }

    if (!phone.trim()) {
      alert('Por favor ingresa tu número de teléfono para que las empresas puedan contactarte.');
      return;
    }

    setSaving(true);
    try {
      const cvData: CandidateCV = {
        userId: user.uid,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        photoUrl: photoUrl || '',
        title: title.trim() || 'Profesional / Especialista',
        phone: phone.trim(),
        country,
        state,
        city: city.trim(),
        addressSummary: addressSummary.trim(),
        skills,
        summary: summary.trim(),
        experience,
        education,
        updatedAt: Date.now()
      };

      await set(ref(db, `candidateCVs/${user.uid}`), cvData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error('Error guardando CV:', err);
      alert('Ocurrió un error al guardar tu CV. Intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-[#070707] text-white">
        <Navbar />
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neon-pink/10 text-neon-pink">
            <User className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold">Inicia sesión para crear tu Currículum</h2>
          <p className="mt-2 text-sm text-gray-400">
            Regístrate o inicia sesión en Sheddit para crear tu perfil laboral y postularte a cientos de vacantes.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/"
              className="rounded-xl bg-neon-pink px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-neon-pink/20 transition-all hover:bg-neon-pink/80"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070707] text-gray-100">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Navigation & Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/empleos')}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-300 transition-all hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver a Empleos
            </button>
            <h1 className="text-xl md:text-2xl font-black text-white">
              Mi Currículum Profesional
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-gray-200 transition-all hover:bg-white/10"
            >
              <Eye className="h-4 w-4 text-neon-pink" />
              {showPreview ? 'Ocultar Vista Previa' : 'Ver Cómo me Ven las Empresas'}
            </button>
          </div>
        </div>

        {/* Confidentiality Privacy Banner */}
        <div className="mb-8 rounded-2xl border border-emerald-500/25 bg-gradient-to-r from-emerald-950/30 via-emerald-900/10 to-transparent p-4 sm:p-5">
          <div className="flex items-start gap-3.5">
            <div className="rounded-xl bg-emerald-500/15 p-2 text-emerald-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-emerald-300">
                Garantía de Confidencialidad y Privacidad Total Sheddit
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-gray-300">
                Tus datos sensibles están 100% protegidos. <strong className="text-white">Las empresas verificadas SOLO podrán visualizar:</strong> tu foto, nombre, apellido, teléfono, dirección aproximada, título profesional y aptitudes. <span className="text-emerald-400 font-medium">Jamás verán tu cédula de identidad, DNI ni datos que puedan perjudicarte o comprometer tu seguridad.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Live Preview Mode */}
        {showPreview && (
          <div className="mb-8 rounded-2xl border border-neon-pink/30 bg-[#0e0e0e] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <span className="flex items-center gap-2 text-xs font-bold text-neon-pink uppercase tracking-wider">
                <Eye className="h-4 w-4" /> Vista Previa: Perfil Seguro para Reclutadores
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                🔒 DNI/Cédula Protegidos
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <div className="relative h-20 w-20 flex-shrink-0 rounded-2xl border border-white/15 bg-white/5 overflow-hidden flex items-center justify-center">
                {photoUrl ? (
                  <img src={photoUrl} alt="Foto perfil" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-gray-600" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">
                  {firstName || 'Nombre'} {lastName || 'Apellido'}
                </h3>
                <p className="text-sm font-medium text-neon-pink">
                  {title || 'Título profesional no especificado'}
                </p>
                <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-gray-500" />
                    {phone || 'Sin teléfono configurado'}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-gray-500" />
                    {city ? `${city}, ` : ''}{state}, {country}
                  </span>
                </div>
              </div>
            </div>

            {summary && (
              <div className="mt-5 border-t border-white/5 pt-4">
                <h4 className="text-xs font-bold uppercase text-gray-400">Resumen</h4>
                <p className="mt-1 text-xs text-gray-300 leading-relaxed">{summary}</p>
              </div>
            )}

            {skills.length > 0 && (
              <div className="mt-5 border-t border-white/5 pt-4">
                <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">Aptitudes y Actitudes</h4>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-neon-pink/15 px-2.5 py-1 text-xs font-medium text-neon-pink"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CV Builder Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Photo and Basic Info */}
          <div className="rounded-2xl border border-white/8 bg-[#0b0b0b] p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-base font-bold text-white mb-5">
              <User className="h-5 w-5 text-neon-pink" /> Información Personal de Contacto
            </h2>

            <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
              <div className="relative group">
                <div className="h-24 w-24 rounded-2xl border border-white/15 bg-white/5 overflow-hidden flex items-center justify-center">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Foto de perfil" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-10 w-10 text-gray-600" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="absolute -bottom-2 -right-2 rounded-xl bg-neon-pink p-2 text-white shadow-md hover:bg-neon-pink/80 transition-all"
                  title="Cambiar foto de perfil"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white">Foto de Perfil Profesional</h3>
                <p className="mt-0.5 text-xs text-gray-400">
                  Sube una foto clara y presentable. La compresión es automática y gratuita.
                </p>
                {photoUrl && (
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    className="mt-2 text-xs font-medium text-red-400 hover:underline"
                  >
                    Eliminar foto
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Nombres *
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ej: Carlos Eduardo"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-neon-pink transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Apellidos *
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ej: Pérez Rodríguez"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-neon-pink transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Título Profesional / Cargo de Interés *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Desarrollador Web Frontend / Contador / Asesor de Ventas"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-neon-pink transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Teléfono de Contacto / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej: +58 412 1234567"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-neon-pink transition-all"
                />
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  País de Residencia
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#141414] px-3.5 py-2.5 text-sm text-white outline-none focus:border-neon-pink transition-all"
                >
                  <option value="Venezuela">Venezuela</option>
                  <option value="Colombia">Colombia</option>
                  <option value="México">México</option>
                  <option value="Argentina">Argentina</option>
                  <option value="Chile">Chile</option>
                  <option value="España">España</option>
                  <option value="Estados Unidos">Estados Unidos</option>
                  <option value="Otro">Otro país</option>
                </select>
              </div>

              {country === 'Venezuela' ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Estado (Venezuela) *
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#141414] px-3.5 py-2.5 text-sm text-white outline-none focus:border-neon-pink transition-all"
                  >
                    {VENEZUELA_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Provincia / Estado / Región
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Ej: Buenos Aires, Cundinamarca..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none focus:border-neon-pink transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Ciudad / Municipio
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ej: Valencia, Maracay, Caracas..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-neon-pink transition-all"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Dirección referencial (Segura)
              </label>
              <input
                type="text"
                value={addressSummary}
                onChange={(e) => setAddressSummary(e.target.value)}
                placeholder="Ej: Urb. El Recreo, Zona Norte (No requieres colocar dirección exacta número de casa)"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-neon-pink transition-all"
              />
            </div>
          </div>

          {/* Section 2: Summary */}
          <div className="rounded-2xl border border-white/8 bg-[#0b0b0b] p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-base font-bold text-white mb-2">
              <FileText className="h-5 w-5 text-neon-pink" /> Resumen Profesional
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              Breve descripción de tu trayectoria, especialidad y lo que puedes aportar a la empresa.
            </p>
            <textarea
              rows={4}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Ej: Profesional con más de 3 años de experiencia en desarrollo web y gestión de proyectos. Enfocado en soluciones de alto impacto y optimización de flujos de trabajo..."
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3.5 text-sm text-white placeholder-gray-600 outline-none focus:border-neon-pink transition-all resize-none"
            />
          </div>

          {/* Section 3: Skills / Aptitudes / Actitudes */}
          <div className="rounded-2xl border border-white/8 bg-[#0b0b0b] p-5 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="flex items-center gap-2 text-base font-bold text-white">
                <Sparkles className="h-5 w-5 text-neon-pink" /> Aptitudes y Actitudes
              </h2>
              <span className="text-xs text-gray-500">{skills.length} agregadas</span>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Agrega tus habilidades técnicas, actitudes clave (puntualidad, proactividad, liderazgo) y herramientas que dominas.
            </p>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill(e);
                  }
                }}
                placeholder="Escribe una actitud o habilidad (ej: Proactivo, Excel, React, Ventas) y presiona Enter"
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-neon-pink transition-all"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="rounded-xl bg-neon-pink px-4 py-2.5 text-xs font-bold text-white hover:bg-neon-pink/80 transition-all flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" /> Agregar
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {skills.map((s, idx) => (
                <span
                  key={idx}
                  className="flex items-center gap-1.5 rounded-lg border border-neon-pink/30 bg-neon-pink/10 px-3 py-1.5 text-xs font-medium text-neon-pink"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(s)}
                    className="hover:text-red-400 transition-colors ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Section 4: Work Experience */}
          <div className="rounded-2xl border border-white/8 bg-[#0b0b0b] p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="flex items-center gap-2 text-base font-bold text-white">
                  <Briefcase className="h-5 w-5 text-neon-pink" /> Experiencia Laboral
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Tus empleos anteriores o proyectos destacados.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddExperience}
                className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10 transition-all"
              >
                <Plus className="h-3.5 w-3.5 text-neon-pink" /> Agregar Empleo
              </button>
            </div>

            {experience.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-xs text-gray-500">
                No has agregado experiencias laborales aún. Haz clic en "Agregar Empleo" si deseas incluir tu historial.
              </div>
            ) : (
              <div className="space-y-4">
                {experience.map((exp) => (
                  <div
                    key={exp.id}
                    className="relative rounded-xl border border-white/10 bg-white/2 p-4 transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(exp.id)}
                      className="absolute top-3 right-3 text-gray-500 hover:text-red-400 transition-colors p-1"
                      title="Eliminar experiencia"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 pr-8">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                          Cargo / Puesto
                        </label>
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) =>
                            handleUpdateExperience(exp.id, 'position', e.target.value)
                          }
                          placeholder="Ej: Supervisor de Ventas"
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none focus:border-neon-pink"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                          Empresa
                        </label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) =>
                            handleUpdateExperience(exp.id, 'company', e.target.value)
                          }
                          placeholder="Ej: Distribuidora Los Andes C.A."
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none focus:border-neon-pink"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                          Fecha Inicio
                        </label>
                        <input
                          type="text"
                          value={exp.startDate}
                          onChange={(e) =>
                            handleUpdateExperience(exp.id, 'startDate', e.target.value)
                          }
                          placeholder="Ej: Enero 2021"
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none focus:border-neon-pink"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                          Fecha Fin o Actual
                        </label>
                        <input
                          type="text"
                          value={exp.endDate}
                          onChange={(e) =>
                            handleUpdateExperience(exp.id, 'endDate', e.target.value)
                          }
                          placeholder="Ej: Presente / Diciembre 2023"
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none focus:border-neon-pink"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                        Descripción de Funciones y Logros
                      </label>
                      <textarea
                        rows={2}
                        value={exp.description}
                        onChange={(e) =>
                          handleUpdateExperience(exp.id, 'description', e.target.value)
                        }
                        placeholder="Logros principales, funciones clave desempeñadas..."
                        className="w-full rounded-lg border border-white/10 bg-white/5 p-2.5 text-xs text-white outline-none focus:border-neon-pink resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 5: Education */}
          <div className="rounded-2xl border border-white/8 bg-[#0b0b0b] p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="flex items-center gap-2 text-base font-bold text-white">
                  <GraduationCap className="h-5 w-5 text-neon-pink" /> Educación y Estudios
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Carreras universitarias, cursos, diplomados o certificaciones.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddEducation}
                className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10 transition-all"
              >
                <Plus className="h-3.5 w-3.5 text-neon-pink" /> Agregar Estudio
              </button>
            </div>

            {education.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-xs text-gray-500">
                No has agregado estudios aún. Haz clic en "Agregar Estudio" si deseas detallar tu formación académica.
              </div>
            ) : (
              <div className="space-y-4">
                {education.map((edu) => (
                  <div
                    key={edu.id}
                    className="relative rounded-xl border border-white/10 bg-white/2 p-4 transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(edu.id)}
                      className="absolute top-3 right-3 text-gray-500 hover:text-red-400 transition-colors p-1"
                      title="Eliminar estudio"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 pr-8">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                          Título / Carrera / Certificación
                        </label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) =>
                            handleUpdateEducation(edu.id, 'degree', e.target.value)
                          }
                          placeholder="Ej: TSU en Informática / Lic. en Administración"
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none focus:border-neon-pink"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                          Institución / Universidad
                        </label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) =>
                            handleUpdateEducation(edu.id, 'institution', e.target.value)
                          }
                          placeholder="Ej: Universidad de Carabobo"
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none focus:border-neon-pink"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                          Año de Inicio / Fin
                        </label>
                        <input
                          type="text"
                          value={edu.startDate}
                          onChange={(e) =>
                            handleUpdateEducation(edu.id, 'startDate', e.target.value)
                          }
                          placeholder="Ej: 2018 - 2022"
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none focus:border-neon-pink"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0e0e0e] p-5">
            <div className="flex items-center gap-2">
              {savedSuccess && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" /> ¡Currículum guardado con éxito!
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => navigate('/empleos')}
                className="w-1/2 sm:w-auto rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-semibold text-gray-300 hover:bg-white/10 transition-all text-center"
              >
                Volver
              </button>
              <button
                type="submit"
                disabled={saving}
                className="w-1/2 sm:w-auto rounded-xl bg-neon-pink px-7 py-2.5 text-xs font-bold text-white shadow-lg shadow-neon-pink/25 hover:bg-neon-pink/80 transition-all disabled:opacity-50 text-center flex items-center justify-center gap-2"
              >
                {saving ? 'Guardando...' : 'Guardar Mi Currículum'}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
