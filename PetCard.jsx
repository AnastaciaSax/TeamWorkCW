import {
  Card,
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

  const photoPath = pet.main_photo_url ? `/assets/photos/${pet.main_photo_url}` : null;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Верхняя часть с фото или иконкой */}
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
  );
};

export default PetCard;