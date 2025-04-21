import { Grid as MuiGrid, GridProps } from "@mui/material";
import React from "react";

interface CustomGridProps extends Omit<GridProps, "item"> {
  container?: boolean;
  size?:
    | number
    | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
  spacing?:
    | number
    | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
  offset?:
    | number
    | "auto"
    | {
        xs?: number | "auto";
        sm?: number | "auto";
        md?: number | "auto";
        lg?: number | "auto";
        xl?: number | "auto";
      };
}

const Grid: React.FC<CustomGridProps> = ({
  container = false,
  size,
  spacing = 0,
  offset,
  children,
  ...props
}) => {
  // Convert our size prop to MUI's item prop format
  const getGridItemProps = () => {
    if (!size) return {};

    if (typeof size === "number") {
      return { xs: size };
    }

    return Object.entries(size).reduce(
      (acc, [breakpoint, value]) => ({
        ...acc,
        [breakpoint]: value,
      }),
      {}
    );
  };

  // Convert our offset prop to MUI's offset format
  const getOffsetProps = () => {
    if (!offset) return {};

    if (typeof offset === "number" || offset === "auto") {
      return { xs: offset };
    }

    return Object.entries(offset).reduce(
      (acc, [breakpoint, value]) => ({
        ...acc,
        [`offset-${breakpoint}`]: value,
      }),
      {}
    );
  };

  return (
    <MuiGrid
      container={container}
      spacing={spacing}
      component="div"
      {...getGridItemProps()}
      {...getOffsetProps()}
      {...props}
    >
      {children}
    </MuiGrid>
  );
};

export default Grid;
