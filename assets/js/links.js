import { CONTACTS } from './config.js';

const MAX_TEXT = 500;

export function telegramLink(text) {
  if (!text) return CONTACTS.telegram;
  return `${CONTACTS.telegram}?text=${encodeURIComponent(String(text).slice(0, MAX_TEXT))}`;
}

export function telLink() {
  return `tel:${CONTACTS.phone}`;
}

export function mailLink() {
  return `mailto:${CONTACTS.email}`;
}
