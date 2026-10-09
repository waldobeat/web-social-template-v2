import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ref, get, set, update, push, remove } from 'firebase/database';
import { db } from '../lib/firebase';
import { useAuthContext } from '../lib/AuthContext';
import Navbar from '../components/Navbar';
import { compressImage } from '../utils/compressImage';
import {
  VENEZUELA_STATES,
  REMOTE_COUNTRIES,
  JOB_CATEGORIES,
  type JobAd,
  type JobModality,
  type JobType,
  type CompanyRequest,
  type JobApplication
} from '../types/jobs';
import {
  Building2, Plus, Trash2, ArrowLeft,
  CheckCircle2, Clock, ShieldCheck,
  MapPin, Globe, Phone, FileCheck,
  PauseCircle, PlayCircle, Eye, Users
} from 'lucide-react';

export default function CompanyPortal() {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'jobs' | 'create' | 'applicants'>('jobs');

  // Company status
  const [companyReq, setCompanyReq] = useState<CompanyRequest | null>(null);
  const [companyApproved, setCompanyApproved] = useState(false);

  // Form: Company Request
  const [companyName, setCompanyName] = useState('');
  const [rif, setRif] = useState('');
  const [repName, setRepName] = useState('');
  const [corpPhone, setCorpPhone] = useState('');
  const [corpEmail, setCorpEmail] = useState('');
  const [sector, setSector] = useState<string>(JOB_CATEGORIES[0]);
  const [website, setWebsite] = useState('');
  const [letter, setLetter] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [submittingReq, setSubmittingReq] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Form: Job Creation
  const [jobTitle, setJobTitle] = useState('');
  const [jobCategory, setJobCategory] = useState<string>(JOB_CATEGORIES[0]);
  const [jobModality, setJobModality] = useState<JobModality>('presencial');
  const [venezuelaState, setVenezuelaState] = useState<string>('Carabobo');
  const [jobCity, setJobCity] = useState('');
  const [remoteCountry, setRemoteCountry] = useState<string>(REMOTE_COUNTRIES[0]);
  const [jobType, setJobType] = useState<JobType>('full-time');
  const [salary, setSalary] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState<string[]>(['Experiencia comprobable']);
  const [newRequirement, setNewRequirement] = useState('');
  const [benefits, setBenefits] = useState<string[]>([]);
  const [newBenefit, setNewBenefit] = useState('');
  const [publishingJob, setPublishingJob] = useState(false);
  const [jobCreatedSuccess, setJobCreatedSuccess] = useState(false);

  // My Jobs & Applicants
  const [myJobs, setMyJobs] = useState<JobAd[]>([]);
  const [applicants, setApplicants] = useState<JobApplication[]>([]);
  const [selectedApplicant, setSelectedApplicant] = useState<JobApplication | null>(null);
  const [selectedJobForFilter, setSelectedJobForFilter] = useState<string>('all');

  // Load Company Data & Jobs
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const compSnap = await get(ref(db, `companyRequests/${user.uid}`));
        if (compSnap.exists()) {
          const cData: CompanyRequest = compSnap.val();
          setCompanyReq(cData);
          setCompanyApproved(cData.status === 'approved');

          if (cData.status === 'approved') {
            // Load company jobs
            const jobsSnap = await get(ref(db, 'jobs'));
            if (jobsSnap.exists()) {
              const allJobs = jobsSnap.val();
              const list: JobAd[] = Object.entries(allJobs)
                .map(([id, val]: [string, any]) => ({ id, ...val }))
                .filter((j) => j.companyId === user.uid);
              list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
              setMyJobs(list);
            }

            // Load applications
            const appSnap = await get(ref(db, 'jobApplications'));
            if (appSnap.exists()) {
              const allApps = appSnap.val();
              const appList: JobApplication[] = Object.entries(allApps)
                .map(([id, val]: [string, any]) => ({ id, ...val }))
                .filter((a) => a.companyId === user.uid);
              appList.sort((a, b) => (b.appliedAt || 0) - (a.appliedAt || 0));
              setApplicants(appList);
            }
          }
        }
      } catch (err) {
        console.error('Error cargando datos de empresa:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Handle Logo Upload
  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 300, 0.8);
      setLogoUrl(compressed);
    } catch (err) {
      alert('Error procesando el logo');
    }
  };

  // Submit Company Application Letter
  const handleSubmitCompanyRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!companyName.trim() || !rif.trim() || !letter.trim()) {
      alert('Por favor completa todos los campos requeridos y redacta tu carta de solicitud para Sheddit.');
      return;
    }

    setSubmittingReq(true);
    try {
      const newReq: CompanyRequest = {
        id: user.uid,
        ownerUid: user.uid,
        ownerEmail: user.email || '',
        name: companyName.trim(),
        rif: rif.trim().toUpperCase(),
        legalRepresentative: repName.trim() || user.displayName || 'Representante',
        phone: corpPhone.trim(),
        email: corpEmail.trim() || user.email || '',
        sector,
        website: website.trim(),
        requestLetter: letter.trim(),
        logo: logoUrl || '',
        status: 'pending',
        createdAt: Date.now()
      };

      await set(ref(db, `companyRequests/${user.uid}`), newReq);
      setCompanyReq(newReq);
      setCompanyApproved(false);
    } catch (err) {
      console.error('Error enviando solicitud:', err);
      alert('Error al enviar la solicitud. Intenta de nuevo.');
    } finally {
      setSubmittingReq(false);
    }
  };

  // Instant Approval (For demo/owner testing or fast verification)
  const handleApproveCompany = async () => {
    if (!user || !companyReq) return;
    try {
      await update(ref(db, `companyRequests/${user.uid}`), {
        status: 'approved',
        reviewedAt: Date.now(),
        reviewNotes: 'Aprobada formalmente por el equipo de Sheddit'
      });
      setCompanyReq({ ...companyReq, status: 'approved' });
      setCompanyApproved(true);
    } catch (err) {
      console.error('Error aprobando empresa:', err);
    }
  };

  // Add Requirement
  const handleAddRequirement = () => {
    const val = newRequirement.trim();
    if (!val) return;
    setRequirements([...requirements, val]);
    setNewRequirement('');
  };

  // Add Benefit
  const handleAddBenefit = () => {
    const val = newBenefit.trim();
    if (!val) return;
    setBenefits([...benefits, val]);
    setNewBenefit('');
  };

  // Create Job Ad
  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !companyReq) return;
    if (!jobTitle.trim() || !description.trim()) {
      alert('Por favor completa el título y la descripción del puesto.');
      return;
    }

    setPublishingJob(true);
    try {
      const jobsRef = ref(db, 'jobs');
      const newJobRef = push(jobsRef);
      const newJobId = newJobRef.key!;

      const newJob: JobAd = {
        id: newJobId,
        companyId: user.uid,
        companyName: companyReq.name,
        companyLogo: companyReq.logo,
        companyVerified: true,
        title: jobTitle.trim(),
        category: jobCategory,
        modality: jobModality,
        venezuelaState: jobModality === 'remoto' ? undefined : venezuelaState,
        city: jobCity.trim(),
        remoteCountry: jobModality === 'remoto' ? remoteCountry : undefined,
        jobType,
        salary: salary.trim() || 'A convenir',
        description: description.trim(),
        requirements: requirements.filter(Boolean),
        benefits: benefits.filter(Boolean),
        createdAt: Date.now(),
        status: 'active',
        applicantCount: 0
      };

      await set(newJobRef, newJob);
      setMyJobs([newJob, ...myJobs]);
      setJobCreatedSuccess(true);

      // Reset form
      setJobTitle('');
      setDescription('');
      setSalary('');
      setJobCity('');
      setRequirements(['Experiencia comprobable']);
      setBenefits([]);

      setTimeout(() => {
        setJobCreatedSuccess(false);
        setActiveTab('jobs');
      }, 1500);
    } catch (err) {
      console.error('Error publicando empleo:', err);
      alert('Error al publicar la vacante.');
    } finally {
      setPublishingJob(false);
    }
  };

  // Toggle Pause/Active job
  const handleToggleJobStatus = async (job: JobAd) => {
    const newStatus = job.status === 'active' ? 'paused' : 'active';
    try {
      await update(ref(db, `jobs/${job.id}`), { status: newStatus });
      setMyJobs(myJobs.map((j) => (j.id === job.id ? { ...j, status: newStatus } : j)));
    } catch (err) {
      console.error('Error cambiando estado:', err);
    }
  };

  // Delete Job
  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este anuncio de empleo?')) return;
    try {
      await remove(ref(db, `jobs/${jobId}`));
      setMyJobs(myJobs.filter((j) => j.id !== jobId));
    } catch (err) {
      console.error('Error eliminando empleo:', err);
    }
  };

  // Update Applicant Status
  const handleUpdateApplicantStatus = async (
    appId: string,
    newStatus: JobApplication['status']
  ) => {
    try {
      await update(ref(db, `jobApplications/${appId}`), { status: newStatus });
      setApplicants(
        applicants.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );
      if (selectedApplicant && selectedApplicant.id === appId) {
        setSelectedApplicant({ ...selectedApplicant, status: newStatus });
      }
    } catch (err) {
      console.error('Error actualizando estado del candidato:', err);
    }
  };

  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-[#070707] text-white">
        <Navbar />
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neon-pink/10 text-neon-pink">
            <Building2 className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold">Portal de Empresas SHEDDIT</h2>
          <p className="mt-2 text-sm text-gray-400">
            Inicia sesión o regístrate para solicitar el acceso corporativo y publicar tus ofertas de empleo.
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="rounded-xl bg-neon-pink px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-neon-pink/20 hover:bg-neon-pink/80 transition-all"
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

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Top Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/empleos')}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-300 transition-all hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Ver Portal de Empleos
            </button>
            <h1 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
              <Building2 className="h-6 w-6 text-neon-pink" />
              Portal Corporativo para Empresas
            </h1>
          </div>

          {companyApproved && (
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
              <ShieldCheck className="h-4 w-4" /> Empresa Verificada Sheddit
            </span>
          )}
        </div>

        {/* STEP 1: Not registered yet -> Show Application Letter form */}
        {!companyReq && !loading && (
          <div className="mx-auto max-w-3xl">
            {/* Banner */}
            <div className="mb-6 rounded-2xl border border-neon-pink/30 bg-gradient-to-r from-neon-pink/15 via-[#120a10] to-[#0d0d0d] p-6">
              <span className="inline-block rounded-full bg-neon-pink/20 px-3 py-1 text-xs font-bold text-neon-pink mb-2">
                Paso 1: Solicitud de Validación
              </span>
              <h2 className="text-lg md:text-xl font-bold text-white">
                Envía tu Carta de Solicitud de Registro a SHEDDIT
              </h2>
              <p className="mt-1.5 text-xs text-gray-300 leading-relaxed">
                Para mantener la máxima confiabilidad, evitar ofertas engañosas y salvaguardar a nuestros talentos, las empresas interesadas en reclutar deben remitir primero su carta de solicitud. Una vez evaluada por el equipo directivo de Sheddit, se autorizará tu consola de publicación.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitCompanyRequest} className="space-y-6 rounded-2xl border border-white/8 bg-[#0b0b0b] p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center gap-5 pb-4 border-b border-white/8">
                <div className="relative">
                  <div className="h-20 w-20 rounded-2xl border border-white/15 bg-white/5 overflow-hidden flex items-center justify-center">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo de empresa" className="h-full w-full object-cover" />
                    ) : (
                      <Building2 className="h-9 w-9 text-gray-600" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 rounded-lg bg-neon-pink p-1.5 text-white hover:bg-neon-pink/80"
                    title="Subir logo"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoSelect}
                    className="hidden"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Logo de la Empresa (Opcional)</h3>
                  <p className="text-xs text-gray-400">Aparecerá en los anuncios de tus vacantes para generar confianza.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Nombre o Razón Social de la Empresa *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ej: Inversiones Global Tech C.A."
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-neon-pink"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    RIF o Registro Fiscal Comercial *
                  </label>
                  <input
                    type="text"
                    required
                    value={rif}
                    onChange={(e) => setRif(e.target.value)}
                    placeholder="Ej: J-12345678-9"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-neon-pink uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Representante Legal / Encargado de Talento *
                  </label>
                  <input
                    type="text"
                    required
                    value={repName}
                    onChange={(e) => setRepName(e.target.value)}
                    placeholder="Ej: Lic. Mariana Castillo"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-neon-pink"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Teléfono Corporativo *
                  </label>
                  <input
                    type="tel"
                    required
                    value={corpPhone}
                    onChange={(e) => setCorpPhone(e.target.value)}
                    placeholder="Ej: +58 414 9876543 / 0241-1234567"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-neon-pink"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Correo Institucional de Reclutamiento *
                  </label>
                  <input
                    type="email"
                    required
                    value={corpEmail}
                    onChange={(e) => setCorpEmail(e.target.value)}
                    placeholder="rrhh@tuempresa.com"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-neon-pink"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Sector / Industria Principal
                  </label>
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#141414] px-3.5 py-2.5 text-sm text-white outline-none focus:border-neon-pink"
                  >
                    {JOB_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Sitio Web o Red Social (Opcional)
                </label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://tuempresa.com o @empresa_ve"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-neon-pink"
                />
              </div>

              {/* Solicitud formal / Carta para Sheddit */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-white">
                    Carta de Solicitud Dirigida a SHEDDIT *
                  </label>
                  <span className="text-[11px] text-neon-pink font-semibold">Exposición de motivos</span>
                </div>
                <textarea
                  required
                  rows={5}
                  value={letter}
                  onChange={(e) => setLetter(e.target.value)}
                  placeholder="Estimado equipo directivo de SHEDDIT: Por medio de la presente, la empresa Inversiones Global Tech C.A. solicita formalmente la habilitación de cuenta corporativa para reclutamiento de personal calificado. Declaramos cumplir con todas las leyes laborales vigentes..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white placeholder-gray-600 outline-none focus:border-neon-pink transition-all resize-none font-mono text-xs leading-relaxed"
                />
                <p className="mt-1 text-[11px] text-gray-400">
                  Explica brevemente tu empresa y el tipo de personal que buscas reclutar en la plataforma.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submittingReq}
                  className="rounded-xl bg-neon-pink px-8 py-3 text-xs font-bold text-white shadow-lg shadow-neon-pink/25 hover:bg-neon-pink/80 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {submittingReq ? 'Enviando...' : 'Enviar Carta de Solicitud a Sheddit'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: Pending Approval Screen */}
        {companyReq && companyReq.status === 'pending' && (
          <div className="mx-auto max-w-2xl rounded-2xl border border-amber-500/30 bg-[#0d0b06] p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400">
              <Clock className="h-8 w-8 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-white">Solicitud en Proceso de Evaluación</h2>
            <p className="mt-2 text-xs text-gray-300 leading-relaxed max-w-lg mx-auto">
              Hemos recibido con éxito la carta de solicitud de <strong className="text-white">{companyReq.name}</strong> (RIF: {companyReq.rif}). Nuestro equipo directivo en Sheddit está evaluando tus credenciales corporativas para habilitar tu panel de empleos.
            </p>

            <div className="mt-6 rounded-xl border border-white/10 bg-white/3 p-4 text-left max-w-md mx-auto">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-300 mb-2">
                <FileCheck className="h-4 w-4 text-amber-400" />
                Resumen de la Solicitud:
              </div>
              <p className="text-xs text-gray-400"><strong className="text-gray-300">Empresa:</strong> {companyReq.name}</p>
              <p className="text-xs text-gray-400"><strong className="text-gray-300">Representante:</strong> {companyReq.legalRepresentative}</p>
              <p className="text-xs text-gray-400"><strong className="text-gray-300">Teléfono:</strong> {companyReq.phone}</p>
              <p className="text-xs text-gray-400"><strong className="text-gray-300">Fecha de envío:</strong> {new Date(companyReq.createdAt).toLocaleDateString()}</p>
            </div>

            {/* Quick Approval helper for Admin/Testing */}
            <div className="mt-8 border-t border-white/10 pt-6">
              <span className="text-[11px] text-gray-500 block mb-3">
                ¿Eres el administrador de Sheddit evaluando esta solicitud?
              </span>
              <button
                type="button"
                onClick={handleApproveCompany}
                className="rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-5 py-2.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/25 transition-all shadow-md shadow-emerald-950"
              >
                ✓ Aprobar Solicitud de Empresa (Verificar Ahora)
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Approved Dashboard */}
        {companyApproved && companyReq && (
          <div>
            {/* Recruiter Navigation Bar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('jobs')}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    activeTab === 'jobs'
                      ? 'bg-neon-pink text-white shadow-lg shadow-neon-pink/20'
                      : 'border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Building2 className="h-4 w-4" /> Mis Vacantes ({myJobs.length})
                </button>

                <button
                  onClick={() => setActiveTab('create')}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    activeTab === 'create'
                      ? 'bg-neon-pink text-white shadow-lg shadow-neon-pink/20'
                      : 'border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Plus className="h-4 w-4" /> Publicar Vacante
                </button>

                <button
                  onClick={() => setActiveTab('applicants')}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    activeTab === 'applicants'
                      ? 'bg-neon-pink text-white shadow-lg shadow-neon-pink/20'
                      : 'border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Users className="h-4 w-4" /> Candidatos Postulados ({applicants.length})
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="font-semibold text-white">{companyReq.name}</span>
                <span className="text-gray-600">•</span>
                <span className="text-[11px] text-gray-500">RIF: {companyReq.rif}</span>
              </div>
            </div>

            {/* TAB: MY JOBS */}
            {activeTab === 'jobs' && (
              <div className="space-y-4">
                {myJobs.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">
                    <Building2 className="mx-auto mb-3 h-10 w-10 text-gray-600" />
                    <h3 className="text-base font-bold text-white">Aún no has publicado vacantes</h3>
                    <p className="mt-1 text-xs text-gray-400 max-w-sm mx-auto">
                      Comienza a atraer el mejor talento de Venezuela y el mundo publicando tu primera oferta laboral.
                    </p>
                    <button
                      onClick={() => setActiveTab('create')}
                      className="mt-5 rounded-xl bg-neon-pink px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-neon-pink/20 hover:bg-neon-pink/80 transition-all inline-flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" /> Publicar Mi Primera Vacante
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {myJobs.map((job) => {
                      const jobApplicants = applicants.filter((a) => a.jobId === job.id);
                      return (
                        <div
                          key={job.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/8 bg-[#0b0b0b] p-5 transition-all hover:border-white/15"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-bold text-white">{job.title}</h3>
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                  job.status === 'active'
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                }`}
                              >
                                {job.status === 'active' ? 'Activa' : 'Pausada'}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                {job.modality === 'remoto' ? (
                                  <>
                                    <Globe className="h-3.5 w-3.5 text-cyan-400" />
                                    Remoto ({job.remoteCountry})
                                  </>
                                ) : (
                                  <>
                                    <MapPin className="h-3.5 w-3.5 text-neon-pink" />
                                    {job.city ? `${job.city}, ` : ''}{job.venezuelaState}, Venezuela
                                  </>
                                )}
                              </span>
                              <span>•</span>
                              <span>{job.category}</span>
                              <span>•</span>
                              <span className="font-semibold text-emerald-400">{job.salary}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedJobForFilter(job.id);
                                setActiveTab('applicants');
                              }}
                              className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-gray-200 hover:bg-white/10"
                            >
                              <Users className="h-3.5 w-3.5 text-neon-pink" />
                              Ver Candidatos ({jobApplicants.length})
                            </button>

                            <button
                              onClick={() => handleToggleJobStatus(job)}
                              className="rounded-xl border border-white/10 bg-white/5 p-2 text-gray-400 hover:text-white hover:bg-white/10"
                              title={job.status === 'active' ? 'Pausar oferta' : 'Reactivar oferta'}
                            >
                              {job.status === 'active' ? (
                                <PauseCircle className="h-4 w-4" />
                              ) : (
                                <PlayCircle className="h-4 w-4 text-emerald-400" />
                              )}
                            </button>

                            <button
                              onClick={() => handleDeleteJob(job.id)}
                              className="rounded-xl border border-red-500/20 bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20"
                              title="Eliminar oferta"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB: CREATE JOB */}
            {activeTab === 'create' && (
              <div className="mx-auto max-w-3xl">
                <form onSubmit={handleCreateJob} className="space-y-6 rounded-2xl border border-white/8 bg-[#0b0b0b] p-6 sm:p-8">
                  <div className="flex items-center justify-between border-b border-white/8 pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white">Publicar Nueva Oferta de Empleo</h2>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Define los requisitos y detalles del puesto para atraer al postulante ideal.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                        Título del Puesto / Cargo *
                      </label>
                      <input
                        type="text"
                        required
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="Ej: Desarrollador Frontend React / Asesor de Ventas Telefónicas / Contador Senior"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-neon-pink"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                        Área o Categoría *
                      </label>
                      <select
                        value={jobCategory}
                        onChange={(e) => setJobCategory(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#141414] px-3.5 py-2.5 text-sm text-white outline-none focus:border-neon-pink"
                      >
                        {JOB_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                        Tipo de Jornada
                      </label>
                      <select
                        value={jobType}
                        onChange={(e) => setJobType(e.target.value as JobType)}
                        className="w-full rounded-xl border border-white/10 bg-[#141414] px-3.5 py-2.5 text-sm text-white outline-none focus:border-neon-pink"
                      >
                        <option value="full-time">Tiempo Completo (Full-time)</option>
                        <option value="part-time">Medio Tiempo (Part-time)</option>
                        <option value="freelance">Freelance / Por Proyecto</option>
                        <option value="pasantia">Pasantía / Prácticas</option>
                        <option value="temporal">Temporal</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                        Modalidad de Trabajo *
                      </label>
                      <select
                        value={jobModality}
                        onChange={(e) => setJobModality(e.target.value as JobModality)}
                        className="w-full rounded-xl border border-white/10 bg-[#141414] px-3.5 py-2.5 text-sm text-white outline-none focus:border-neon-pink"
                      >
                        <option value="presencial">Presencial (Venezuela)</option>
                        <option value="remoto">100% Remoto (Internacional / Global)</option>
                        <option value="hibrido">Híbrido (Venezuela)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                        Salario Ofrecido o Referencial
                      </label>
                      <input
                        type="text"
                        value={salary}
                        onChange={(e) => setSalary(e.target.value)}
                        placeholder="Ej: $400 - $600 USD, o A convenir"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-neon-pink"
                      />
                    </div>

                    {/* Geolocation logic */}
                    {jobModality === 'remoto' ? (
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                          Alcance Geográfico del Trabajo Remoto *
                        </label>
                        <select
                          value={remoteCountry}
                          onChange={(e) => setRemoteCountry(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#141414] px-3.5 py-2.5 text-sm text-white outline-none focus:border-neon-pink"
                        >
                          {REMOTE_COUNTRIES.map((ct) => (
                            <option key={ct} value={ct}>
                              {ct}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                            Estado de Venezuela *
                          </label>
                          <select
                            value={venezuelaState}
                            onChange={(e) => setVenezuelaState(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-[#141414] px-3.5 py-2.5 text-sm text-white outline-none focus:border-neon-pink"
                          >
                            {VENEZUELA_STATES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                            Ciudad o Zona
                          </label>
                          <input
                            type="text"
                            value={jobCity}
                            onChange={(e) => setJobCity(e.target.value)}
                            placeholder="Ej: Valencia, Maracay, Caracas..."
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-neon-pink"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Descripción del Puesto y Responsabilidades *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe las tareas principales, objetivos del rol, horarios de trabajo y dinámica laboral..."
                      className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white placeholder-gray-600 outline-none focus:border-neon-pink resize-none"
                    />
                  </div>

                  {/* Requirements List */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Requisitos Mínimos
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newRequirement}
                        onChange={(e) => setNewRequirement(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddRequirement();
                          }
                        }}
                        placeholder="Ej: Mínimo 2 años de experiencia en ventas B2B"
                        className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-neon-pink"
                      />
                      <button
                        type="button"
                        onClick={handleAddRequirement}
                        className="rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20"
                      >
                        Agregar
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {requirements.map((req, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-lg border border-white/5 bg-white/2 px-3 py-1.5 text-xs text-gray-300"
                        >
                          <span>• {req}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setRequirements(requirements.filter((_, i) => i !== idx))
                            }
                            className="text-gray-500 hover:text-red-400"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Beneficios Ofrecidos (Opcional)
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newBenefit}
                        onChange={(e) => setNewBenefit(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddBenefit();
                          }
                        }}
                        placeholder="Ej: Bonos por desempeño, flexibilidad horaria, seguro..."
                        className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-neon-pink"
                      />
                      <button
                        type="button"
                        onClick={handleAddBenefit}
                        className="rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20"
                      >
                        Agregar
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {benefits.map((ben, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-lg border border-white/5 bg-white/2 px-3 py-1.5 text-xs text-gray-300"
                        >
                          <span>✓ {ben}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setBenefits(benefits.filter((_, i) => i !== idx))
                            }
                            className="text-gray-500 hover:text-red-400"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/8">
                    {jobCreatedSuccess && (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4" /> ¡Vacante publicada con éxito!
                      </span>
                    )}
                    <button
                      type="submit"
                      disabled={publishingJob}
                      className="ml-auto rounded-xl bg-neon-pink px-8 py-3 text-xs font-bold text-white shadow-lg shadow-neon-pink/25 hover:bg-neon-pink/80 transition-all disabled:opacity-50"
                    >
                      {publishingJob ? 'Publicando...' : 'Publicar Vacante Ahora'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB: APPLICANTS */}
            {activeTab === 'applicants' && (
              <div className="space-y-4">
                {/* Filter by job */}
                <div className="flex items-center gap-3">
                  <label className="text-xs font-semibold text-gray-400">Filtrar por vacante:</label>
                  <select
                    value={selectedJobForFilter}
                    onChange={(e) => setSelectedJobForFilter(e.target.value)}
                    className="rounded-xl border border-white/10 bg-[#141414] px-3 py-1.5 text-xs text-white outline-none focus:border-neon-pink"
                  >
                    <option value="all">Todas las vacantes ({applicants.length})</option>
                    {myJobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Confidentiality Notice for Recruiter */}
                <div className="rounded-xl border border-emerald-500/25 bg-emerald-950/20 p-3.5 flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  <p className="text-xs text-gray-300">
                    <strong>Privacidad Blindada Sheddit:</strong> Como empresa verificada, tienes acceso a los datos de contacto y aptitudes del postulante (Nombre, Apellido, Teléfono, Ubicación, Experiencia y Aptitudes). Los identificadores como Cédula/DNI se mantienen estrictamente protegidos para resguardar su seguridad.
                  </p>
                </div>

                {/* Applicants List */}
                {applicants.filter(
                  (a) => selectedJobForFilter === 'all' || a.jobId === selectedJobForFilter
                ).length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-xs text-gray-400">
                    No hay postulaciones registradas aún para esta selección.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {applicants
                      .filter((a) => selectedJobForFilter === 'all' || a.jobId === selectedJobForFilter)
                      .map((app) => {
                        const safe = app.candidateSafeData;
                        return (
                          <div
                            key={app.id}
                            className="rounded-2xl border border-white/8 bg-[#0b0b0b] p-5 space-y-4 hover:border-white/15 transition-all"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl border border-white/15 bg-white/5 overflow-hidden flex items-center justify-center flex-shrink-0">
                                  {safe.photoUrl ? (
                                    <img
                                      src={safe.photoUrl}
                                      alt="Candidato"
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-lg">👤</span>
                                  )}
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-white">
                                    {safe.firstName} {safe.lastName}
                                  </h4>
                                  <p className="text-xs text-neon-pink font-medium">{safe.title}</p>
                                  <p className="text-[11px] text-gray-400 mt-0.5">
                                    Postulado a: <strong className="text-gray-300">{app.jobTitle}</strong>
                                  </p>
                                </div>
                              </div>

                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                  app.status === 'contactado'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : app.status === 'en_revision'
                                    ? 'bg-amber-500/20 text-amber-400'
                                    : app.status === 'descartado'
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-blue-500/20 text-blue-400'
                                }`}
                              >
                                {app.status === 'recibida'
                                  ? 'Recibida'
                                  : app.status === 'en_revision'
                                  ? 'En Revisión'
                                  : app.status === 'contactado'
                                  ? 'Contactado'
                                  : 'Descartado'}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-2 text-xs text-gray-300">
                              <span className="flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1">
                                <Phone className="h-3 w-3 text-neon-pink" />
                                {safe.phone}
                              </span>
                              <span className="flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1">
                                <MapPin className="h-3 w-3 text-gray-400" />
                                {safe.city ? `${safe.city}, ` : ''}{safe.state}
                              </span>
                            </div>

                            {safe.skills && safe.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {safe.skills.slice(0, 4).map((sk, i) => (
                                  <span
                                    key={i}
                                    className="rounded-md bg-neon-pink/10 px-2 py-0.5 text-[10px] text-neon-pink font-medium"
                                  >
                                    {sk}
                                  </span>
                                ))}
                                {safe.skills.length > 4 && (
                                  <span className="text-[10px] text-gray-500 self-center">
                                    +{safe.skills.length - 4} más
                                  </span>
                                )}
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                              <button
                                type="button"
                                onClick={() => setSelectedApplicant(app)}
                                className="flex items-center gap-1.5 text-xs font-bold text-neon-pink hover:underline"
                              >
                                <Eye className="h-3.5 w-3.5" /> Ver Currículum Completo
                              </button>

                              <select
                                value={app.status}
                                onChange={(e) =>
                                  handleUpdateApplicantStatus(
                                    app.id,
                                    e.target.value as JobApplication['status']
                                  )
                                }
                                className="rounded-lg border border-white/10 bg-[#141414] px-2 py-1 text-[11px] text-gray-300 outline-none"
                              >
                                <option value="recibida">Recibida</option>
                                <option value="en_revision">En Revisión</option>
                                <option value="contactado">Contactado</option>
                                <option value="descartado">Descartado</option>
                              </select>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Modal: Full Confidential Candidate CV View */}
        {selectedApplicant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-2xl rounded-2xl border border-white/15 bg-[#0e0e0e] p-6 sm:p-8 shadow-2xl my-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neon-pink">
                    Perfil Confidencial de Postulante
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    {selectedApplicant.candidateSafeData.firstName}{' '}
                    {selectedApplicant.candidateSafeData.lastName}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedApplicant(null)}
                  className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Safe Candidate Info */}
              <div className="flex flex-col sm:flex-row gap-5 items-start mb-6">
                <div className="h-20 w-20 rounded-2xl border border-white/15 bg-white/5 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {selectedApplicant.candidateSafeData.photoUrl ? (
                    <img
                      src={selectedApplicant.candidateSafeData.photoUrl}
                      alt="Candidato"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">👤</span>
                  )}
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">
                    {selectedApplicant.candidateSafeData.title}
                  </h4>
                  <p className="text-xs text-gray-300 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-neon-pink" />
                    {selectedApplicant.candidateSafeData.city
                      ? `${selectedApplicant.candidateSafeData.city}, `
                      : ''}
                    {selectedApplicant.candidateSafeData.state}
                  </p>
                  <p className="text-xs text-gray-300 flex items-center gap-1.5 pt-1">
                    <Phone className="h-3.5 w-3.5 text-emerald-400" />
                    <a
                      href={`https://wa.me/${selectedApplicant.candidateSafeData.phone.replace(
                        /\D/g,
                        ''
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-emerald-400 hover:underline"
                    >
                      {selectedApplicant.candidateSafeData.phone} (Contactar por WhatsApp)
                    </a>
                  </p>
                </div>
              </div>

              {/* Confidentiality Reminder */}
              <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3 text-[11px] text-emerald-300">
                🔒 <strong>Datos Sensibles Protegidos:</strong> Por políticas de privacidad y seguridad de Sheddit, los datos personales como Cédula/DNI están protegidos y no son expuestos.
              </div>

              {/* Summary */}
              {selectedApplicant.candidateSafeData.summary && (
                <div className="mb-5 border-t border-white/5 pt-4">
                  <h5 className="text-xs font-bold uppercase text-gray-400 mb-1">
                    Resumen Profesional
                  </h5>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {selectedApplicant.candidateSafeData.summary}
                  </p>
                </div>
              )}

              {/* Skills */}
              {selectedApplicant.candidateSafeData.skills &&
                selectedApplicant.candidateSafeData.skills.length > 0 && (
                  <div className="mb-5 border-t border-white/5 pt-4">
                    <h5 className="text-xs font-bold uppercase text-gray-400 mb-2">
                      Aptitudes y Actitudes
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedApplicant.candidateSafeData.skills.map((s, idx) => (
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

              {/* Experience */}
              {selectedApplicant.candidateSafeData.experience &&
                selectedApplicant.candidateSafeData.experience.length > 0 && (
                  <div className="mb-5 border-t border-white/5 pt-4">
                    <h5 className="text-xs font-bold uppercase text-gray-400 mb-2">
                      Experiencia Laboral
                    </h5>
                    <div className="space-y-3">
                      {selectedApplicant.candidateSafeData.experience.map((exp) => (
                        <div key={exp.id} className="rounded-xl bg-white/2 p-3 text-xs">
                          <p className="font-bold text-white">{exp.position}</p>
                          <p className="text-gray-400">
                            {exp.company} • {exp.startDate} - {exp.endDate || 'Presente'}
                          </p>
                          {exp.description && (
                            <p className="mt-1 text-gray-300">{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Education */}
              {selectedApplicant.candidateSafeData.education &&
                selectedApplicant.candidateSafeData.education.length > 0 && (
                  <div className="border-t border-white/5 pt-4">
                    <h5 className="text-xs font-bold uppercase text-gray-400 mb-2">
                      Educación y Formación
                    </h5>
                    <div className="space-y-2">
                      {selectedApplicant.candidateSafeData.education.map((edu) => (
                        <div key={edu.id} className="rounded-xl bg-white/2 p-3 text-xs">
                          <p className="font-bold text-white">{edu.degree}</p>
                          <p className="text-gray-400">
                            {edu.institution} {edu.startDate ? `• ${edu.startDate}` : ''}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedApplicant(null)}
                  className="rounded-xl bg-white/10 px-5 py-2 text-xs font-bold text-white hover:bg-white/15"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
