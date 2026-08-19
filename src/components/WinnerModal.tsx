interface WinnerModalProps {
  winner: string;
}

export default function WinnerModal({ winner }: WinnerModalProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-neon-green bg-black/50 shadow-[0_0_50px_rgba(57,255,20,0.5)] transform animate-bounce-in">
        {/* Placeholder for Avatar */}
        <div className="h-32 w-32 rounded-full border-4 border-neon-green overflow-hidden shadow-[0_0_30px_rgba(57,255,20,0.8)] mb-6 bg-gray-800 flex items-center justify-center">
          <span className="text-5xl font-bold text-gray-500">{winner.charAt(0).toUpperCase()}</span>
        </div>
        
        <h2 className="text-4xl font-extrabold tracking-widest text-white mb-2 text-center drop-shadow-lg">
          ¡<span className="text-neon-green">{winner}</span> ACERTÓ!
        </h2>
        <p className="text-xl font-mono text-gray-300 tracking-wider">
          OBJETIVO DESBLOQUEADO
        </p>
      </div>
    </div>
  );
}
