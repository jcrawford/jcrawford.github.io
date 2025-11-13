import React from "react";
import { icons, IconName } from "../../utils/icons";

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  className?: string;
  "aria-label"?: string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = "currentColor",
  className = "",
  "aria-label": ariaLabel,
}) => {
  const IconComponent = icons[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <IconComponent
      size={size}
      color={color}
      className={className}
      aria-label={ariaLabel}
      aria-hidden={!ariaLabel}
    />
  );
};

