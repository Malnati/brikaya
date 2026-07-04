// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import { registerServiceWorker } from "./registerServiceWorker";
import "./styles/index.css";
import { ROOT_ELEMENT_ID } from "./constants/game";
import { I18nProvider } from "./i18n";

declare global {
  interface Window {
    mainTsxLoaded: boolean;
  }
}
window.mainTsxLoaded = true;
registerServiceWorker();

ReactDOM.createRoot(document.getElementById(ROOT_ELEMENT_ID)!).render(
  <React.StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </React.StrictMode>,
);
