import { useState, useEffect } from "react";

export const useDarkMode = (): [boolean, () => void] => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;

    const stored = localStorage.getItem("hybridmagDarkMode");
    if (stored === "enabled") return true;
    if (stored === "disabled") return false;

    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const html = document.documentElement;
    if (darkMode) {
      html.classList.add("dark");
      localStorage.setItem("hybridmagDarkMode", "enabled");
    } else {
      html.classList.remove("dark");
      localStorage.setItem("hybridmagDarkMode", "disabled");
    }
  }, [darkMode]);

  const toggle = () => setDarkMode(!darkMode);

  return [darkMode, toggle];
};

