import {
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  Box,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PetsIcon from '@mui/icons-material/Pets';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';
import API from './../services/api';

const PetCard = ({ pet, onDelete }) => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const photoPath = pet.main_photo_url ? `/assets/photos/${pet.main_photo_url}` : null;

  const handleDelete = async () => {
    try {
      await API.delete(`/pets/${pet.id_pet}`);
      setDeleteDialogOpen(false);
      if (onDelete) onDelete(pet.id_pet);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <IconButton
          sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.8)' }}
          size="small"
          onClick={() => setDeleteDialogOpen(true)}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>

        {photoPath ? (
          <Box
            component="img"
            src={photoPath}
            alt={pet.pet_name}
            sx={{
              height: 200,
              width: '100%',
              objectFit: 'cover',
              backgroundColor: '#f0f0f0',
            }}
          />
        ) : (
          <Box
            sx={{
              height: 200,
              backgroundColor: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PetsIcon sx={{ fontSize: 80, color: '#aaa' }} />
          </Box>
        )}

        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h5" component="div">
            {pet.pet_name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {pet.breed_name} ({pet.animal_type_name})
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            {pet.gender === 'Male' ? (
              <MaleIcon fontSize="small" sx={{ color: '#2196f3', mr: 0.5 }} />
            ) : (
              <FemaleIcon fontSize="small" sx={{ color: '#e91e63', mr: 0.5 }} />
            )}
            <Typography variant="body2">{pet.gender || 'Unknown'}</Typography>
          </Box>
        </CardContent>
        <CardActions>
          <Button size="small" onClick={() => navigate(`/pets/${pet.id_pet}`)}>
            View Details
          </Button>
        </CardActions>
      </Card>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete {pet.pet_name}?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PetCard;