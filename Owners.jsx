import { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Skeleton,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
  SortByAlpha as SortIcon,
} from '@mui/icons-material';
import API from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';

// Константы валидации
const NAME_MAX_LENGTH = 100;
const PHONE_MAX_LENGTH = 12;
const EMAIL_MAX_LENGTH = 100;
const ADDRESS_MAX_LENGTH = 200;

// Регулярные выражения
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Телефон: +1-XXX-XXX-XXXX или XXX-XXX-XXXX
const phoneRegex = /^(\+1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;

const Owners = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('owner_name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOwner, setEditingOwner] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ownerToDelete, setOwnerToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    owner_name: '',
    phone: '',
    email: '',
    address: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const debouncedSearch = useDebounce(search, 500);

  const fetchOwners = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search: debouncedSearch,
        sortBy,
        sortOrder,
      };
      const response = await API.get('/owners', { params });
      setOwners(response.data.data);
      setTotal(response.data.pagination.total);
    } catch (error) {
      console.error(error);
      showSnackbar('Error loading owners', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, [page, rowsPerPage, debouncedSearch, sortBy, sortOrder]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const clearSearch = () => {
    setSearch('');
    setPage(0);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(0);
  };

  const openAddModal = () => {
    setEditingOwner(null);
    setFormData({ owner_name: '', phone: '', email: '', address: '' });
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (owner) => {
    setEditingOwner(owner);
    setFormData({
      owner_name: owner.owner_name || '',
      phone: owner.phone || '',
      email: owner.email || '',
      address: owner.address || '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  // Форматирование телефона: добавляем +1, убираем лишнее
  const formatPhone = (value) => {
    // Удаляем все нецифровые символы
    let digits = value.replace(/\D/g, '');
    if (digits.length === 0) return '';
    // Если 10 цифр, добавляем +1
    if (digits.length === 10) {
      return `+1${digits}`;
    }
    // Если 11 цифр и первая 1, оставляем как есть с +
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`;
    }
    // Иначе просто добавляем + (возможно международный)
    return `+${digits}`;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    // Для телефона разрешаем только цифры и +
    if (name === 'phone') {
      const cleaned = value.replace(/[^0-9+]/g, '');
      // Не допускаем больше одного плюса
      if ((cleaned.match(/\+/g) || []).length > 1) {
        setFormData((prev) => ({ ...prev, [name]: cleaned.replace(/\+/g, '') }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: cleaned }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Очищаем ошибку этого поля при изменении
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePhoneBlur = () => {
    setFormData((prev) => ({
      ...prev,
      phone: formatPhone(prev.phone),
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.owner_name.trim()) {
      errors.owner_name = 'Name is required';
    } else if (formData.owner_name.length > NAME_MAX_LENGTH) {
      errors.owner_name = `Name must be less than ${NAME_MAX_LENGTH} characters`;
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone is required';
    } else if (formData.phone.length > PHONE_MAX_LENGTH) {
      errors.phone = `Phone must be less than ${PHONE_MAX_LENGTH} characters`;
    } else if (!phoneRegex.test(formData.phone.trim())) {
      errors.phone = 'Invalid phone format. Use +1-XXX-XXX-XXXX or XXX-XXX-XXXX';
    }

    if (formData.email && formData.email.trim() !== '') {
      if (formData.email.length > EMAIL_MAX_LENGTH) {
        errors.email = `Email must be less than ${EMAIL_MAX_LENGTH} characters`;
      } else if (!emailRegex.test(formData.email)) {
        errors.email = 'Invalid email format';
      }
    }

    if (formData.address && formData.address.length > ADDRESS_MAX_LENGTH) {
      errors.address = `Address must be less than ${ADDRESS_MAX_LENGTH} characters`;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveOwner = async () => {
    if (!validateForm()) return;

    const formattedPhone = formatPhone(formData.phone);
    const dataToSend = {
      ...formData,
      phone: formattedPhone,
    };

    try {
      if (editingOwner) {
        await API.put(`/owners/${editingOwner.id_owner}`, dataToSend);
        showSnackbar('Owner updated successfully');
      } else {
        await API.post('/owners', dataToSend);
        showSnackbar('Owner added successfully');
      }
      closeModal();
      fetchOwners();
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data.error) {
        const serverError = error.response.data.error;
        // Если ошибка про телефон, показываем под полем
        if (serverError.toLowerCase().includes('phone')) {
          setFormErrors((prev) => ({ ...prev, phone: serverError }));
        } else {
          showSnackbar(serverError, 'error');
        }
      } else {
        showSnackbar('Error saving owner', 'error');
      }
    }
  };

  const openDeleteDialog = (owner) => {
    setOwnerToDelete(owner);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setOwnerToDelete(null);
  };

  const handleDeleteOwner = async () => {
    if (!ownerToDelete) return;
    try {
      await API.delete(`/owners/${ownerToDelete.id_owner}`);
      showSnackbar('Owner deleted successfully');
      closeDeleteDialog();
      fetchOwners();
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data.error) {
        showSnackbar(error.response.data.error, 'error');
      } else {
        showSnackbar('Error deleting owner', 'error');
      }
      closeDeleteDialog();
    }
  };

  const renderSkeletons = () => (
    <>
      {[...Array(rowsPerPage)].map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton variant="text" /></TableCell>
          <TableCell><Skeleton variant="text" /></TableCell>
          <TableCell><Skeleton variant="text" /></TableCell>
          <TableCell><Skeleton variant="text" /></TableCell>
          <TableCell><Skeleton variant="text" /></TableCell>
          <TableCell><Skeleton variant="text" /></TableCell>
        </TableRow>
      ))}
    </>
  );

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Owners</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAddModal}>
          Add Owner
        </Button>
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search by name, phone or email..."
        value={search}
        onChange={handleSearchChange}
        sx={{ mb: 2 }}
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

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Name
                  <IconButton size="small" onClick={() => handleSort('owner_name')}>
                    <SortIcon fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Pets Count
                  <IconButton size="small" onClick={() => handleSort('pets_count')}>
                    <SortIcon fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              renderSkeletons()
            ) : (
              owners.map((owner) => (
                <TableRow key={owner.id_owner} hover>
                  <TableCell>{owner.owner_name}</TableCell>
                  <TableCell>{owner.phone}</TableCell>
                  <TableCell>{owner.email || '-'}</TableCell>
                  <TableCell>{owner.address || '-'}</TableCell>
                  <TableCell>
                    <Chip label={owner.pets_count || 0} size="small" color="primary" />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit">
                      <IconButton onClick={() => openEditModal(owner)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => openDeleteDialog(owner)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />

      <Dialog open={modalOpen} onClose={closeModal} maxWidth="sm" fullWidth>
        <DialogTitle>{editingOwner ? 'Edit Owner' : 'Add New Owner'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="owner_name"
            label="Full Name *"
            fullWidth
            variant="outlined"
            value={formData.owner_name}
            onChange={handleFormChange}
            error={!!formErrors.owner_name}
            helperText={formErrors.owner_name || `Max ${NAME_MAX_LENGTH} characters`}
            inputProps={{ maxLength: NAME_MAX_LENGTH }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="phone"
            label="Phone *"
            fullWidth
            variant="outlined"
            value={formData.phone}
            onChange={handleFormChange}
            onBlur={handlePhoneBlur}
            error={!!formErrors.phone}
            helperText={formErrors.phone || 'Format: +1-XXX-XXX-XXXX or XXX-XXX-XXXX'}
            inputProps={{ maxLength: PHONE_MAX_LENGTH }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={formData.email}
            onChange={handleFormChange}
            error={!!formErrors.email}
            helperText={formErrors.email || `Optional, max ${EMAIL_MAX_LENGTH} chars`}
            inputProps={{ maxLength: EMAIL_MAX_LENGTH }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="address"
            label="Address"
            fullWidth
            variant="outlined"
            value={formData.address}
            onChange={handleFormChange}
            error={!!formErrors.address}
            helperText={formErrors.address || `Optional, max ${ADDRESS_MAX_LENGTH} chars`}
            inputProps={{ maxLength: ADDRESS_MAX_LENGTH }}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>Cancel</Button>
          <Button onClick={handleSaveOwner} variant="contained">
            {editingOwner ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete owner "{ownerToDelete?.owner_name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteOwner} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default Owners;