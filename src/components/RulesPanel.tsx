import { useState } from 'react';

export default function RulesPanel() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl border border-iron bg-metal/80 shadow-lg backdrop-blur-md overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-3 text-left hover:bg-iron/50 transition-colors"
      >
        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            protocolo_de_juego
          </h2>
          {!isOpen && (
            <p className="mt-0.5 text-[9px] text-gray-600">
              [ CLICK PARA EXPANDIR MANUAL ]
            </p>
          )}
        </div>
        <span className="text-neon-green text-xs transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="border-t border-iron bg-concrete/80 px-3 pb-3 pt-2">
          <div className="space-y-2.5">
            <div>
              <h3 className="text-[9px] font-bold uppercase tracking-widest text-neon-green">
                &gt; objetivo
              </h3>
              <p className="mt-1 text-[10px] text-gray-400 leading-relaxed">
                Adivinar la palabra secreta usando similitud semantica por inteligencia artificial (basado en significado y uso, no en rimas u ortografia).
              </p>
            </div>

            <div>
              <h3 className="text-[9px] font-bold uppercase tracking-widest text-neon-green">
                &gt; niveles_de_proximidad
              </h3>
              <ul className="mt-1.5 space-y-1 text-[10px]">
                <li className="flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-neon-green shadow-[0_0_6px_rgba(255,0,255,0.6)]"></span>
                  <span className="text-gray-300"><strong className="text-neon-green">RANGO 1:</strong> ENCONTRADA</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-neon-green shadow-[0_0_6px_rgba(255,0,255,0.4)]"></span>
                  <span className="text-gray-300"><strong className="text-neon-green">RANGOS 1-100:</strong> CERCA</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-neon-yellow shadow-[0_0_6px_rgba(255,204,0,0.4)]"></span>
                  <span className="text-gray-300"><strong className="text-neon-yellow">RANGOS 101-300:</strong> TIBIO</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-neon-red shadow-[0_0_6px_rgba(255,0,60,0.4)]"></span>
                  <span className="text-gray-300"><strong className="text-neon-red">RANGOS 301+:</strong> LEJOS</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[9px] font-bold uppercase tracking-widest text-neon-green">
                &gt; parametros_del_sistema
              </h3>
              <ul className="mt-1.5 space-y-0.5 text-[10px] text-gray-400">
                <li>+ intentos ilimitados</li>
                <li>+ usar sustantivos comunes para iniciar</li>
                <li>+ sin limite de bloqueo</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
