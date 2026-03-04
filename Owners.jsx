// src/pages/Owners/Owners.jsx
import { useEffect, useState } from 'react';
import { Paper, Typography, List, ListItem, ListItemText } from '@mui/material';
import API from '../../services/api';

const Owners = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/owners')
      .then(res => {
        setOwners(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Owners</Typography>
      <List>
        {owners.map(owner => (
          <ListItem key={owner.id_owner}>
            <ListItemText primary={owner.owner_name} secondary={owner.phone} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default Owners;