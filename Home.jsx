// src/pages/Home/Home.jsx
import { Typography, Paper } from '@mui/material';

const Home = () => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome to PawTel
      </Typography>
      <Typography variant="body1">
        Select a section from the menu above to manage clients, pets, passports, or reports.
      </Typography>
    </Paper>
  );
};

export default Home;