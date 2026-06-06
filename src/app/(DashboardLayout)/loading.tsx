"use client";
import { Box, CircularProgress } from "@mui/material";

const Loading = () => {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100%"
      minHeight="60vh"
    >
      <CircularProgress size={48} thickness={4} />
    </Box>
  );
};

export default Loading;
