// src/components/Header.jsx
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Header = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          PawTel
        </Typography>
        <Typography variant="subtitle1" sx={{ mr: 2 }}>
          Check In, Wag Out.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button color="inherit" component={RouterLink} to="/">Home</Button>
          <Button color="inherit" component={RouterLink} to="/owners">Owners</Button>
          <Button color="inherit" component={RouterLink} to="/pets">Pets</Button>
          <Button color="inherit" component={RouterLink} to="/passport">Passport</Button>
          <Button color="inherit" component={RouterLink} to="/reports">Reports</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;