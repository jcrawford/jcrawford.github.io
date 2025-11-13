import React, { useEffect, useRef } from "react";
import { CloseIcon, SearchIcon } from "../../utils/icons";

export interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      inputRef.current?.focus();
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-start justify-center pt-20 px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div
        className="w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <SearchIcon
            size={24}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            ref={inputRef}
            type="search"
            placeholder="Search articles... (UI only - functionality not implemented)"
            className="w-full pl-14 pr-14 py-5 bg-background-content text-text-main text-lg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Search articles"
          />
          <button
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-hover transition-colors"
            aria-label="Close search"
          >
            <CloseIcon size={24} />
          </button>
        </div>

        <div className="mt-8 text-center text-white text-sm">
          <p>Search functionality is a UI placeholder.</p>
          <p className="mt-2">Press Escape or click outside to close.</p>
        </div>
      </div>
    </div>
  );
};
