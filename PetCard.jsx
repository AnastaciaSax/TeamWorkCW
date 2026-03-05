import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Button,
  Box,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PetsIcon from '@mui/icons-material/Pets';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';

const PetCard = ({ pet }) => {
  const navigate = useNavigate();

  // Формируем путь к фото: если есть main_photo_url, добавляем базовый путь /assets/photos/
  const photoPath = pet.main_photo_url ? `/assets/photos/${pet.main_photo_url}` : null;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component={photoPath ? 'img' : 'div'}
        sx={{
          height: 200,
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        image={photoPath}
      >
        {!photoPath && <PetsIcon sx={{ fontSize: 80, color: '#aaa' }} />}
      </CardMedia>
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
        <Box sx={{ mt: 1 }}>
          <Chip
            label={`Owner: ${pet.owner_name}`}
            size="small"
            variant="outlined"
            sx={{ mr: 0.5, mb: 0.5 }}
          />
          {pet.birthdate && (
            <Chip
              label={`Born: ${new Date(pet.birthdate).toLocaleDateString()}`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={() => navigate(`/pets/${pet.id_pet}`)}>
          View Details
        </Button>
      </CardActions>
    </Card>
  );
};

export default PetCard;