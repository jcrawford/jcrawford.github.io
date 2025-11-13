import React from "react";

export interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export const SearchIcon: React.FC<IconProps> = ({ size = 24, color = "currentColor", className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} className={className}>
    <circle cx="11" cy="11" r="8" strokeWidth="2" />
    <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const MoonIcon: React.FC<IconProps> = ({ size = 24, color = "currentColor", className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export const SunIcon: React.FC<IconProps> = ({ size = 24, color = "currentColor", className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} className={className}>
    <circle cx="12" cy="12" r="5" strokeWidth="2" />
    <line x1="12" y1="1" x2="12" y2="3" strokeWidth="2" strokeLinecap="round" />
    <line x1="12" y1="21" x2="12" y2="23" strokeWidth="2" strokeLinecap="round" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" strokeWidth="2" strokeLinecap="round" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" strokeWidth="2" strokeLinecap="round" />
    <line x1="1" y1="12" x2="3" y2="12" strokeWidth="2" strokeLinecap="round" />
    <line x1="21" y1="12" x2="23" y2="12" strokeWidth="2" strokeLinecap="round" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" strokeWidth="2" strokeLinecap="round" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const MenuIcon: React.FC<IconProps> = ({ size = 24, color = "currentColor", className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} className={className}>
    <line x1="3" y1="12" x2="21" y2="12" strokeWidth="2" strokeLinecap="round" />
    <line x1="3" y1="6" x2="21" y2="6" strokeWidth="2" strokeLinecap="round" />
    <line x1="3" y1="18" x2="21" y2="18" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const CloseIcon: React.FC<IconProps> = ({ size = 24, color = "currentColor", className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} className={className}>
    <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" strokeLinecap="round" />
    <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ size = 24, color = "currentColor", className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} className={className}>
    <polyline points="6 9 12 15 18 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChevronRightIcon: React.FC<IconProps> = ({ size = 24, color = "currentColor", className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} className={className}>
    <polyline points="9 18 15 12 9 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const FacebookIcon: React.FC<IconProps> = ({ size = 24, color = "currentColor", className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export const TwitterIcon: React.FC<IconProps> = ({ size = 24, color = "currentColor", className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  </svg>
);

export const LinkedInIcon: React.FC<IconProps> = ({ size = 24, color = "currentColor", className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export const GithubIcon: React.FC<IconProps> = ({ size = 24, color = "currentColor", className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

export const InstagramIcon: React.FC<IconProps> = ({ size = 24, color = "currentColor", className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth="2" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" strokeWidth="2" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const icons = {
  search: SearchIcon,
  moon: MoonIcon,
  sun: SunIcon,
  menu: MenuIcon,
  close: CloseIcon,
  chevronDown: ChevronDownIcon,
  chevronRight: ChevronRightIcon,
  facebook: FacebookIcon,
  twitter: TwitterIcon,
  linkedin: LinkedInIcon,
  github: GithubIcon,
  instagram: InstagramIcon,
};

export type IconName = keyof typeof icons;

