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
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  const [vaccines, setVaccines] = useState([]);
  // Для модалки редактирования питомца
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [editFormErrors, setEditFormErrors] = useState({});
  const [owners, setOwners] = useState([]);
  const [breeds, setBreeds] = useState([]);
  // Для остальных модалок
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Загрузка всех данных
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const petRes = await API.get(`/pets/${id}`);
        setPet(petRes.data);

        const [photosRes, medicalRes, needsRes] = await Promise.all([
          API.get('/photos', { params: { petId: id } }),
          API.get('/medical-records', { params: { petId: id } }),
          API.get('/special-needs', { params: { petId: id } }),
        ]);
        setPhotos(photosRes.data);
        setMedicalRecords(medicalRes.data);
        setSpecialNeeds(needsRes.data);

        const passportRes = await API.get('/passports', { params: { petId: id } });
        if (passportRes.data) {
          setPassport(passportRes.data);
          const vaccRes = await API.get('/vaccinations', { params: { passportId: passportRes.data.id_passport } });
          setVaccinations(vaccRes.data);
        } else {
          setPassport(null);
          setVaccinations([]);
        }

        const vaccinesRes = await API.get('/vaccines');
        setVaccines(vaccinesRes.data);
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

  // ========== Редактирование питомца ==========
  const openEditModal = async () => {
    try {
      const [ownersRes, breedsRes] = await Promise.all([
        API.get('/owners', { params: { limit: 100 } }),
        API.get('/breeds'),
      ]);
      setOwners(ownersRes.data.data);
      setBreeds(breedsRes.data);
    } catch (err) {
      console.error('Failed to load owners/breeds', err);
    }
    setEditFormData({
      pet_name: pet.pet_name || '',
      birthdate: pet.birthdate ? pet.birthdate.split('T')[0] : '',
      gender: pet.gender || '',
      unique_traits: pet.unique_traits || '',
      id_owner: pet.id_owner || '',
      id_breed: pet.id_breed || '',
    });
    setEditFormErrors({});
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditFormData({});
    setEditFormErrors({});
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
    if (editFormErrors[name]) {
      setEditFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateEditForm = () => {
    const errors = {};
    if (!editFormData.pet_name.trim()) errors.pet_name = 'Name is required';
    if (!editFormData.birthdate) errors.birthdate = 'Birthdate is required';
    if (!editFormData.gender) errors.gender = 'Gender is required';
    if (!editFormData.id_owner) errors.id_owner = 'Owner is required';
    if (!editFormData.id_breed) errors.id_breed = 'Breed is required';
    setEditFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditSave = async () => {
    if (!validateEditForm()) return;
    try {
      const res = await API.put(`/pets/${id}`, editFormData);
      setPet(res.data);
      showSnackbar('Pet updated successfully');
      closeEditModal();
    } catch (err) {
      console.error(err);
      showSnackbar('Error updating pet', 'error');
    }
  };

  // ========== Удаление питомца ==========
  const handleDeletePet = async () => {
    if (!window.confirm(`Are you sure you want to delete ${pet.pet_name}? This action cannot be undone.`)) return;
    try {
      await API.delete(`/pets/${id}`);
      showSnackbar('Pet deleted');
      navigate('/pets');
    } catch (err) {
      console.error(err);
      showSnackbar('Error deleting pet', 'error');
    }
  };

  // ========== Остальные модалки (фото, медзаписи и т.д.) ==========
  const openAddModal = (type) => {
    setModalType(type);
    setEditingItem(null);
    let defaultData = {};
    if (type === 'medical') {
      defaultData = {
        record_date: new Date().toISOString().split('T')[0],
        record_type: '',
        notes: '',
      };
    } else if (type === 'need') {
      defaultData = { need_type: '', description: '' };
    } else if (type === 'photo') {
      defaultData = { photo_url: '' };
    } else if (type === 'vaccination') {
      defaultData = {
        id_vaccine: '',
        vaccination_date: new Date().toISOString().split('T')[0],
        expiration_date: '',
        notes: '',
      };
    } else if (type === 'passport') {
      defaultData = { issue_date: new Date().toISOString().split('T')[0] };
    }
    setFormData(defaultData);
    setModalOpen(true);
  };

  const openEditModalItem = (type, item) => {
    setModalType(type);
    setEditingItem(item);
    let editData = { ...item };
    if (type === 'medical') {
      editData.record_date = editData.record_date.split('T')[0];
    } else if (type === 'vaccination') {
      editData.vaccination_date = editData.vaccination_date.split('T')[0];
      editData.expiration_date = editData.expiration_date.split('T')[0];
    } else if (type === 'passport') {
      editData.issue_date = editData.issue_date.split('T')[0];
    }
    setFormData(editData);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      if (modalType === 'photo') {
        if (!formData.photo_url) {
          showSnackbar('Photo filename is required', 'error');
          return;
        }
        const payload = { id_pet: parseInt(id), photo_url: formData.photo_url };
        const res = await API.post('/photos', payload);
        setPhotos([...photos, res.data]);
        showSnackbar('Photo added');
      } else if (modalType === 'medical') {
        const payload = {
          id_pet: parseInt(id),
          record_date: formData.record_date,
          record_type: formData.record_type,
          notes: formData.notes,
        };
        if (editingItem) {
          const res = await API.put(`/medical-records/${editingItem.id_record}`, payload);
          setMedicalRecords(medicalRecords.map(m => m.id_record === editingItem.id_record ? res.data : m));
          showSnackbar('Medical record updated');
        } else {
          const res = await API.post('/medical-records', payload);
          setMedicalRecords([...medicalRecords, res.data]);
          showSnackbar('Medical record added');
        }
      } else if (modalType === 'need') {
        const payload = {
          id_pet: parseInt(id),
          need_type: formData.need_type,
          description: formData.description,
        };
        if (editingItem) {
          const res = await API.put(`/special-needs/${editingItem.id_need}`, payload);
          setSpecialNeeds(specialNeeds.map(n => n.id_need === editingItem.id_need ? res.data : n));
          showSnackbar('Special need updated');
        } else {
          const res = await API.post('/special-needs', payload);
          setSpecialNeeds([...specialNeeds, res.data]);
          showSnackbar('Special need added');
        }
      } else if (modalType === 'passport') {
        if (passport) {
          showSnackbar('Passport already exists', 'error');
          return;
        }
        const payload = { id_pet: parseInt(id), issue_date: formData.issue_date };
        const res = await API.post('/passports', payload);
        setPassport(res.data);
        showSnackbar('Passport created');
      } else if (modalType === 'vaccination') {
        if (!passport) {
          showSnackbar('Create passport first', 'error');
          return;
        }
        if (!formData.id_vaccine || !formData.vaccination_date || !formData.expiration_date) {
          showSnackbar('Please fill all required fields', 'error');
          return;
        }
        if (new Date(formData.vaccination_date) > new Date(formData.expiration_date)) {
          showSnackbar('Vaccination date cannot be after expiration date', 'error');
          return;
        }
        const payload = {
          id_passport: passport.id_passport,
          id_vaccine: formData.id_vaccine,
          vaccination_date: formData.vaccination_date,
          expiration_date: formData.expiration_date,
          notes: formData.notes,
        };
        if (editingItem) {
          const res = await API.put(`/vaccinations/${editingItem.id_vaccination}`, payload);
          setVaccinations(vaccinations.map(v => v.id_vaccination === editingItem.id_vaccination ? res.data : v));
          showSnackbar('Vaccination updated');
        } else {
          const res = await API.post('/vaccinations', payload);
          setVaccinations([...vaccinations, res.data]);
          showSnackbar('Vaccination added');
        }
      }
      closeModal();
    } catch (err) {
      console.error(err);
      showSnackbar('Error saving data', 'error');
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      if (type === 'photo') {
        await API.delete(`/photos/${id}`);
        setPhotos(photos.filter(p => p.id_photo !== id));
        showSnackbar('Photo deleted');
      } else if (type === 'medical') {
        await API.delete(`/medical-records/${id}`);
        setMedicalRecords(medicalRecords.filter(m => m.id_record !== id));
        showSnackbar('Medical record deleted');
      } else if (type === 'need') {
        await API.delete(`/special-needs/${id}`);
        setSpecialNeeds(specialNeeds.filter(n => n.id_need !== id));
        showSnackbar('Special need deleted');
      } else if (type === 'vaccination') {
        await API.delete(`/vaccinations/${id}`);
        setVaccinations(vaccinations.filter(v => v.id_vaccination !== id));
        showSnackbar('Vaccination deleted');
      } else if (type === 'passport') {
        await API.delete(`/passports/${id}`);
        setPassport(null);
        setVaccinations([]);
        showSnackbar('Passport deleted');
      }
    } catch (err) {
      console.error(err);
      showSnackbar('Error deleting', 'error');
    }
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
        <Button startIcon={<EditIcon />} variant="outlined" sx={{ mr: 1 }} onClick={openEditModal}>
          Edit
        </Button>
        <Button startIcon={<DeleteIcon />} variant="outlined" color="error" onClick={handleDeletePet}>
          Delete
        </Button>
      </Box>

      <Grid container spacing={3}>
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

      {/* Вкладка Photos */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button startIcon={<AddPhotoIcon />} variant="contained" onClick={() => openAddModal('photo')}>
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
                  image={`/assets/photos/${photo.photo_url}`}
                  alt="pet photo"
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                  <IconButton size="small" onClick={() => handleDelete('photo', photo.id_photo)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))}
          {photos.length === 0 && (
            <Typography sx={{ p: 2 }}>No photos yet.</Typography>
          )}
        </Grid>
      </TabPanel>

      {/* Вкладка Medical Records */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button startIcon={<AddIcon />} variant="contained" onClick={() => openAddModal('medical')}>
            Add Record
          </Button>
        </Box>
        <List>
          {medicalRecords.map((record) => (
            <ListItem key={record.id_record} divider>
              <ListItemText
                primary={`${new Date(record.record_date).toLocaleDateString()} - ${record.record_type}`}
                secondary={record.notes}
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => openEditModalItem('medical', record)}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => handleDelete('medical', record.id_record)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          {medicalRecords.length === 0 && (
            <Typography>No medical records.</Typography>
          )}
        </List>
      </TabPanel>

      {/* Вкладка Special Needs */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button startIcon={<AddIcon />} variant="contained" onClick={() => openAddModal('need')}>
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
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => openEditModalItem('need', need)}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => handleDelete('need', need.id_need)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          {specialNeeds.length === 0 && (
            <Typography>No special needs.</Typography>
          )}
        </List>
      </TabPanel>

      {/* Вкладка Passport & Vaccinations */}
      <TabPanel value={tabValue} index={3}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">Passport</Typography>
          {passport ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography>
                Number: {passport.id_passport}, Issue date: {new Date(passport.issue_date).toLocaleDateString()}
              </Typography>
              <Button variant="outlined" color="error" onClick={() => handleDelete('passport', passport.id_passport)}>
                Delete Passport
              </Button>
            </Box>
          ) : (
            <Button variant="outlined" onClick={() => openAddModal('passport')}>
              Create Passport
            </Button>
          )}
        </Box>
        <Divider />
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">Vaccinations</Typography>
          {passport && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button startIcon={<AddIcon />} variant="contained" onClick={() => openAddModal('vaccination')}>
                Add Vaccination
              </Button>
            </Box>
          )}
          <List>
            {vaccinations.map((vac) => (
              <ListItem key={vac.id_vaccination} divider>
                <ListItemText
                  primary={vac.vaccine_name}
                  secondary={`Vaccinated: ${new Date(vac.vaccination_date).toLocaleDateString()} – Expires: ${new Date(vac.expiration_date).toLocaleDateString()}`}
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => openEditModalItem('vaccination', vac)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" onClick={() => handleDelete('vaccination', vac.id_vaccination)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            {vaccinations.length === 0 && passport && (
              <Typography>No vaccinations recorded.</Typography>
            )}
          </List>
        </Box>
      </TabPanel>

      {/* Модальное окно редактирования питомца */}
      <Dialog open={editModalOpen} onClose={closeEditModal} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Pet</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="pet_name"
            label="Pet Name *"
            fullWidth
            value={editFormData.pet_name || ''}
            onChange={handleEditFormChange}
            error={!!editFormErrors.pet_name}
            helperText={editFormErrors.pet_name}
          />
          <TextField
            margin="dense"
            name="birthdate"
            label="Birthdate *"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={editFormData.birthdate || ''}
            onChange={handleEditFormChange}
            error={!!editFormErrors.birthdate}
            helperText={editFormErrors.birthdate}
          />
          <FormControl fullWidth margin="dense" error={!!editFormErrors.gender}>
            <InputLabel>Gender *</InputLabel>
            <Select
              name="gender"
              value={editFormData.gender || ''}
              label="Gender *"
              onChange={handleEditFormChange}
            >
              <MenuItem value="">Select</MenuItem>
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
            </Select>
            {editFormErrors.gender && <Typography variant="caption" color="error">{editFormErrors.gender}</Typography>}
          </FormControl>
          <TextField
            margin="dense"
            name="unique_traits"
            label="Unique Traits"
            multiline
            rows={2}
            fullWidth
            value={editFormData.unique_traits || ''}
            onChange={handleEditFormChange}
          />
          <FormControl fullWidth margin="dense" error={!!editFormErrors.id_owner}>
            <InputLabel>Owner *</InputLabel>
            <Select
              name="id_owner"
              value={editFormData.id_owner || ''}
              label="Owner *"
              onChange={handleEditFormChange}
            >
              <MenuItem value="">Select</MenuItem>
              {owners.map(owner => (
                <MenuItem key={owner.id_owner} value={owner.id_owner}>
                  {owner.owner_name}
                </MenuItem>
              ))}
            </Select>
            {editFormErrors.id_owner && <Typography variant="caption" color="error">{editFormErrors.id_owner}</Typography>}
          </FormControl>
          <FormControl fullWidth margin="dense" error={!!editFormErrors.id_breed}>
            <InputLabel>Breed *</InputLabel>
            <Select
              name="id_breed"
              value={editFormData.id_breed || ''}
              label="Breed *"
              onChange={handleEditFormChange}
            >
              <MenuItem value="">Select</MenuItem>
              {breeds.map(breed => (
                <MenuItem key={breed.id_breed} value={breed.id_breed}>
                  {breed.breed_name} ({breed.animal_type_name})
                </MenuItem>
              ))}
            </Select>
            {editFormErrors.id_breed && <Typography variant="caption" color="error">{editFormErrors.id_breed}</Typography>}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditModal}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Модальное окно для остальных типов (фото, медзаписи и т.д.) */}
      <Dialog open={modalOpen} onClose={closeModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          {modalType === 'photo' && (editingItem ? 'Edit Photo' : 'Add Photo')}
          {modalType === 'medical' && (editingItem ? 'Edit Medical Record' : 'Add Medical Record')}
          {modalType === 'need' && (editingItem ? 'Edit Special Need' : 'Add Special Need')}
          {modalType === 'passport' && 'Create Passport'}
          {modalType === 'vaccination' && (editingItem ? 'Edit Vaccination' : 'Add Vaccination')}
        </DialogTitle>
        <DialogContent>
          {modalType === 'photo' && (
            <TextField
              autoFocus
              margin="dense"
              name="photo_url"
              label="Photo filename"
              fullWidth
              value={formData.photo_url || ''}
              onChange={handleFormChange}
              helperText="Enter filename like photo_1.jpg (stored in /assets/photos/)"
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
                value={formData.record_date || ''}
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
              value={formData.issue_date || ''}
              onChange={handleFormChange}
            />
          )}
          {modalType === 'vaccination' && (
            <>
              <FormControl fullWidth margin="dense">
                <InputLabel>Vaccine</InputLabel>
                <Select
                  name="id_vaccine"
                  value={formData.id_vaccine || ''}
                  label="Vaccine"
                  onChange={handleFormChange}
                >
                  {vaccines.map((v) => (
                    <MenuItem key={v.id_vaccine} value={v.id_vaccine}>
                      {v.vaccine_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                margin="dense"
                name="vaccination_date"
                label="Vaccination Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.vaccination_date || ''}
                onChange={handleFormChange}
              />
              <TextField
                margin="dense"
                name="expiration_date"
                label="Expiration Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.expiration_date || ''}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingItem ? 'Update' : 'Save'}
          </Button>
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