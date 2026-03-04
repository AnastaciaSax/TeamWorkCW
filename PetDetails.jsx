import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  Divider,
  Tabs,
  Tab,
  Button,
  IconButton,
  Card,
  CardMedia,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Skeleton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AddPhotoAlternate as AddPhotoIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import API from '../../services/api';

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const PetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [specialNeeds, setSpecialNeeds] = useState([]);
  const [passport, setPassport] = useState(null);
  const [vaccinations, setVaccinations] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'photo', 'medical', 'need', 'vaccination'
  const [formData, setFormData] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const petRes = await API.get(`/pets/${id}`);
        setPet(petRes.data);

        // Загрузка связанных данных
        const [photosRes, medicalRes, needsRes] = await Promise.all([
          API.get('/photos', { params: { petId: id } }),
          API.get('/medical-records', { params: { petId: id } }),
          API.get('/special-needs', { params: { petId: id } }),
        ]);
        setPhotos(photosRes.data);
        setMedicalRecords(medicalRes.data);
        setSpecialNeeds(needsRes.data);

        // Загрузка паспорта и прививок, если есть
        // (нужен отдельный эндпоинт для паспорта по id животного)
        // Пока заглушка
      } catch (error) {
        console.error(error);
        showSnackbar('Error loading pet details', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setFormData(item || {});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormData({});
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    // Реализация сохранения в зависимости от типа
    closeModal();
    // После сохранения обновить данные
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Skeleton variant="text" height={60} />
        <Skeleton variant="rectangular" height={400} />
      </Paper>
    );
  }

  if (!pet) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography>Pet not found</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/pets')}>
          Back to Pets
        </Button>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => navigate('/pets')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ ml: 1 }}>
          {pet.pet_name}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button startIcon={<EditIcon />} variant="outlined" sx={{ mr: 1 }}>
          Edit
        </Button>
        <Button startIcon={<DeleteIcon />} variant="outlined" color="error">
          Delete
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardMedia
              component="img"
              height="300"
              image={photos[0]?.photo_url || 'https://via.placeholder.com/300?text=No+Image'}
              alt={pet.pet_name}
            />
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>Basic Information</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle2">Breed</Typography>
              <Typography>{pet.breed_name} ({pet.animal_type_name})</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2">Gender</Typography>
              <Typography>{pet.gender || 'Unknown'}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2">Birthdate</Typography>
              <Typography>{pet.birthdate ? new Date(pet.birthdate).toLocaleDateString() : 'Unknown'}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2">Owner</Typography>
              <Typography>{pet.owner_name} ({pet.owner_phone})</Typography>
            </Grid>
            {pet.unique_traits && (
              <Grid item xs={12}>
                <Typography variant="subtitle2">Unique Traits</Typography>
                <Typography>{pet.unique_traits}</Typography>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Photos" />
          <Tab label="Medical Records" />
          <Tab label="Special Needs" />
          <Tab label="Passport & Vaccinations" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button startIcon={<AddPhotoIcon />} variant="contained" onClick={() => openModal('photo')}>
            Add Photo
          </Button>
        </Box>
        <Grid container spacing={2}>
          {photos.map((photo) => (
            <Grid item xs={6} sm={4} md={3} key={photo.id_photo}>
              <Card>
                <CardMedia
                  component="img"
                  height="150"
                  image={photo.photo_url}
                  alt="pet photo"
                />
              </Card>
            </Grid>
          ))}
          {photos.length === 0 && (
            <Typography sx={{ p: 2 }}>No photos yet.</Typography>
          )}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button startIcon={<AddIcon />} variant="contained" onClick={() => openModal('medical')}>
            Add Record
          </Button>
        </Box>
        <List>
          {medicalRecords.map((record) => (
            <ListItem key={record.id_record} divider>
              <ListItemText
                primary={`${record.record_date} - ${record.record_type}`}
                secondary={record.notes}
              />
            </ListItem>
          ))}
          {medicalRecords.length === 0 && (
            <Typography>No medical records.</Typography>
          )}
        </List>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button startIcon={<AddIcon />} variant="contained" onClick={() => openModal('need')}>
            Add Need
          </Button>
        </Box>
        <List>
          {specialNeeds.map((need) => (
            <ListItem key={need.id_need} divider>
              <ListItemText
                primary={need.need_type}
                secondary={need.description}
              />
            </ListItem>
          ))}
          {specialNeeds.length === 0 && (
            <Typography>No special needs.</Typography>
          )}
        </List>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">Passport</Typography>
          {passport ? (
            <Typography>Number: {passport.id_passport}, Issue date: {passport.issue_date}</Typography>
          ) : (
            <Button variant="outlined" onClick={() => openModal('passport')}>Create Passport</Button>
          )}
        </Box>
        <Divider />
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">Vaccinations</Typography>
          <List>
            {vaccinations.map((vac) => (
              <ListItem key={vac.id_vaccination} divider>
                <ListItemText
                  primary={vac.vaccine_name}
                  secondary={`${vac.vaccination_date} - expires: ${vac.expiration_date}`}
                />
              </ListItem>
            ))}
            {vaccinations.length === 0 && (
              <Typography>No vaccinations.</Typography>
            )}
          </List>
        </Box>
      </TabPanel>

      {/* Модальное окно для разных типов */}
      <Dialog open={modalOpen} onClose={closeModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          {modalType === 'photo' && 'Add Photo'}
          {modalType === 'medical' && 'Add Medical Record'}
          {modalType === 'need' && 'Add Special Need'}
          {modalType === 'passport' && 'Create Passport'}
        </DialogTitle>
        <DialogContent>
          {modalType === 'photo' && (
            <TextField
              autoFocus
              margin="dense"
              name="photo_url"
              label="Photo URL"
              fullWidth
              value={formData.photo_url || ''}
              onChange={handleFormChange}
            />
          )}
          {modalType === 'medical' && (
            <>
              <TextField
                margin="dense"
                name="record_date"
                label="Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.record_date || new Date().toISOString().split('T')[0]}
                onChange={handleFormChange}
              />
              <TextField
                margin="dense"
                name="record_type"
                label="Type"
                fullWidth
                value={formData.record_type || ''}
                onChange={handleFormChange}
              />
              <TextField
                margin="dense"
                name="notes"
                label="Notes"
                multiline
                rows={3}
                fullWidth
                value={formData.notes || ''}
                onChange={handleFormChange}
              />
            </>
          )}
          {modalType === 'need' && (
            <>
              <TextField
                margin="dense"
                name="need_type"
                label="Need Type"
                fullWidth
                value={formData.need_type || ''}
                onChange={handleFormChange}
              />
              <TextField
                margin="dense"
                name="description"
                label="Description"
                multiline
                rows={3}
                fullWidth
                value={formData.description || ''}
                onChange={handleFormChange}
              />
            </>
          )}
          {modalType === 'passport' && (
            <TextField
              margin="dense"
              name="issue_date"
              label="Issue Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.issue_date || new Date().toISOString().split('T')[0]}
              onChange={handleFormChange}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default PetDetails;