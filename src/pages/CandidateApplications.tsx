import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { db } from '../lib/firebase';
import { useAuthContext } from '../lib/AuthContext';
import Navbar from '../components/Navbar';
import type { JobApplication } from '../types/jobs';
import {
  Briefcase, ArrowLeft,
  Building2, Calendar, FileText
} from 'lucide-react';

export default function CandidateApplications() {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<JobApplication[]>([]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadApps = async () => {
      try {
        const appSnap = await get(ref(db, 'jobApplications'));
        if (appSnap.exists()) {
          const all = appSnap.val();
          const userApps: JobApplication[] = Object.entries(all)
            .map(([id, val]: [string, any]) => ({ id, ...val }))
            .filter((a) => a.applicantId === user.uid);
          userApps.sort((a, b) => (b.appliedAt || 0) - (a.appliedAt || 0));
          setApplications(userApps);
        }
      } catch (err) {
        console.error('Error cargando postulaciones:', err);
      } finally {
        setLoading(false);
      }
    };

    loadApps();
  }, [user]);

  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-[#070707] text-white">
        <Navbar />
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <Briefcase className="mx-auto mb-4 h-12 w-12 text-neon-pink" />
          <h2 className="text-xl font-bold">Mis Postulaciones</h2>
          <p className="mt-2 text-xs text-gray-400">
            Inicia sesión para consultar el estado de tus postulaciones laborales.
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="rounded-xl bg-neon-pink px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-neon-pink/20"
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
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/empleos')}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-300 hover:bg-white/10"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Ver Portal de Empleos
            </button>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-neon-pink" />
              Mis Postulaciones Laborales
            </h1>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">
            <Briefcase className="mx-auto mb-3 h-10 w-10 text-gray-600" />
            <h3 className="text-base font-bold text-white">Aún no te has postulado a ninguna vacante</h3>
            <p className="mt-1 text-xs text-gray-400 max-w-sm mx-auto">
              Explora las oportunidades laborales en Venezuela y el mundo y envía tu currículum con un solo clic.
            </p>
            <Link
              to="/empleos"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-neon-pink px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-neon-pink/20 hover:bg-neon-pink/80"
            >
              Ver Ofertas Disponibles
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/8 bg-[#0b0b0b] p-5 hover:border-white/15 transition-all"
              >
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white">{app.jobTitle}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1 text-neon-pink font-semibold">
                      <Building2 className="h-3.5 w-3.5" />
                      {app.companyName}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-gray-500" />
                      Postulado: {new Date(app.appliedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      app.status === 'contactado'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : app.status === 'en_revision'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : app.status === 'descartado'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {app.status === 'recibida'
                      ? 'Recibida por la empresa'
                      : app.status === 'en_revision'
                      ? 'En Evaluación'
                      : app.status === 'contactado'
                      ? 'Te han Contactado 🎉'
                      : 'Cerrada / Descartada'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
