import { Box, Typography, Container, Divider } from '@mui/material';
import logo from '../assets/site-logo.svg';

const Footer = () => {
  return (
    <Box component="footer" sx={{ mt: 'auto' }}>
      <Divider />
      <Box sx={{ py: 3, backgroundColor: '#f5f5f5' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
            <img src={logo} alt="PawTel" style={{ height: 30, marginRight: 10 }} />
            <Typography variant="h6" color="text.primary">PawTel</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" align="center" fontStyle="italic">
            "Check In, Wag Out".
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} PawTel. Designed by Anastacia Sax. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Footer;