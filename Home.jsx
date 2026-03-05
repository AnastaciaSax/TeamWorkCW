import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Box,
  CircularProgress,
} from '@mui/material';
import {
  People as PeopleIcon,
  Pets as PetsIcon,
  CardMembership as PassportIcon,
  Assessment as ReportsIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import API from '../../services/api';

const Home = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await API.get('/analytics/summary');
        setAnalytics(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to load analytics', err);
        setError('Could not load summary data');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const cards = [
    {
      title: 'Owners',
      description: 'Manage pet owners – add, edit, or remove owner details.',
      icon: <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      path: '/owners',
      count: analytics?.owners,
    },
    {
      title: 'Pets',
      description: 'Browse and manage all pets, view detailed profiles, track health.',
      icon: <PetsIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      path: '/pets',
      count: analytics?.pets,
    },
    {
      title: 'Passport',
      description: 'Search pet passports, manage vaccinations and expiration dates.',
      icon: <PassportIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      path: '/passport',
    },
    {
      title: 'Reports',
      description: 'Generate and export detailed reports on pets, owners, and vaccinations.',
      icon: <ReportsIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      path: '/reports',
    },
  ];

  return (
    <Box>
      {/* Hero section */}
      <Paper sx={{ p: 4, mb: 4, textAlign: 'center', background: 'linear-gradient(135deg, #d4a971 0%, #b38b5a 100%)', color: 'white' }}>
        <Typography variant="h3" gutterBottom fontWeight="bold">
          Welcome to PawTel
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Check In, Wag Out. – Your all-in-one pet hotel management system.
        </Typography>
      </Paper>

      {/* Analytics summary */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" align="center">{error}</Typography>
      ) : analytics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: 'center', py: 2, bgcolor: '#f8f9fa' }}>
              <CardContent>
                <PeopleIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                <Typography variant="h4">{analytics.owners}</Typography>
                <Typography variant="body1" color="text.secondary">Total Owners</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: 'center', py: 2, bgcolor: '#f8f9fa' }}>
              <CardContent>
                <PetsIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                <Typography variant="h4">{analytics.pets}</Typography>
                <Typography variant="body1" color="text.secondary">Total Pets</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: 'center', py: 2, bgcolor: '#f8f9fa' }}>
              <CardContent>
                <WarningIcon sx={{ fontSize: 48, color: 'secondary.main' }} />
                <Typography variant="h4">{analytics.expiringVaccinations}</Typography>
                <Typography variant="body1" color="text.secondary">Expiring Vaccinations</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Feature cards */}
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={3}>
        {cards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                transition: '0.3s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
              }}
            >
              <CardActionArea onClick={() => navigate(card.path)} sx={{ height: '100%', p: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  {card.icon}
                  <Typography variant="h6" sx={{ mt: 1, fontWeight: 'bold' }}>
                    {card.title}
                  </Typography>
                  {card.count !== undefined && (
                    <Typography variant="body2" color="text.secondary">
                      {card.count} total
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {card.description}
                  </Typography>
                </Box>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Home;