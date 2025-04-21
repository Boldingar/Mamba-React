import { TextField as MuiTextField, TextFieldProps } from "@mui/material";
import React from "react";

interface CustomTextFieldProps extends Omit<TextFieldProps, "variant"> {
  fullWidth?: boolean;
}

const TextField: React.FC<CustomTextFieldProps> = ({
  fullWidth = true,
  size = "small",
  ...props
}) => {
  return (
    <MuiTextField
      fullWidth={fullWidth}
      size={size}
      variant="outlined"
      {...props}
    />
  );
};

export default TextField;
