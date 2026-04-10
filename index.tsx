import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

console.log("MZ+ System: Starting initialization...");

// Global error handling
window.addEventListener('error', (event) => {
  console.error("MZ+ Global Error:", event.error);
  const root = document.getElementById('root');
  if (root && root.innerHTML === "") {
    root.innerHTML = `
      <div style="background: #050505; color: white; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: sans-serif; padding: 20px; text-align: center;">
        <h1 style="color: #ca8a04;">Erreur de Chargement</h1>
        <p style="color: #888; font-size: 14px;">Une erreur critique empêche l'application de démarrer.</p>
        <pre style="background: #111; padding: 10px; border-radius: 8px; font-size: 10px; color: #f87171; max-width: 100%; overflow: auto;">${event.error?.message || 'Erreur inconnue'}</pre>
        <button onclick="localStorage.clear(); sessionStorage.clear(); location.reload();" style="margin-top: 20px; padding: 12px 24px; background: #ca8a04; border: none; border-radius: 8px; color: black; font-weight: bold; cursor: pointer;">Réinitialiser et Réessayer</button>
      </div>
    `;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message === 'Failed to fetch') {
    console.warn('MZ+ System: Network fetch failed. This may be due to a slow connection or Supabase project status.');
    // Prevent the error from crashing the app
    event.preventDefault();
  }
});

const mountApp = () => {
  try {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      console.error("MZ+ System: Root element not found");
      return;
    }

    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("MZ+ System: React rendered successfully.");
  } catch (error) {
    console.error("MZ+ System: Mounting error:", error);
    throw error;
  }
};

// On s'assure que le DOM est prêt avant de monter
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}