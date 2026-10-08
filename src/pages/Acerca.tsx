import Navbar from '../components/Navbar';
import { Heart, Globe, MessageSquare, BookOpen, ShieldCheck, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Acerca() {
  return (
    <div className="min-h-screen bg-[#050505] text-gray-200">
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 py-16">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 text-3xl shadow-2xl shadow-emerald-500/30">
              <DollarSign className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-white mb-3">
            Acerca de <span className="text-emerald-400">PrestamoVE</span>
          </h1>
          <p className="text-gray-400 leading-relaxed max-w-lg mx-auto">
            Una plataforma comunitaria creada por venezolanos, para venezolanos. 
            Nuestro propósito es democratizar la información financiera y crear un espacio de conversación real y sin filtros.
          </p>
        </div>

        {/* Mission cards */}
        <div className="mb-12 grid gap-4">
          {[
            {
              icon: BookOpen,
              color: 'text-violet-400',
              bg: 'bg-violet-500/10',
              border: 'border-violet-500/20',
              title: 'Educación financiera accesible',
              desc: 'Explicamos Cashea, Krece, Credix y otras plataformas de forma simple, sin tecnicismos innecesarios. Queremos que cualquier venezolano pueda tomar decisiones financieras informadas.',
            },
            {
              icon: MessageSquare,
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/10',
              border: 'border-emerald-500/20',
              title: 'Comunidad abierta y sin tabú',
              desc: 'Creemos que hablar de dinero no debería ser un tabú. En nuestro foro puedes compartir tu experiencia real con préstamos, consultar dudas y aprender de otros usuarios.',
            },
            {
              icon: ShieldCheck,
              color: 'text-teal-400',
              bg: 'bg-teal-500/10',
              border: 'border-teal-500/20',
              title: 'Sin afiliaciones comerciales',
              desc: 'No somos empleados ni representantes de ninguna casa de préstamos. La información que compartimos es de carácter educativo y está basada en datos públicamente disponibles.',
            },
            {
              icon: Globe,
              color: 'text-amber-400',
              bg: 'bg-amber-500/10',
              border: 'border-amber-500/20',
              title: 'Hecho para la realidad venezolana',
              desc: 'Venezuela tiene una realidad económica única. Esta plataforma fue creada entendiendo ese contexto: dolarización, inflación, falta de acceso bancario y el crecimiento de las fintech locales.',
            },
          ].map(({ icon: Icon, color, bg, border, title, desc }) => (
            <div key={title} className={`flex gap-4 rounded-2xl border ${border} ${bg} p-5`}>
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-black/20`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <Heart className="mx-auto mb-3 h-8 w-8 text-rose-400" />
          <h2 className="mb-2 text-xl font-black text-white">Construido con ❤️ por la comunidad</h2>
          <p className="mb-6 text-sm text-gray-500">
            Si tienes sugerencias, correcciones o quieres aportar información, únete al foro y participa.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/foro"
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/40"
            >
              Ir al Foro
            </Link>
            <Link
              to="/prestamos"
              className="rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-white/10"
            >
              Ver guía de préstamos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
