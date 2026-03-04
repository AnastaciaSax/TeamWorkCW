import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import logo from '../assets/site-logo.svg';

const Header = () => {
  return (
    <AppBar position="static">
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Левая часть – логотип и название */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <img src={logo} alt="PawTel" style={{ height: 40 }} />
          <Typography variant="h6" component="div">
            PawTel
          </Typography>
        </Box>
        {/* Правая часть – навигация */}
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