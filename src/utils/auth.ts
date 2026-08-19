export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

// SHA-256 de "192027Mega$$" es "459DE61CB83D41EA925D79986EE044AAB37B235055F4CE844799C834FC564685"
export const MASTER_HASH = "459DE61CB83D41EA925D79986EE044AAB37B235055F4CE844799C834FC564685";
export const MASTER_USER = "waldobeatmaker";
