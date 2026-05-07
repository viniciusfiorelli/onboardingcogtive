import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

if (['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)) {
  document.documentElement.classList.add('local-performance-mode');
}

createRoot(document.getElementById("root")!).render(<App />);
