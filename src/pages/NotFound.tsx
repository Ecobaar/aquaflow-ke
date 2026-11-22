import { Link as RouterLink, useLocation } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";

const NotFound = () => {
  const location = useLocation();

  return (
    <Box sx={{ textAlign: "center", py: 8 }}>
      <Typography variant="h3" fontWeight="bold" gutterBottom>
        404
      </Typography>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        Page not found: {location.pathname}
      </Typography>
      <Button component={RouterLink} to="/" variant="contained" sx={{ mt: 2 }}>
        Return to Home
      </Button>
    </Box>
  );
};

export default NotFound;
