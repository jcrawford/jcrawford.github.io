import type { GatsbyBrowser } from "gatsby";
import "./src/styles/global.css";

export const onClientEntry: GatsbyBrowser["onClientEntry"] = () => {
  // Theme handling
  const savedTheme = localStorage.getItem('theme');
  const theme = savedTheme === 'light' ? 'light' : 'dark';

  if (theme === 'dark') {
    document.documentElement.classList.add('hm-dark');
  } else {
    document.documentElement.classList.remove('hm-dark');
  }
};

// Ensure GA4 page_view is sent on initial load even if gtag hasn't loaded
// when the plugin's onRouteUpdate fires (gtag script is async).
export const onInitialClientRender: GatsbyBrowser["onInitialClientRender"] = () => {
  function sendPageView() {
    if (typeof window.gtag === "function") {
      window.gtag("event", "page_view", {
        page_path: window.location.pathname + window.location.search + window.location.hash,
      });
    } else {
      // gtag not loaded yet, retry shortly
      setTimeout(sendPageView, 100);
    }
  }
  // Give gtag async script time to load
  setTimeout(sendPageView, 500);
};