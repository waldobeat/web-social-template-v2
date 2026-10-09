import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue, update } from 'firebase/database';
import { db } from '../lib/firebase';
import { useAuthContext } from '../lib/AuthContext';
import Navbar from '../components/Navbar';
import type { CompanyRequest } from '../types/jobs';
import { ShieldCheck, XCircle, Building2, Eye, ExternalLink } from 'lucide-react';

export default function AdminCompanyPortal() {
  const { user, loading } = useAuthContext();
  const navigate = useNavigate();

  const [requests, setRequests] = useState<CompanyRequest[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Check if master user
  useEffect(() => {
    if (!loading) {
      if (!user || user.username?.toLowerCase() !== 'sheddit') {
        navigate('/empleos'); // Redirect non-master users
      }
    }
  }, [user, loading, navigate]);

  // Load Company Requests
  useEffect(() => {
    if (!user || user.username?.toLowerCase() !== 'sheddit') return;

    const reqRef = ref(db, 'companyRequests');
    const unsub = onValue(reqRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setRequests([]);
      } else {
        const list = Object.entries(data).map(([id, val]: [string, any]) => ({
          userId: id,
          ...val
        })) as CompanyRequest[];
        // Sort: pending first, then by date
        list.sort((a, b) => {
          if (a.status === 'pending' && b.status !== 'pending') return -1;
          if (a.status !== 'pending' && b.status === 'pending') return 1;
          return (b.createdAt || 0) - (a.createdAt || 0);
        });
        setRequests(list);
      }
      setDataLoading(false);
    });

    return () => unsub();
  }, [user]);

  const handleUpdateStatus = async (userId: string, status: 'approved' | 'rejected') => {
    if (!window.confirm(`¿Seguro que deseas marcar esta empresa como ${status}?`)) return;
    try {
      await update(ref(db, `companyRequests/${userId}`), {
        status,
        reviewedAt: Date.now()
      });
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error al actualizar el estado.');
    }
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-[#070707] flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-neon-pink border-t-transparent animate-spin" />
      </div>
    );
  }

  // Only render for master
  if (user?.username?.toLowerCase() !== 'sheddit') return null;

  return (
    <div className="min-h-screen bg-[#070707] text-gray-100">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 p-6 rounded-3xl border border-white/10 bg-gradient-to-r from-[#140b12] to-[#0d0d0d] shadow-2xl flex items-center gap-4">
          <div className="h-16 w-16 bg-neon-pink/20 text-neon-pink rounded-2xl flex items-center justify-center">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Admin: Verificación de Empresas</h1>
            <p className="text-sm text-gray-400 mt-1">Valida las solicitudes de registro de compañías en el Portal de Empleos.</p>
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-[#0b0b0b] rounded-2xl border border-white/5">
            <Building2 className="mx-auto h-12 w-12 mb-3 text-gray-600" />
            <p>No hay solicitudes de empresas actualmente.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {requests.map((req) => (
              <div key={req.id || req.ownerUid} className="rounded-2xl border border-white/10 bg-[#0b0b0b] p-5 shadow-lg flex flex-col md:flex-row gap-6">
                
                {/* Logo & Basic Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="h-16 w-16 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {req.logo ? (
                      <img src={req.logo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="h-8 w-8 text-gray-500" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      {req.name}
                      {req.status === 'pending' && <span className="bg-yellow-500/20 text-yellow-400 text-[10px] px-2 py-0.5 rounded-full border border-yellow-500/30">Pendiente</span>}
                      {req.status === 'approved' && <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30">Aprobada</span>}
                      {req.status === 'rejected' && <span className="bg-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded-full border border-red-500/30">Rechazada</span>}
                    </h3>
                    <p className="text-xs text-gray-400">RIF: <span className="text-gray-200">{req.rif}</span></p>
                    <p className="text-xs text-gray-400">Sector: <span className="text-gray-200">{req.sector}</span></p>
                    {req.website && (
                      <a href={req.website.startsWith('http') ? req.website : `https://${req.website}`} target="_blank" rel="noreferrer" className="text-xs text-neon-pink hover:underline inline-flex items-center gap-1 mt-1">
                        Sitio Web <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Contact & Letter Info */}
                <div className="flex-1 space-y-2 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 text-sm">
                  <p className="text-xs text-gray-400">Representante: <strong className="text-white">{req.legalRepresentative}</strong></p>
                  <p className="text-xs text-gray-400">Teléfono: <span className="text-gray-200">{req.phone}</span></p>
                  <p className="text-xs text-gray-400">Correo: <span className="text-gray-200">{req.email}</span></p>
                  
                  <div className="mt-3 bg-white/5 p-3 rounded-lg">
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><Eye className="h-3 w-3" /> Carta de Solicitud</p>
                    <p className="text-xs text-gray-300 whitespace-pre-wrap max-h-24 overflow-y-auto pr-2 custom-scrollbar">
                      {req.requestLetter}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex md:flex-col justify-end gap-2 border-t md:border-t-0 border-white/10 pt-4 md:pt-0 shrink-0">
                  {req.status !== 'approved' && (
                    <button
                      onClick={() => handleUpdateStatus(req.ownerUid, 'approved')}
                      className="flex-1 md:flex-none bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="h-4 w-4" /> Aprobar
                    </button>
                  )}
                  {req.status !== 'rejected' && (
                    <button
                      onClick={() => handleUpdateStatus(req.ownerUid, 'rejected')}
                      className="flex-1 md:flex-none bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="h-4 w-4" /> Rechazar
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
