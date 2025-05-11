import * as React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { SitemarkIcon } from "./CustomIcons";

export default function Content() {
  return (
    <Stack
      sx={{
        flexDirection: "column",
        height: "90vh",
        width: "40vw",
        margin: "auto",
        position: "relative",
      }}
    >
      <Box
        component="img"
        src="/MambaSide.png"
        alt="Mamba Side"
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          borderRadius: 4,
        }}
      />
    </Stack>
  );
}
