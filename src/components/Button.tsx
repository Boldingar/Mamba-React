import { Button as MuiButton, ButtonProps } from "@mui/material";
import React from "react";

interface CustomButtonProps extends Omit<ButtonProps, "variant"> {
  variant?: "contained" | "outlined" | "text";
}

const Button: React.FC<CustomButtonProps> = ({
  variant = "contained",
  color = "primary",
  size = "medium",
  ...props
}) => {
  return <MuiButton variant={variant} color={color} size={size} {...props} />;
};

export default Button;
