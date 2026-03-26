export interface BotValidation { isApproved: boolean; reason?: string; }

export const BOTS: Record<string, { name: string; validate: (text: string) => BotValidation }> = {
  'Bot_Glow': {
    name: 'Bot_Glow (Moderadora c/Maquillaje)',
    validate: (text: string) => {
      const lower = text.toLowerCase();
      if (lower.includes('fea') || lower.includes('gorda') || lower.includes('horrible')) {
        return { isApproved: false, reason: 'Bot_Glow: No permitimos críticas destructivas al físico aquí. 💖' };
      }
      return { isApproved: true };
    }
  },
  'Bot_Admin': {
    name: 'Bot_Admin (General)',
    validate: (text: string) => {
      const lower = text.toLowerCase();
      if (lower.includes('compro') || lower.includes('vendo') || lower.includes('spam')) {
        return { isApproved: false, reason: 'Bot_Admin: El spam de ventas no está permitido. 🛑' };
      }
      return { isApproved: true };
    }
  },
  'Universal_Mod': {
    name: 'Moderación Universal',
    validate: (text: string) => {
      const lower = text.toLowerCase();
      // Bloqueo de enlaces (URL pattern)
      const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;
      if (urlRegex.test(text)) {
        return { isApproved: false, reason: 'Moderación Universal: Los enlaces no están permitidos por seguridad. 🚫' };
      }
      // Bloqueo de groserías (provisional list)
      const badWords = ['puta', 'perra', 'maldita', 'estupida', 'idiota', 'culia', 'mierda', 'coño', 'carajo', 'pendeja'];
      if (badWords.some(word => lower.includes(word))) {
        return { isApproved: false, reason: 'Moderación Universal: Mantén un lenguaje respetuoso con la comunidad. ✨' };
      }
      // Bloqueo de NSFW / Armas / Violencia
      const forbidden = ['sexo', 'porn', 'xxx', 'arma', 'pistola', 'cuchillo', 'sangre', 'matar', 'muerte', 'droga'];
      if (forbidden.some(f => lower.includes(f))) {
        return { isApproved: false, reason: 'Moderación Universal: Este tipo de contenido atenta contra nuestras normas de convivencia. 🛑' };
      }
      return { isApproved: true };
    }
  }
};

export const onNewContent = async (content: string, botId: string): Promise<BotValidation> => {
  // Simula el tiempo de procesamiento de IA del Bot (1 segundo)
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Siempre aplicamos la moderación universal primero
  const universalResult = BOTS['Universal_Mod'].validate(content);
  if (!universalResult.isApproved) return universalResult;

  const bot = BOTS[botId];
  if (!bot) return { isApproved: true };
  
  return bot.validate(content);
};
