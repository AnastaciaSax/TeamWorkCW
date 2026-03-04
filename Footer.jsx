// src/components/Footer.jsx
import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box component="footer" sx={{ py: 3, textAlign: 'center', mt: 'auto' }}>
      <Typography variant="body2" color="text.secondary">
        © {new Date().getFullYear()} PawTel. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;