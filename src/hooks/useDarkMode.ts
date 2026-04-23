import { useState, useEffect } from "react";

export const useDarkMode = (): [boolean, () => void] => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return true; // Default to dark mode for SSR

    const stored = localStorage.getItem("hybridmagDarkMode");
    if (stored === "enabled") return true;
    if (stored === "disabled") return false;

    return true; // Default to dark mode; respects stored preference if set
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const html = document.documentElement;
    if (darkMode) {
      html.classList.add("hm-dark");
      localStorage.setItem("hybridmagDarkMode", "enabled");
    } else {
      html.classList.remove("hm-dark");
      localStorage.setItem("hybridmagDarkMode", "disabled");
    }
  }, [darkMode]);

  const toggle = () => setDarkMode(!darkMode);

  return [darkMode, toggle];
};

