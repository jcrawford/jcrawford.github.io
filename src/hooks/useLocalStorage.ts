import { useState, useEffect } from "react";

export const useLocalStorage = <T>(
  key: string,
  defaultValue: T
): [T, (value: T) => void, () => void] => {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue;

    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, value]);

  const removeValue = () => {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(key);
      setValue(defaultValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [value, setValue, removeValue];
};

