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
  const [showFilters, setShowFilters] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
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
  useEffect(() => {
    const fetchPets = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit: 12,
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

  // Фильтрованные породы по выбранному виду
  const filteredBreeds = filters.animalTypeId
    ? breeds.filter((b) => b.id_animal_type === parseInt(filters.animalTypeId))
    : breeds;

  // Скелетоны загрузки
  const renderSkeletons = () => (
    <Grid container spacing={3}>
      {[...Array(12)].map((_, i) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
          <Skeleton variant="rectangular" height={300} />
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Pets</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setModalOpen(true)}
        >
          Add Pet
        </Button>
      </Box>

      {/* Поиск и фильтры */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          sx={{ flexGrow: 1 }}
          variant="outlined"
          placeholder="Search by name..."
          value={search}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: search && (
              <InputAdornment position="end">
                <IconButton onClick={clearSearch} edge="end">
                  <ClearIcon />
                </IconButton>
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
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Animal Type</InputLabel>
                <Select
                  name="animalTypeId"
                  value={filters.animalTypeId}
                  label="Animal Type"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">All</MenuItem>
                  {animalTypes.map((type) => (
                    <MenuItem key={type.id_type} value={type.id_type}>
                      {type.type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Breed</InputLabel>
                <Select
                  name="breedId"
                  value={filters.breedId}
                  label="Breed"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">All</MenuItem>
                  {filteredBreeds.map((breed) => (
                    <MenuItem key={breed.id_breed} value={breed.id_breed}>
                      {breed.breed_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
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
            <Grid item xs={12} sm={6} md={2}>
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
            <Grid item xs={12} md={2}>
              <Button variant="outlined" onClick={clearFilters} fullWidth>
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Результаты */}
      {loading ? (
        renderSkeletons()
      ) : pets.length === 0 ? (
        <Typography align="center" sx={{ py: 4 }}>
          No pets found.
        </Typography>
      ) : (
        <>
          <Grid container spacing={3}>
            {pets.map((pet) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={pet.id_pet}>
                <PetCard pet={pet} />
              </Grid>
            ))}
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Total: {total} pets
          </Typography>
        </>
      )}

      {/* Модальное окно добавления животного (заглушка, позже реализуем детально) */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Pet</DialogTitle>
        <DialogContent>
          <Typography>Form will be implemented later</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Close</Button>
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