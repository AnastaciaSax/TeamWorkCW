import { useState } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import API from '../../services/api';

const Passport = () => {
  const [searchNumber, setSearchNumber] = useState('');
  const [passport, setPassport] = useState(null);
  const [vaccinations, setVaccinations] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVaccination, setEditingVaccination] = useState(null);
  const [formData, setFormData] = useState({
    id_vaccine: '',
    vaccination_date: new Date().toISOString().split('T')[0],
    expiration_date: '',
    notes: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleSearch = async () => {
    if (!searchNumber.trim()) {
      setError('Please enter passport number');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const passportRes = await API.get('/passports/search', { params: { number: searchNumber } });
      setPassport(passportRes.data);

      // Загрузить прививки для этого паспорта
      const vaccRes = await API.get('/vaccinations', { params: { passportId: passportRes.data.id_passport } });
      setVaccinations(vaccRes.data);

      // Загрузить справочник вакцин
      const vaccinesRes = await API.get('/vaccines');
      setVaccines(vaccinesRes.data);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('Passport not found');
      } else {
        setError('Error searching passport');
      }
      setPassport(null);
      setVaccinations([]);
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const openAddModal = () => {
    setEditingVaccination(null);
    setFormData({
      id_vaccine: '',
      vaccination_date: new Date().toISOString().split('T')[0],
      expiration_date: '',
      notes: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (vacc) => {
    setEditingVaccination(vacc);
    setFormData({
      id_vaccine: vacc.id_vaccine,
      vaccination_date: vacc.vaccination_date,
      expiration_date: vacc.expiration_date,
      notes: vacc.notes || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveVaccination = async () => {
  if (!formData.id_vaccine || !formData.vaccination_date || !formData.expiration_date) {
    showSnackbar('Please fill all required fields', 'error');
    return;
  }

  // Проверка, что дата вакцинации не позже даты истечения
  if (new Date(formData.vaccination_date) > new Date(formData.expiration_date)) {
    showSnackbar('Vaccination date cannot be after expiration date', 'error');
    return;
  }

  try {
    const payload = {
      id_passport: passport.id_passport,
      ...formData,
    };
    if (editingVaccination) {
      await API.put(`/vaccinations/${editingVaccination.id_vaccination}`, payload);
      showSnackbar('Vaccination updated');
    } else {
      await API.post('/vaccinations', payload);
      showSnackbar('Vaccination added');
    }
    closeModal();
    // Обновить список прививок
    const vaccRes = await API.get('/vaccinations', { params: { passportId: passport.id_passport } });
    setVaccinations(vaccRes.data);
  } catch (err) {
    console.error(err);
    showSnackbar('Error saving vaccination', 'error');
  }
};

  const handleDeleteVaccination = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vaccination?')) return;
    try {
      await API.delete(`/vaccinations/${id}`);
      showSnackbar('Vaccination deleted');
      const vaccRes = await API.get('/vaccinations', { params: { passportId: passport.id_passport } });
      setVaccinations(vaccRes.data);
    } catch (err) {
      console.error(err);
      showSnackbar('Error deleting vaccination', 'error');
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Passport & Vaccinations
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Passport Number"
          variant="outlined"
          value={searchNumber}
          onChange={(e) => setSearchNumber(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          sx={{ flexGrow: 1 }}
        />
        <Button
          variant="contained"
          startIcon={<SearchIcon />}
          onClick={handleSearch}
          disabled={loading}
        >
          Search
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {passport && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Passport Number</Typography>
                <Typography>{passport.id_passport}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Issue Date</Typography>
                <Typography>{new Date(passport.issue_date).toLocaleDateString()}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Pet Name</Typography>
                <Typography>{passport.pet_name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Owner</Typography>
                <Typography>{passport.owner_name} ({passport.owner_phone})</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {passport && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Vaccinations</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openAddModal}
            >
              Add Vaccination
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Vaccine</TableCell>
                  <TableCell>Vaccination Date</TableCell>
                  <TableCell>Expiration Date</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vaccinations.map((vac) => (
                  <TableRow key={vac.id_vaccination}>
                    <TableCell>{vac.vaccine_name}</TableCell>
                    <TableCell>{new Date(vac.vaccination_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={new Date(vac.expiration_date).toLocaleDateString()}
                        color={new Date(vac.expiration_date) < new Date() ? 'error' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{vac.notes || '-'}</TableCell>
                    <TableCell align="center">
                      <IconButton onClick={() => openEditModal(vac)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteVaccination(vac.id_vaccination)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {vaccinations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No vaccinations recorded.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Модальное окно добавления/редактирования прививки */}
      <Dialog open={modalOpen} onClose={closeModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingVaccination ? 'Edit Vaccination' : 'Add Vaccination'}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Vaccine</InputLabel>
            <Select
              name="id_vaccine"
              value={formData.id_vaccine}
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
            value={formData.vaccination_date}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            name="expiration_date"
            label="Expiration Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.expiration_date}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            name="notes"
            label="Notes"
            multiline
            rows={3}
            fullWidth
            value={formData.notes}
            onChange={handleFormChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>Cancel</Button>
          <Button onClick={handleSaveVaccination} variant="contained">
            {editingVaccination ? 'Update' : 'Add'}
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

export default Passport;