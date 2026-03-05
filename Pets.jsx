import { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Pagination,
  Skeleton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import PetCard from '../../components/PetCard';
import { useDebounce } from '../../hooks/useDebounce';

const Pets = () => {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    animalTypeId: '',
    breedId: '',
    gender: '',
    ageGroup: '',
  });
  const [animalTypes, setAnimalTypes] = useState([]);
  const [breeds, setBreeds] = useState([]);
  const [owners, setOwners] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    pet_name: '',
    birthdate: '',
    gender: '',
    unique_traits: '',
    id_owner: '',
    id_breed: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const debouncedSearch = useDebounce(search, 500);

  // Загрузка справочников
  useEffect(() => {
    const fetchDictionaries = async () => {
      try {
        const [typesRes, breedsRes] = await Promise.all([
          API.get('/animal-types'),
          API.get('/breeds'),
        ]);
        setAnimalTypes(typesRes.data);
        setBreeds(breedsRes.data);
      } catch (error) {
        console.error('Error fetching dictionaries', error);
      }
    };
    fetchDictionaries();
  }, []);

  // Загрузка животных
  const fetchPets = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 8,
        search: debouncedSearch,
        ...filters,
      };
      const response = await API.get('/pets', { params });
      setPets(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
      setTotal(response.data.pagination.total);
    } catch (error) {
      console.error(error);
      showSnackbar('Error loading pets', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, [page, debouncedSearch, filters]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const clearSearch = () => {
    setSearch('');
    setPage(1);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      animalTypeId: '',
      breedId: '',
      gender: '',
      ageGroup: '',
    });
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const filteredBreeds = filters.animalTypeId
    ? breeds.filter((b) => b.id_animal_type === parseInt(filters.animalTypeId))
    : breeds;

  const handleDeletePet = (deletedId) => {
    setPets(pets.filter(p => p.id_pet !== deletedId));
    // Можно также обновить total, пересчитав страницы, но для простоты перезагрузим первую страницу
    if (page === 1) fetchPets();
    else setPage(1);
  };

  // Модалка добавления
  const openAddModal = async () => {
    try {
      const ownersRes = await API.get('/owners', { params: { limit: 100 } });
      setOwners(ownersRes.data.data);
    } catch (err) {
      console.error('Failed to load owners', err);
    }
    setFormData({
      pet_name: '',
      birthdate: '',
      gender: '',
      unique_traits: '',
      id_owner: '',
      id_breed: '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.pet_name.trim()) errors.pet_name = 'Name is required';
    if (!formData.birthdate) errors.birthdate = 'Birthdate is required';
    if (!formData.gender) errors.gender = 'Gender is required';
    if (!formData.id_owner) errors.id_owner = 'Owner is required';
    if (!formData.id_breed) errors.id_breed = 'Breed is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddPet = async () => {
    if (!validateForm()) return;
    try {
      await API.post('/pets', formData);
      showSnackbar('Pet added successfully');
      closeModal();
      setPage(1);
      fetchPets(); // обновить список
    } catch (err) {
      console.error(err);
      showSnackbar('Error adding pet', 'error');
    }
  };

  const renderSkeletons = () => (
    <Grid container spacing={3}>
      {[...Array(8)].map((_, i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <Skeleton variant="rectangular" height={300} />
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Pets</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAddModal}>
          Add Pet
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          sx={{ flexGrow: 1 }}
          variant="outlined"
          placeholder="Search by name..."
          value={search}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
            endAdornment: search && (
              <InputAdornment position="end">
                <IconButton onClick={clearSearch} edge="end"><ClearIcon /></IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant={showFilters ? 'contained' : 'outlined'}
          startIcon={<FilterIcon />}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filters
        </Button>
      </Box>

      {showFilters && (
        <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Animal Type</InputLabel>
                <Select
                  name="animalTypeId"
                  value={filters.animalTypeId}
                  label="Animal Type"
                  onChange={handleFilterChange}
                  MenuProps={{ sx: { maxWidth: 300 } }}
                >
                  <MenuItem value="">All</MenuItem>
                  {animalTypes.map(type => (
                    <MenuItem key={type.id_type} value={type.id_type}>{type.type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Breed</InputLabel>
                <Select
                  name="breedId"
                  value={filters.breedId}
                  label="Breed"
                  onChange={handleFilterChange}
                  MenuProps={{ sx: { maxWidth: 300 } }}
                >
                  <MenuItem value="">All</MenuItem>
                  {filteredBreeds.map(breed => (
                    <MenuItem key={breed.id_breed} value={breed.id_breed}>
                      {breed.breed_name} ({breed.animal_type_name})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Gender</InputLabel>
                <Select
                  name="gender"
                  value={filters.gender}
                  label="Gender"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Age Group</InputLabel>
                <Select
                  name="ageGroup"
                  value={filters.ageGroup}
                  label="Age Group"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="puppy">&lt; 1 year</MenuItem>
                  <MenuItem value="young">1-3 years</MenuItem>
                  <MenuItem value="adult">&gt; 3 years</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Button variant="outlined" onClick={clearFilters} fullWidth>
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}

      {loading ? (
        renderSkeletons()
      ) : pets.length === 0 ? (
        <Typography align="center" sx={{ py: 4 }}>No pets found.</Typography>
      ) : (
        <>
          <Grid container spacing={3}>
            {pets.map(pet => (
              <Grid key={pet.id_pet} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <PetCard pet={pet} onDelete={handleDeletePet} />
              </Grid>
            ))}
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
          </Box>
        </>
      )}

      {/* Модальное окно добавления питомца */}
      <Dialog open={modalOpen} onClose={closeModal} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Pet</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="pet_name"
            label="Pet Name *"
            fullWidth
            value={formData.pet_name}
            onChange={handleFormChange}
            error={!!formErrors.pet_name}
            helperText={formErrors.pet_name}
          />
          <TextField
            margin="dense"
            name="birthdate"
            label="Birthdate *"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.birthdate}
            onChange={handleFormChange}
            error={!!formErrors.birthdate}
            helperText={formErrors.birthdate}
          />
          <FormControl fullWidth margin="dense" error={!!formErrors.gender}>
            <InputLabel>Gender *</InputLabel>
            <Select
              name="gender"
              value={formData.gender}
              label="Gender *"
              onChange={handleFormChange}
            >
              <MenuItem value="">Select</MenuItem>
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
            </Select>
            {formErrors.gender && <Typography variant="caption" color="error">{formErrors.gender}</Typography>}
          </FormControl>
          <TextField
            margin="dense"
            name="unique_traits"
            label="Unique Traits"
            multiline
            rows={2}
            fullWidth
            value={formData.unique_traits}
            onChange={handleFormChange}
          />
          <FormControl fullWidth margin="dense" error={!!formErrors.id_owner}>
            <InputLabel>Owner *</InputLabel>
            <Select
              name="id_owner"
              value={formData.id_owner}
              label="Owner *"
              onChange={handleFormChange}
            >
              <MenuItem value="">Select</MenuItem>
              {owners.map(owner => (
                <MenuItem key={owner.id_owner} value={owner.id_owner}>
                  {owner.owner_name}
                </MenuItem>
              ))}
            </Select>
            {formErrors.id_owner && <Typography variant="caption" color="error">{formErrors.id_owner}</Typography>}
          </FormControl>
          <FormControl fullWidth margin="dense" error={!!formErrors.id_breed}>
            <InputLabel>Breed *</InputLabel>
            <Select
              name="id_breed"
              value={formData.id_breed}
              label="Breed *"
              onChange={handleFormChange}
            >
              <MenuItem value="">Select</MenuItem>
              {breeds.map(breed => (
                <MenuItem key={breed.id_breed} value={breed.id_breed}>
                  {breed.breed_name} ({breed.animal_type_name})
                </MenuItem>
              ))}
            </Select>
            {formErrors.id_breed && <Typography variant="caption" color="error">{formErrors.id_breed}</Typography>}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>Cancel</Button>
          <Button onClick={handleAddPet} variant="contained">Add</Button>
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

export default Pets;