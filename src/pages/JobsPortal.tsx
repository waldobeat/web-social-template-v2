import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ref, onValue, get, push, set } from 'firebase/database';
import { db } from '../lib/firebase';
import { useAuthContext } from '../lib/AuthContext';
import Navbar from '../components/Navbar';
import {
  VENEZUELA_STATES,
  REMOTE_COUNTRIES,
  JOB_CATEGORIES,
  type JobAd,
  type JobModality,
  type CandidateCV,
  type JobApplication
} from '../types/jobs';
import {
  Briefcase, Search, MapPin, Globe, Building2,
  Calendar, CheckCircle2,
  ShieldCheck, FileText, ChevronRight, X, Sparkles, AlertCircle
} from 'lucide-react';

// Default initial starter jobs for Venezuela & Remote
const SEED_JOBS: Omit<JobAd, 'id'>[] = [
  {
    companyId: 'company_demo_1',
    companyName: 'TechSolutions Venezuela C.A.',
    companyVerified: true,
    title: 'Desarrollador Frontend React / TypeScript',
    category: 'Tecnología y Software',
    modality: 'remoto',
    remoteCountry: 'Global / Cualquier País',
    jobType: 'full-time',
    salary: '$600 - $1,000 USD / mes',
    description: 'Buscamos desarrollador Frontend con experiencia comprobable en React, TailwindCSS y consumo de APIs para integrarse a equipo multidisciplinario remoto.',
    requirements: [
      'Al menos 2 años de experiencia con React',
      'Conocimientos sólidos de JavaScript / TypeScript',
      'Experiencia con Git y trabajo colaborativo',
      'Buena comunicación y proactividad'
    ],
    benefits: ['Horario flexible', 'Pago quincenal en USD', 'Capacitación constante'],
    createdAt: Date.now() - 3600000 * 5,
    status: 'active',
    applicantCount: 3
  },
  {
    companyId: 'company_demo_2',
    companyName: 'Distribuidora Carabobo C.A.',
    companyVerified: true,
    title: 'Coordinador de Logística y Despacho',
    category: 'Logística y Almacén',
    modality: 'presencial',
    venezuelaState: 'Carabobo',
    city: 'Valencia',
    jobType: 'full-time',
    salary: '$350 - $450 USD / mes',
    description: 'Empresa líder en consumo masivo en la Zona Industrial de Valencia requiere Coordinador de Logística encargado de supervisar inventarios, rutas de despacho y control de flota.',
    requirements: [
      'TSU o Licenciatura en Logística, Administración o afines',
      'Residenciado en Valencia o municipios cercanos',
      'Manejo de sistemas de inventario y Excel intermedio/avanzado',
      'Habilidad para liderar personal de almacén'
    ],
    benefits: ['Bono de transporte', 'Almuerzo cubierto', 'Beneficios superiores a la ley'],
    createdAt: Date.now() - 3600000 * 24,
    status: 'active',
    applicantCount: 6
  },
  {
    companyId: 'company_demo_3',
    companyName: 'Grupo Comercial Aragua',
    companyVerified: true,
    title: 'Asesor de Ventas y Atención al Cliente',
    category: 'Ventas y Comercial',
    modality: 'presencial',
    venezuelaState: 'Aragua',
    city: 'Maracay',
    jobType: 'full-time',
    salary: '$250 USD base + Comisiones por ventas',
    description: 'Se solicita personal dinámico para atención directa al público, asesoría comercial de productos y cierre de ventas en tienda física en Maracay.',
    requirements: [
      'Experiencia mínima de 1 año en atención al cliente o ventas',
      'Excelente presencia y dicción',
      'Orientado a cumplimiento de metas',
      'Puntualidad y compromiso'
    ],
    benefits: ['Comisiones sin límite', 'Excelente ambiente laboral'],
    createdAt: Date.now() - 3600000 * 48,
    status: 'active',
    applicantCount: 8
  },
  {
    companyId: 'company_demo_4',
    companyName: 'Finanzas & Consultoría Caracas',
    companyVerified: true,
    title: 'Contador Público / Analista Fiscal',
    category: 'Administración y Finanzas',
    modality: 'hibrido',
    venezuelaState: 'Distrito Capital (Caracas)',
    city: 'Caracas (Chacao)',
    jobType: 'full-time',
    salary: '$500 USD / mes',
    description: 'Firma contable busca Contador Público colegiado para preparación de estados financieros, declaraciones fiscales de SENIAT y asesoría a clientes.',
    requirements: [
      'Licenciado en Contaduría Pública',
      'Conocimiento actualizado de la normativa tributaria venezolana',
      'Disponibilidad para modalidad híbrida (2 días presenciales, 3 remotos)'
    ],
    benefits: ['Bono de conectividad', 'Días libres de cumpleaños'],
    createdAt: Date.now() - 3600000 * 72,
    status: 'active',
    applicantCount: 4
  }
];

export default function JobsPortal() {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<JobAd[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModality, setSelectedModality] = useState<'all' | JobModality>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Candidate CV State
  const [myCV, setMyCV] = useState<CandidateCV | null>(null);
  const [appliedJobIds, setAppliedJobIds] = useState<Record<string, boolean>>({});

  // Detail Modal
  const [selectedJob, setSelectedJob] = useState<JobAd | null>(null);
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [showCVRequiredModal, setShowCVRequiredModal] = useState(false);

  // Load Jobs and User CV
  useEffect(() => {
    const jobsRef = ref(db, 'jobs');
    const unsub = onValue(jobsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setJobs([]);
      } else {
        const list: JobAd[] = Object.entries(data).map(([id, val]: [string, any]) => ({
          id,
          ...val
        }));
        // Sort newest first
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setJobs(list);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Load User CV & Applied jobs
  useEffect(() => {
    if (!user) return;

    const loadUserCVAndApplications = async () => {
      try {
        const cvSnap = await get(ref(db, `candidateCVs/${user.uid}`));
        if (cvSnap.exists()) {
          setMyCV(cvSnap.val());
        }

        const appSnap = await get(ref(db, 'jobApplications'));
        if (appSnap.exists()) {
          const allApps = appSnap.val();
          const applied: Record<string, boolean> = {};
          Object.values(allApps).forEach((app: any) => {
            if (app.applicantId === user.uid) {
              applied[app.jobId] = true;
            }
          });
          setAppliedJobIds(applied);
        }
      } catch (err) {
        console.error('Error cargando CV del postulante:', err);
      }
    };

    loadUserCVAndApplications();
  }, [user]);

  // Seed sample jobs if empty
  const handleSeedJobs = async () => {
    try {
      const jobsRef = ref(db, 'jobs');
      for (const job of SEED_JOBS) {
        const newRef = push(jobsRef);
        await set(newRef, { ...job, id: newRef.key });
      }
    } catch (err) {
      console.error('Error sembrando vacantes:', err);
    }
  };

  // Filter logic
  const filteredJobs = jobs.filter((job) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = job.title.toLowerCase().includes(q);
      const matchCompany = job.companyName.toLowerCase().includes(q);
      const matchDesc = job.description.toLowerCase().includes(q);
      const matchReq = (job.requirements || []).some((r) => r.toLowerCase().includes(q));
      if (!matchTitle && !matchCompany && !matchDesc && !matchReq) return false;
    }

    // Modality
    if (selectedModality !== 'all' && job.modality !== selectedModality) {
      return false;
    }

    // State (if presencial or hibrido)
    if (
      selectedState !== 'all' &&
      (job.modality === 'presencial' || job.modality === 'hibrido') &&
      job.venezuelaState !== selectedState
    ) {
      return false;
    }

    // Country (if remoto)
    if (
      selectedCountry !== 'all' &&
      job.modality === 'remoto' &&
      job.remoteCountry !== selectedCountry
    ) {
      return false;
    }

    // Category
    if (selectedCategory !== 'all' && job.category !== selectedCategory) {
      return false;
    }

    return true;
  });

  // Handle Apply
  const handleApply = async () => {
    if (!user) {
      navigate('/');
      return;
    }

    if (!selectedJob) return;

    // Check if CV exists
    if (!myCV) {
      setShowCVRequiredModal(true);
      return;
    }

    setApplying(true);
    try {
      const applicationsRef = ref(db, 'jobApplications');
      const newAppRef = push(applicationsRef);
      const appId = newAppRef.key!;

      // Safe confidential candidate snapshot (NO DNI, NO Sensitive data)
      const applicationData: JobApplication = {
        id: appId,
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        companyId: selectedJob.companyId,
        companyName: selectedJob.companyName,
        applicantId: user.uid,
        appliedAt: Date.now(),
        status: 'recibida',
        candidateSafeData: {
          firstName: myCV.firstName,
          lastName: myCV.lastName,
          photoUrl: myCV.photoUrl || user.photoURL || '',
          title: myCV.title,
          phone: myCV.phone,
          state: myCV.state,
          city: myCV.city,
          skills: myCV.skills || [],
          summary: myCV.summary || '',
          experience: myCV.experience || [],
          education: myCV.education || []
        }
      };

      await set(newAppRef, applicationData);

      // Increment applicant count on job
      const currentCount = selectedJob.applicantCount || 0;
      await set(ref(db, `jobs/${selectedJob.id}/applicantCount`), currentCount + 1);

      setAppliedJobIds((prev) => ({ ...prev, [selectedJob.id]: true }));
      setApplySuccess(true);
      setTimeout(() => {
        setApplySuccess(false);
        setSelectedJob(null);
      }, 2000);
    } catch (err) {
      console.error('Error al postularse:', err);
      alert('Hubo un error al enviar tu postulación. Intenta nuevamente.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] text-gray-100">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Hero Section */}
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#140b12] via-[#0d0d0d] to-[#070707] p-6 sm:p-10 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neon-pink/30 bg-neon-pink/15 px-3 py-1 text-xs font-bold text-neon-pink">
                <Sparkles className="h-3.5 w-3.5" /> Portal de Empleo Sheddit
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Encuentra tu próximo empleo en <span className="text-neon-pink">Venezuela</span> y el mundo
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Vacantes presenciales en los 24 estados del país y oportunidades 100% remotas internacionales. Postúlate con tu currículum seguro y confidencial.
              </p>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <Link
                to="/empleos/cv"
                className="flex items-center justify-center gap-2 rounded-xl bg-neon-pink px-4 py-3 text-xs font-bold text-white shadow-lg shadow-neon-pink/25 hover:bg-neon-pink/80 transition-all text-center"
              >
                <FileText className="h-4 w-4" />
                {myCV ? 'Editar Mi CV' : 'Crear Mi Currículum'}
              </Link>

              <Link
                to="/empleos/empresa"
                className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-xs font-bold text-gray-200 hover:bg-white/10 hover:text-white transition-all text-center"
              >
                <Building2 className="h-4 w-4 text-neon-pink" />
                Portal Empresas
              </Link>

              {user && (
                <Link
                  to="/empleos/mis-postulaciones"
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-xs font-bold text-gray-200 hover:bg-white/10 transition-all text-center"
                >
                  <Briefcase className="h-4 w-4 text-emerald-400" />
                  Mis Postulaciones
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Privacy Highlight Badge */}
        <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-3.5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-emerald-400 flex-shrink-0" />
            <p className="text-xs text-gray-300">
              <strong className="text-emerald-300">Privacidad y Confidencialidad Asegurada:</strong> Las empresas verificadas solo ven tu nombre, apellido, teléfono, foto, dirección y aptitudes. Tu cédula/DNI se mantiene totalmente confidencial.
            </p>
          </div>
          <Link
            to="/empleos/cv"
            className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
          >
            Configurar mi CV seguro <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-8 space-y-3 rounded-2xl border border-white/8 bg-[#0b0b0b] p-4 sm:p-5">
          {/* Main search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por cargo, palabra clave, empresa o habilidad (ej: Ventas, React, Contador)..."
              className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 outline-none focus:border-neon-pink transition-all"
            />
          </div>

          {/* Selectors grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-1">
            {/* Modality */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                Modalidad
              </label>
              <select
                value={selectedModality}
                onChange={(e) => setSelectedModality(e.target.value as any)}
                className="w-full rounded-xl border border-white/10 bg-[#141414] px-3 py-2 text-xs text-white outline-none focus:border-neon-pink"
              >
                <option value="all">Todas las modalidades</option>
                <option value="presencial">Presencial (Venezuela)</option>
                <option value="remoto">100% Remoto (Global)</option>
                <option value="hibrido">Híbrido</option>
              </select>
            </div>

            {/* Dynamic Geolocation: Venezuela State or Country */}
            {selectedModality === 'remoto' ? (
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                  País de Trabajo Remoto
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#141414] px-3 py-2 text-xs text-white outline-none focus:border-neon-pink"
                >
                  <option value="all">Cualquier país / Todo el mundo</option>
                  {REMOTE_COUNTRIES.map((ct) => (
                    <option key={ct} value={ct}>
                      {ct}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                  Estado (Venezuela)
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#141414] px-3 py-2 text-xs text-white outline-none focus:border-neon-pink"
                >
                  <option value="all">Todos los estados de Venezuela</option>
                  {VENEZUELA_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Category */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                Categoría / Área
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#141414] px-3 py-2 text-xs text-white outline-none focus:border-neon-pink"
              >
                <option value="all">Todas las categorías</option>
                {JOB_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Filters button */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedModality('all');
                  setSelectedState('all');
                  setSelectedCountry('all');
                  setSelectedCategory('all');
                }}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-semibold text-gray-400 hover:bg-white/10 hover:text-white transition-all text-center"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-xs font-semibold text-gray-400">
            Mostrando <span className="font-bold text-white">{filteredJobs.length}</span> vacantes laborales
          </div>

          {jobs.length === 0 && !loading && (
            <button
              onClick={handleSeedJobs}
              className="rounded-xl border border-neon-pink/30 bg-neon-pink/10 px-3 py-1.5 text-xs font-bold text-neon-pink hover:bg-neon-pink/20 transition-all"
            >
              Cargar Vacantes de Ejemplo
            </button>
          )}
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 rounded-2xl border border-white/5 bg-white/2 animate-pulse"
              />
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">
            <Briefcase className="mx-auto mb-3 h-10 w-10 text-gray-600" />
            <h3 className="text-base font-bold text-white">No se encontraron ofertas con estos filtros</h3>
            <p className="mt-1 text-xs text-gray-400 max-w-sm mx-auto">
              Prueba cambiando la modalidad, el estado de Venezuela o limpiando la barra de búsqueda.
            </p>
            {jobs.length === 0 && (
              <button
                onClick={handleSeedJobs}
                className="mt-4 rounded-xl bg-neon-pink px-5 py-2 text-xs font-bold text-white shadow-lg shadow-neon-pink/25"
              >
                Cargar Vacantes Iniciales (Venezuela & Remoto)
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredJobs.map((job) => {
              const isApplied = !!appliedJobIds[job.id];
              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className="group relative cursor-pointer rounded-2xl border border-white/8 bg-[#0b0b0b] p-5 transition-all hover:border-neon-pink/40 hover:bg-[#0e0e0e] shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Left: Logo + Info */}
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-2xl border border-white/10 bg-white/5 overflow-hidden flex items-center justify-center flex-shrink-0">
                        {job.companyLogo ? (
                          <img
                            src={job.companyLogo}
                            alt={job.companyName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Building2 className="h-6 w-6 text-neon-pink" />
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-base font-bold text-white group-hover:text-neon-pink transition-colors">
                            {job.title}
                          </h2>
                          {isApplied && (
                            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                              ✓ Postulado
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <span className="font-semibold text-gray-200">{job.companyName}</span>
                          {job.companyVerified && (
                            <span title="Empresa Verificada">
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                            </span>
                          )}
                          <span>•</span>
                          <span className="text-[11px] text-gray-500">{job.category}</span>
                        </div>

                        {/* Badges row */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                          {job.modality === 'remoto' ? (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-400 border border-cyan-500/20">
                              <Globe className="h-3 w-3" />
                              Remoto ({job.remoteCountry || 'Global'})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-neon-pink/10 px-2.5 py-1 text-xs font-semibold text-neon-pink border border-neon-pink/20">
                              <MapPin className="h-3 w-3" />
                              {job.city ? `${job.city}, ` : ''}{job.venezuelaState}, Venezuela
                            </span>
                          )}

                          <span className="rounded-lg bg-white/5 px-2.5 py-1 text-xs text-gray-300">
                            {job.jobType === 'full-time'
                              ? 'Tiempo Completo'
                              : job.jobType === 'part-time'
                              ? 'Medio Tiempo'
                              : job.jobType === 'freelance'
                              ? 'Freelance'
                              : job.jobType === 'pasantia'
                              ? 'Pasantía'
                              : job.jobType === 'temporal'
                              ? 'Temporal'
                              : 'Tiempo Completo'}
                          </span>

                          {job.salary && (
                            <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                              {job.salary}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Date & Button */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                      <span className="text-[11px] text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(job.createdAt).toLocaleDateString()}
                      </span>

                      <button
                        type="button"
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold text-white group-hover:bg-neon-pink group-hover:border-neon-pink transition-all"
                      >
                        Ver Detalle
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Job Details & One-Click Apply */}
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto">
            <div className="relative w-full max-w-2xl rounded-3xl border border-white/15 bg-[#0e0e0e] p-6 sm:p-8 shadow-2xl my-8">
              {/* Close Button */}
              <button
                onClick={() => setSelectedJob(null)}
                className="absolute top-5 right-5 rounded-xl border border-white/10 bg-white/5 p-2 text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Header */}
              <div className="flex items-start gap-4 mb-6 pr-8">
                <div className="h-14 w-14 rounded-2xl border border-white/10 bg-white/5 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {selectedJob.companyLogo ? (
                    <img
                      src={selectedJob.companyLogo}
                      alt={selectedJob.companyName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Building2 className="h-7 w-7 text-neon-pink" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedJob.title}</h2>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                    <span className="font-semibold text-gray-200">{selectedJob.companyName}</span>
                    {selectedJob.companyVerified && (
                      <span className="flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                        <ShieldCheck className="h-3.5 w-3.5" /> Verificada
                      </span>
                    )}
                    <span>•</span>
                    <span>{selectedJob.category}</span>
                  </div>
                </div>
              </div>

              {/* Location & Modality Banner */}
              <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-white/8 bg-white/3 p-3.5 text-xs">
                {selectedJob.modality === 'remoto' ? (
                  <span className="flex items-center gap-1.5 font-bold text-cyan-400">
                    <Globe className="h-4 w-4" />
                    100% Remoto ({selectedJob.remoteCountry || 'Global'})
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 font-bold text-neon-pink">
                    <MapPin className="h-4 w-4" />
                    {selectedJob.city ? `${selectedJob.city}, ` : ''}{selectedJob.venezuelaState}, Venezuela
                  </span>
                )}
                <span>•</span>
                <span className="text-gray-300">
                  {selectedJob.jobType === 'full-time'
                    ? 'Tiempo Completo'
                    : selectedJob.jobType === 'part-time'
                    ? 'Medio Tiempo'
                    : selectedJob.jobType === 'freelance'
                    ? 'Freelance'
                    : selectedJob.jobType === 'pasantia'
                    ? 'Pasantía'
                    : selectedJob.jobType === 'temporal'
                    ? 'Temporal'
                    : 'Tiempo Completo'}
                </span>
                <span>•</span>
                <span className="font-bold text-emerald-400">{selectedJob.salary}</span>
              </div>

              {/* Description */}
              <div className="mb-6 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Descripción del Puesto
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                  {selectedJob.description}
                </p>
              </div>

              {/* Requirements */}
              {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                <div className="mb-6 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Requisitos
                  </h3>
                  <div className="space-y-1.5">
                    {selectedJob.requirements.map((req, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-gray-300">
                        <span className="text-neon-pink font-bold">•</span>
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Benefits */}
              {selectedJob.benefits && selectedJob.benefits.length > 0 && (
                <div className="mb-6 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Beneficios
                  </h3>
                  <div className="space-y-1.5">
                    {selectedJob.benefits.map((ben, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-emerald-400">
                        <span>✓</span>
                        <span className="text-gray-300">{ben}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Privacy Safe Note */}
              <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3 text-[11px] text-emerald-300">
                🔒 <strong>Privacidad Asegurada:</strong> Al postularte, la empresa solo recibirá tu nombre, apellido, teléfono, foto, ubicación y aptitudes. Tu cédula/DNI se mantiene totalmente confidencial.
              </div>

              {/* Apply Action */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
                <div>
                  {appliedJobIds[selectedJob.id] && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" /> Ya estás postulado a esta vacante
                    </span>
                  )}
                  {applySuccess && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" /> ¡Postulación enviada exitosamente a la empresa!
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="w-1/2 sm:w-auto rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-gray-300 hover:bg-white/10"
                  >
                    Cerrar
                  </button>

                  <button
                    onClick={handleApply}
                    disabled={applying || appliedJobIds[selectedJob.id]}
                    className="w-1/2 sm:w-auto rounded-xl bg-neon-pink px-7 py-2.5 text-xs font-bold text-white shadow-lg shadow-neon-pink/25 hover:bg-neon-pink/80 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {appliedJobIds[selectedJob.id]
                      ? 'Ya Postulado'
                      : applying
                      ? 'Enviando...'
                      : 'Postularme con mi CV'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: CV Required Notice */}
        {showCVRequiredModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-neon-pink/40 bg-[#0e0e0e] p-6 text-center shadow-2xl">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-neon-pink/15 text-neon-pink">
                <AlertCircle className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-white">Crea tu Currículum para Postularte</h3>
              <p className="mt-2 text-xs text-gray-300 leading-relaxed">
                Para que las empresas puedan conocer tus aptitudes y contactarte de forma segura, primero debes completar tu currículum (te tomará menos de 2 minutos).
              </p>
              <div className="mt-6 flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    setShowCVRequiredModal(false);
                    navigate('/empleos/cv');
                  }}
                  className="w-full rounded-xl bg-neon-pink py-2.5 text-xs font-bold text-white shadow-lg shadow-neon-pink/20 hover:bg-neon-pink/80"
                >
                  Completar Mi Currículum Ahora
                </button>
                <button
                  onClick={() => setShowCVRequiredModal(false)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-semibold text-gray-400 hover:bg-white/10"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
