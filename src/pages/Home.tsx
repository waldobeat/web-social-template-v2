import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { TrendingUp, MessageSquare, ChevronRight, Star, Shield, Zap, BookOpen } from 'lucide-react';

const companies = [
  {
    name: 'Cashea',
    slogan: 'Compra en cuotas sin interés',
    description:
      'Cashea te permite comprar en tus tiendas favoritas y pagar en cuotas sin ningún interés. Es ideal para venezolanos que quieren adquirir productos del hogar, tecnología o ropa sin endeudarse de más.',
    gradient: 'from-violet-500 to-indigo-600',
    glow: 'shadow-violet-500/20',
    accent: 'text-violet-400',
    border: 'border-violet-500/20',
    bg: 'bg-violet-500/10',
    emoji: '🛍️',
    url: 'https://www.cashea.app/',
    tags: ['0% interés', 'Cuotas flexibles', 'Sin tarjeta'],
  },
  {
    name: 'Krece',
    slogan: 'Tu vida financiera, más simple',
    description:
      'Krece es una plataforma venezolana de crédito digital. Te ofrece líneas de crédito personales para que puedas acceder a financiamiento rápido, sin los tediosos trámites bancarios tradicionales.',
    gradient: 'from-emerald-500 to-teal-600',
    glow: 'shadow-emerald-500/20',
    accent: 'text-emerald-400',
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/10',
    emoji: '📱',
    url: 'https://www.krece.app/',
    tags: ['Crédito digital', 'Rápido', 'Sin papeles'],
  },
  {
    name: 'Credix',
    slogan: 'Crédito inteligente para Venezuela',
    description:
      'Credix ofrece soluciones de crédito y financiamiento adaptadas a la realidad venezolana. Conecta a personas y negocios con opciones de crédito responsable, ayudando a construir historial financiero.',
    gradient: 'from-amber-500 to-orange-600',
    glow: 'shadow-amber-500/20',
    accent: 'text-amber-400',
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/10',
    emoji: '🏦',
    url: 'https://credix.net/',
    tags: ['Historial crediticio', 'Para negocios', 'Confiable'],
  },
];

const features = [
  { icon: BookOpen, title: 'Información Clara', desc: 'Guías explicativas sobre cada plataforma de préstamos en Venezuela', color: 'text-violet-400', bg: 'bg-violet-500/10' },
  { icon: MessageSquare, title: 'Foro Abierto', desc: 'Comparte tu experiencia y lee opiniones reales de otros usuarios', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { icon: Shield, title: 'Sin tabú', desc: 'Espacio seguro para hablar de finanzas sin censura ni prejuicios', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { icon: Zap, title: 'Comunidad activa', desc: 'Miles de venezolanos compartiendo tips y recomendaciones', color: 'text-teal-400', bg: 'bg-teal-500/10' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] text-gray-200">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px]" />
          <div className="absolute top-20 right-1/4 w-72 h-72 bg-violet-600/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400">
            <Star className="h-3 w-3 fill-current" />
            La comunidad financiera de Venezuela
          </div>

          <h1 className="mb-6 text-5xl md:text-7xl font-black tracking-tight text-white leading-tight">
            Entiende los
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-violet-400 bg-clip-text text-transparent">
              Préstamos en VE
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-400 leading-relaxed">
            Todo lo que necesitas saber sobre Cashea, Krece y Credix explicado de forma simple. 
            Además, únete al foro y habla sin tapujos sobre finanzas con la comunidad venezolana.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/prestamos"
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:scale-105"
            >
              Ver guía de préstamos
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/foro"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-white/10"
            >
              <MessageSquare className="h-4 w-4" />
              Ir al Foro
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 transition-all hover:border-white/10 hover:bg-white/[0.06]">
              <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <h3 className="mb-1 text-sm font-bold text-white">{title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Companies Preview */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-400 uppercase tracking-widest">Casas de Préstamo</span>
          </div>
          <h2 className="mb-10 text-3xl md:text-4xl font-black text-white">
            Las 3 grandes plataformas
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {companies.map((c) => (
              <div
                key={c.name}
                className={`group relative rounded-2xl border ${c.border} bg-white/[0.03] p-6 transition-all hover:bg-white/[0.06] hover:shadow-2xl ${c.glow}`}
              >
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${c.gradient} text-2xl shadow-lg`}>
                  {c.emoji}
                </div>
                <h3 className="mb-1 text-xl font-black text-white">{c.name}</h3>
                <p className={`mb-3 text-xs font-semibold ${c.accent}`}>{c.slogan}</p>
                <p className="mb-4 text-sm text-gray-400 leading-relaxed line-clamp-3">{c.description}</p>
                <div className="mb-5 flex flex-wrap gap-2">
                  {c.tags.map((tag) => (
                    <span key={tag} className={`rounded-full border ${c.border} ${c.bg} px-2.5 py-0.5 text-xs font-medium ${c.accent}`}>
                      {tag}
                    </span>
                  ))}
                </div>
                <Link
                  to="/prestamos"
                  className={`flex items-center gap-1 text-xs font-semibold ${c.accent} transition-all group-hover:gap-2`}
                >
                  Ver guía completa <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Foro */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-900/30 via-teal-900/20 to-violet-900/30 p-10 text-center">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-emerald-500/10 rounded-full blur-[60px]" />
            </div>
            <div className="relative">
              <div className="mb-3 text-4xl">💬</div>
              <h2 className="mb-3 text-3xl font-black text-white">Únete al Foro</h2>
              <p className="mx-auto mb-8 max-w-lg text-gray-400">
                Pregunta, opina y comparte tu experiencia real con Cashea, Krece, Credix y cualquier otro tema financiero. Aquí no hay tabú.
              </p>
              <Link
                to="/foro"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 text-sm font-bold text-black transition-all hover:bg-gray-100 hover:shadow-xl hover:shadow-white/10"
              >
                <MessageSquare className="h-4 w-4" />
                Entrar al Foro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-4 py-8 text-center text-xs text-gray-600">
        <p>© 2025 PrestamoVE · Comunidad financiera venezolana · Información con fines educativos</p>
      </footer>
    </div>
  );
}
