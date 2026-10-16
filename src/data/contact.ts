/**
 * Contacto: datos y builders de links.
 *
 * El teléfono y el email viven acá para que ningún componente los hardcodee:
 * `waLink()` y `mailtoLink()` son la única forma de armar esos links.
 */

export const CONTACT = {
  whatsapp: "393447817557",
  email: "julianrecarteweb@gmail.com",
} as const;

/** WhatsApp con mensaje precargado (en el idioma del visitante). */
export function waLink(message = ""): string {
  const base = `https://wa.me/${CONTACT.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** `mailto:` con asunto ya escrito, para que el email no llegue sin contexto. */
export function mailtoLink(subject: string): string {
  return `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}`;
}
