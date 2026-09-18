interface TelegramWebApp {
  ready(): void;
  expand(): void;
  colorScheme?: string;
  themeParams?: { bg_color?: string; text_color?: string };
  BackButton?: { show(): void; hide(): void; onClick(cb: () => void): void; offClick(cb: () => void): void };
}
declare global {
  interface Window { Telegram?: { WebApp?: TelegramWebApp } }
}
export function telegramApp() { return window.Telegram?.WebApp; }
export function initializeTelegram() {
  const app = telegramApp();
  if (!app) return;
  app.ready();
  app.expand();
  document.documentElement.classList.toggle('telegram-dark', app.colorScheme === 'dark');
}
