import { useState } from 'react';
import Navbar from '../components/Navbar';
import { ChevronDown, ChevronUp, ExternalLink, CheckCircle, AlertTriangle, Info, DollarSign, Clock, Star } from 'lucide-react';

interface FAQItem {
  q: string;
  a: string;
}

interface CompanyData {
  name: string;
  slogan: string;
  gradient: string;
  accent: string;
  border: string;
  bg: string;
  glow: string;
  emoji: string;
  url: string;
  tagline: string;
  what: string;
  how: string[];
  pros: string[];
  cons: string[];
  requirements: string[];
  faq: FAQItem[];
  ideal: string;
}

const companies: CompanyData[] = [
  {
    name: 'Cashea',
    slogan: 'Compra en cuotas sin interés',
    gradient: 'from-violet-500 to-indigo-600',
    accent: 'text-violet-400',
    border: 'border-violet-500/20',
    bg: 'bg-violet-500/10',
    glow: 'shadow-violet-500/20',
    emoji: '🛍️',
    url: 'https://www.cashea.app/',
    tagline: '¿Qué es Cashea?',
    what:
      'Cashea es una fintech venezolana que te permite comprar en cientos de tiendas físicas y digitales, dividiendo el costo en cuotas quincenales o mensuales sin ningún tipo de interés ni recargo oculto. Funciona como un "Buy Now, Pay Later" (BNPL) adaptado al mercado venezolano.',
    how: [
      'Descarga la app de Cashea y crea tu cuenta con tu cédula venezolana.',
      'Cashea evalúa tu perfil y te asigna una línea de crédito inicial.',
      'Vas a una tienda afiliada y en la caja seleccionas "pagar con Cashea".',
      'Eliges en cuántas cuotas quieres pagar (2, 4, 6, etc.).',
      'Cada cuota se debita automáticamente según el plan elegido.',
      'Al cumplir tus pagos, tu límite de crédito puede aumentar.',
    ],
    pros: [
      '0% de interés en todas las compras',
      'No necesitas tarjeta de crédito bancaria',
      'Red amplia de tiendas afiliadas en Venezuela',
      'Aumenta tu historial crediticio',
      'App intuitiva y fácil de usar',
      'Disponible para personas sin historial bancario',
    ],
    cons: [
      'Solo funciona en tiendas afiliadas a la red Cashea',
      'Límite de crédito inicial puede ser bajo',
      'Requiere cumplir pagos puntualmente para mantener el acceso',
      'No disponible para retiro de efectivo',
    ],
    requirements: [
      'Cédula de identidad venezolana vigente',
      'Número de teléfono activo',
      'Correo electrónico',
      'Mayor de 18 años',
    ],
    ideal: 'Para quienes quieren comprar electrodomésticos, ropa, tecnología o artículos del hogar en cuotas sin pagar intereses.',
    faq: [
      { q: '¿Cashea cobra comisiones?', a: 'No. Cashea NO cobra intereses ni comisiones al comprador. Su modelo de negocio se basa en los cobros a las tiendas afiliadas.' },
      { q: '¿Puedo usar Cashea si no tengo cuenta bancaria?', a: 'Sí, Cashea no requiere cuenta bancaria. Solo necesitas tu cédula y un número de teléfono.' },
      { q: '¿Qué pasa si no pago a tiempo?', a: 'Tu crédito puede ser suspendido temporalmente. Cashea puede cobrar una mora y reportar el retraso afectando tu perfil crediticio.' },
    ],
  },
  {
    name: 'Krece',
    slogan: 'Tu vida financiera, más simple',
    gradient: 'from-emerald-500 to-teal-600',
    accent: 'text-emerald-400',
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/10',
    glow: 'shadow-emerald-500/20',
    emoji: '📱',
    url: 'https://www.krece.app/',
    tagline: '¿Qué es Krece?',
    what:
      'Krece es una plataforma venezolana de crédito digital que te ofrece acceso a financiamiento rápido y accesible directamente desde tu teléfono. Su enfoque es simplificar el acceso al crédito sin los engorrosos trámites del sistema bancario tradicional, usando tecnología para evaluar tu perfil y darte una respuesta casi inmediata.',
    how: [
      'Regístrate en la app o web de Krece con tus datos personales.',
      'Krece analiza tu perfil usando datos alternativos (uso del teléfono, comportamiento, etc.).',
      'Te notifican tu límite de crédito aprobado en minutos.',
      'Solicitas el crédito que necesitas y defines el plan de pago.',
      'El dinero o la línea de crédito queda disponible para usar.',
      'Pagas según el plan acordado y tu score va mejorando.',
    ],
    pros: [
      'Proceso 100% digital y rápido',
      'No requiere historial bancario previo',
      'Respuesta en minutos',
      'Ayuda a construir historial crediticio',
      'Montos flexibles según tu perfil',
      'Sin filas ni papeleo físico',
    ],
    cons: [
      'Tasas de interés pueden ser superiores al crédito bancario tradicional',
      'Límite inicial puede ser conservador',
      'Requiere acceso a internet estable',
      'La aprobación no está garantizada para todos los perfiles',
    ],
    requirements: [
      'Cédula de identidad venezolana',
      'Número de teléfono activo',
      'Correo electrónico',
      'Mayor de 18 años',
      'Llenar formulario de solicitud digital',
    ],
    ideal: 'Para quien necesita efectivo o crédito para gastos personales, emergencias o pequeñas inversiones de forma rápida y sin trámites complicados.',
    faq: [
      { q: '¿Krece cobra intereses?', a: 'Sí, Krece cobra intereses, pero sus tasas buscan ser competitivas respecto al mercado informal. Siempre lee los términos antes de aceptar.' },
      { q: '¿Cómo evalúa Krece mi perfil?', a: 'Usa datos alternativos y tecnología de scoring para evaluar tu solvencia, lo que les permite dar crédito a personas sin historial bancario.' },
      { q: '¿Es seguro usar Krece?', a: 'Sí. Es una empresa registrada legalmente en Venezuela. Siempre verifica que estés usando la app oficial.' },
    ],
  },
  {
    name: 'Credix',
    slogan: 'Crédito inteligente para Venezuela',
    gradient: 'from-amber-500 to-orange-600',
    accent: 'text-amber-400',
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/10',
    glow: 'shadow-amber-500/20',
    emoji: '🏦',
    url: 'https://credix.net/',
    tagline: '¿Qué es Credix?',
    what:
      'Credix es una plataforma venezolana que conecta a personas y empresas con opciones de crédito responsable y accesible. Su misión es democratizar el acceso al financiamiento, ayudando a construir un historial crediticio formal que te abra puertas tanto en el ecosistema Credix como en otras instituciones financieras.',
    how: [
      'Accede a credix.net y crea tu perfil personal o empresarial.',
      'Completa el formulario de solicitud con información financiera básica.',
      'Credix evalúa tu solicitud y determina productos disponibles para ti.',
      'Recibes oferta de crédito con monto, tasa y plazo.',
      'Aceptas la oferta y el crédito se desembolsa.',
      'Realizas pagos según el calendario acordado, construyendo historial.',
    ],
    pros: [
      'Diseñado específicamente para la realidad venezolana',
      'Opciones tanto para personas como empresas',
      'Construye historial crediticio formal',
      'Proceso de solicitud sencillo',
      'Variedad de productos financieros',
      'Atención al cliente local',
    ],
    cons: [
      'Puede requerir más documentación que otras plataformas',
      'No todos los perfiles son aprobados',
      'Disponibilidad de productos puede variar por zona',
      'Tasas de interés según riesgo del perfil',
    ],
    requirements: [
      'Cédula de identidad venezolana vigente',
      'Datos de contacto actualizados',
      'Información de ingresos (referencial)',
      'Mayor de 18 años',
      'RIF en caso de solicitud empresarial',
    ],
    ideal: 'Para personas y pequeñas empresas que quieren acceso a crédito formal y desean construir un historial financiero sólido en Venezuela.',
    faq: [
      { q: '¿Credix es para empresas o personas?', a: 'Para ambos. Tienen productos diseñados tanto para personas naturales como para pequeños y medianos negocios venezolanos.' },
      { q: '¿Cuánto tarda la aprobación?', a: 'El tiempo varía según el producto solicitado. Algunas solicitudes se responden en horas, otras pueden tomar días hábiles.' },
      { q: '¿Credix reporta a burós de crédito?', a: 'Sí, Credix trabaja para construir y reportar el historial crediticio de sus usuarios, lo cual es positivo para tu perfil financiero a futuro.' },
    ],
  },
];

function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-white/5 bg-white/[0.03] overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-white hover:bg-white/5 transition-all"
          >
            <span>{item.q}</span>
            {open === i ? <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />}
          </button>
          {open === i && (
            <div className="border-t border-white/5 px-4 py-3 text-sm text-gray-400 leading-relaxed">
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function CompanySection({ company, index }: { company: CompanyData; index: number }) {
  const [tab, setTab] = useState<'como' | 'pros' | 'requisitos' | 'faq'>('como');

  return (
    <section id={company.name.toLowerCase()} className={`py-16 px-4 ${index % 2 === 1 ? 'bg-white/[0.01]' : ''}`}>
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${company.gradient} text-3xl shadow-xl ${company.glow}`}>
              {company.emoji}
            </div>
            <div>
              <h2 className="text-3xl font-black text-white">{company.name}</h2>
              <p className={`text-sm font-semibold ${company.accent}`}>{company.slogan}</p>
            </div>
          </div>
          <a
            href={company.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 rounded-xl border ${company.border} ${company.bg} px-5 py-2.5 text-sm font-semibold ${company.accent} transition-all hover:opacity-80`}
          >
            <ExternalLink className="h-4 w-4" />
            Visitar {company.name}
          </a>
        </div>

        {/* What is */}
        <div className={`mb-8 rounded-2xl border ${company.border} ${company.bg} p-6`}>
          <div className="mb-2 flex items-center gap-2">
            <Info className={`h-4 w-4 ${company.accent}`} />
            <span className={`text-sm font-bold ${company.accent} uppercase tracking-wider`}>{company.tagline}</span>
          </div>
          <p className="text-gray-300 leading-relaxed">{company.what}</p>
        </div>

        {/* Ideal para */}
        <div className="mb-8 flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-4">
          <Star className={`h-5 w-5 ${company.accent} mt-0.5 flex-shrink-0`} />
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ideal para</span>
            <p className="mt-1 text-sm text-gray-300">{company.ideal}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {([
            { key: 'como', label: '¿Cómo funciona?', icon: Clock },
            { key: 'pros', label: 'Ventajas y desventajas', icon: CheckCircle },
            { key: 'requisitos', label: 'Requisitos', icon: DollarSign },
            { key: 'faq', label: 'Preguntas frecuentes', icon: Info },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                tab === key
                  ? `${company.bg} ${company.accent} border ${company.border}`
                  : 'text-gray-500 hover:text-gray-300 border border-transparent hover:border-white/10'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'como' && (
          <div className="space-y-3">
            {company.how.map((step, i) => (
              <div key={i} className="flex items-start gap-4 rounded-xl border border-white/5 bg-white/[0.03] p-4">
                <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${company.gradient} text-xs font-black text-white`}>
                  {i + 1}
                </div>
                <p className="text-sm text-gray-300 leading-relaxed pt-0.5">{step}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'pros' && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
              <div className="mb-4 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-bold text-emerald-400">Ventajas</span>
              </div>
              <ul className="space-y-2">
                {company.pros.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-bold text-amber-400">Consideraciones</span>
              </div>
              <ul className="space-y-2">
                {company.cons.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {tab === 'requisitos' && (
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
            <ul className="space-y-3">
              {company.requirements.map((r, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle className={`h-4 w-4 ${company.accent} flex-shrink-0`} />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === 'faq' && <FAQAccordion items={company.faq} />}
      </div>
    </section>
  );
}

export default function Prestamos() {
  return (
    <div className="min-h-screen bg-[#050505] text-gray-200">
      <Navbar />

      {/* Page header */}
      <div className="relative overflow-hidden border-b border-white/5 px-4 py-16 text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-80 h-80 bg-emerald-600/8 rounded-full blur-[100px]" />
          <div className="absolute top-10 right-1/3 w-60 h-60 bg-violet-600/8 rounded-full blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-gray-400">
            📚 Guía educativa · Sin afiliación comercial
          </div>
          <h1 className="mb-4 text-4xl md:text-6xl font-black text-white">
            Casas de{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-violet-400 bg-clip-text text-transparent">
              Préstamos
            </span>
          </h1>
          <p className="text-gray-400 text-lg">
            Guía completa y sin tecnicismos sobre las principales plataformas de crédito y financiamiento en Venezuela.
          </p>

          {/* Quick nav */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {['Cashea', 'Krece', 'Credix'].map((name) => (
              <a
                key={name}
                href={`#${name.toLowerCase()}`}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 transition-all hover:bg-white/10 hover:text-white"
              >
                {name}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Companies */}
      {companies.map((company, index) => (
        <CompanySection key={company.name} company={company} index={index} />
      ))}

      {/* Disclaimer */}
      <div className="border-t border-white/5 px-4 py-8">
        <div className="mx-auto max-w-3xl rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-400 mb-1">Aviso importante</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Esta guía tiene fines puramente educativos. PrestamoVE no tiene afiliación comercial con Cashea, Krece ni Credix. 
                Siempre lee los términos y condiciones de cada plataforma antes de solicitar cualquier crédito. 
                Las condiciones pueden cambiar; visita los sitios oficiales para información actualizada.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
