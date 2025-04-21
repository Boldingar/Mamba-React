import { IconButton as MuiIconButton, IconButtonProps } from "@mui/material";
import React from "react";

interface CustomIconButtonProps extends IconButtonProps {
  size?: "small" | "medium" | "large";
}

const IconButton: React.FC<CustomIconButtonProps> = ({
  color = "primary",
  size = "medium",
  ...props
}) => {
  return <MuiIconButton color={color} size={size} {...props} />;
};

export default IconButton;
