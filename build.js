#!/usr/bin/env node
/**
 * Build script: takes wishlist-mira.jsx and wraps it in a standalone HTML page.
 * Replaces window.storage calls with fetch to the backend API.
 */
const fs = require('fs');
const path = require('path');

const jsxPath = path.join(__dirname, 'wishlist-mira.jsx');
let jsx = fs.readFileSync(jsxPath, 'utf-8');

// Remove ES module import/export
jsx = jsx.replace(/^import .+ from .+;?\n/gm, '');
jsx = jsx.replace(/^export default /m, '');

// Add React destructuring at the top
jsx = `const { useState, useEffect } = React;\n\n// API backend URL (Cloudflare Worker). Set to null to use localStorage fallback.\nconst API_URL = window.__WISHLIST_API__ || null;\nconst STORAGE_KEY_LOCAL = "mira-wishlist-reservations";\n\n` + jsx;

// Replace the storage functions with API+localStorage hybrid
const oldLoadReservations = `  async function loadReservations() {
    try {
      const result = await window.storage.get(STORAGE_KEY, true);
      if (result && result.value) {
        setReservations(JSON.parse(result.value));
      }
    } catch (e) {
      console.log("No reservations yet");
    }
    setLoading(false);
  }`;

const newLoadReservations = `  async function loadReservations() {
    try {
      if (API_URL) {
        const res = await fetch(API_URL);
        if (res.ok) {
          const data = await res.json();
          setReservations(data);
          setLoading(false);
          return;
        }
      }
      // Fallback to localStorage
      const stored = localStorage.getItem(STORAGE_KEY_LOCAL);
      if (stored) setReservations(JSON.parse(stored));
    } catch (e) {
      console.log("No reservations yet");
      const stored = localStorage.getItem(STORAGE_KEY_LOCAL);
      if (stored) setReservations(JSON.parse(stored));
    }
    setLoading(false);
  }`;

jsx = jsx.replace(oldLoadReservations, newLoadReservations);

const oldSaveReservation = `  async function saveReservation(itemId, name) {
    const updated = { ...reservations, [itemId]: name };
    setReservations(updated);
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify(updated), true);
      setToast(\`✅ Подарок забронирован!\`);
    } catch (e) {
      setToast("⚠️ Ошибка сохранения");
    }
  }`;

const newSaveReservation = `  async function saveReservation(itemId, name) {
    const updated = { ...reservations, [itemId]: name };
    setReservations(updated);
    try {
      if (API_URL) {
        await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId, name }),
        });
      }
      localStorage.setItem(STORAGE_KEY_LOCAL, JSON.stringify(updated));
      setToast("✅ Подарок забронирован!");
    } catch (e) {
      localStorage.setItem(STORAGE_KEY_LOCAL, JSON.stringify(updated));
      setToast("✅ Подарок забронирован!");
    }
  }`;

jsx = jsx.replace(oldSaveReservation, newSaveReservation);

const oldCancelReservation = `  async function cancelReservation(itemId) {
    const updated = { ...reservations };
    delete updated[itemId];
    setReservations(updated);
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify(updated), true);
      setToast("Бронирование отменено");
    } catch (e) {
      setToast("⚠️ Ошибка");
    }
  }`;

const newCancelReservation = `  async function cancelReservation(itemId) {
    const updated = { ...reservations };
    delete updated[itemId];
    setReservations(updated);
    try {
      if (API_URL) {
        await fetch(API_URL, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId }),
        });
      }
      localStorage.setItem(STORAGE_KEY_LOCAL, JSON.stringify(updated));
      setToast("Бронирование отменено");
    } catch (e) {
      localStorage.setItem(STORAGE_KEY_LOCAL, JSON.stringify(updated));
      setToast("⚠️ Ошибка");
    }
  }`;

jsx = jsx.replace(oldCancelReservation, newCancelReservation);

// Remove the now-unused STORAGE_KEY constant
jsx = jsx.replace(/^const STORAGE_KEY = .+;\n/m, '');

// Add ReactDOM.render at the bottom
jsx += `\nReactDOM.createRoot(document.getElementById("root")).render(<MiraWishlist />);\n`;

const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Вишлист для Миры 🎂</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎂</text></svg>">
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @keyframes twinkle { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.5); } }
    @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    @keyframes toastIn { from { transform: translateX(-50%) translateY(20px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }
    .wishlist-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .wishlist-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.08); }
    .reserve-btn { transition: all 0.2s ease; cursor: pointer; }
    .reserve-btn:hover { transform: scale(1.03); filter: brightness(1.05); }
    .reserve-btn:active { transform: scale(0.98); }
    .link-btn { transition: all 0.2s ease; }
    .link-btn:hover { background: rgba(0,0,0,0.04); }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    // Set API URL here after deploying the Cloudflare Worker:
    // window.__WISHLIST_API__ = "https://mira-wishlist.YOUR_SUBDOMAIN.workers.dev/api/reservations";
  </script>
  <script type="text/babel">
${jsx}
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'index.html'), html, 'utf-8');
console.log('✅ index.html built successfully');
