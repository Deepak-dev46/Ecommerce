import React, { useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
 Dialog,
 DialogTitle,
 DialogContent,
 DialogActions,
 Button,
 Grid,
 TextField,
 MenuItem,
 Typography,
 Box,
 CircularProgress,
 Alert,
 Divider,
 IconButton,
 Stack,
} from '@mui/material';
import {
 PersonAdd,
 Close,
 CheckCircleOutline,
 ErrorOutline,
 AddBusiness,
 AddCircleOutline,
 LocationOn,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { createUserSchema } from '../../validations/userSchema';
import { orgApi } from '../../api/orgApi';
import { userApi } from '../../api/userApi';
 
const OTHER_DEPARTMENT = '__OTHER_DEPARTMENT__';
const OTHER_DESIGNATION = '__OTHER_DESIGNATION__';
 
const FieldStatus = ({ error, touched }) => {
 if (!touched) return null;
 return error ? (
  <ErrorOutline sx={{ fontSize: 16, color: '#E01950', ml: 0.5 }} />
 ) : (
  <CheckCircleOutline sx={{ fontSize: 16, color: '#24A148', ml: 0.5 }} />
 );
};
 
const CreateUserDialog = ({ open, onClose, onSubmit, loading, error }) => {
 const {
  register,
  handleSubmit,
  control,
  reset,
  watch,
  setValue,
  clearErrors,
  formState: { errors, touchedFields },
 } = useForm({
  resolver: yupResolver(createUserSchema),
  mode: 'onChange',
  defaultValues: {
   firstName: '',
   lastName: '',
   email: '',
   departmentId: '',
   designationId: '',
   locationId: '',
   managerId: '',
  },
 });
 
 const watched = watch();
 const selectedDepartmentId = watch('departmentId');
 const selectedDesignationId = watch('designationId');
 const selectedLocationId = watch('locationId');
 
 const [departments, setDepartments] = useState([]);
 const [designations, setDesignations] = useState([]);
 const [locations, setLocations] = useState([]);
 const [managers, setManagers] = useState([]);
 const [metaLoading, setMetaLoading] = useState(false);
 const [designationLoading, setDesignationLoading] = useState(false);
 const [locationLoading, setLocationLoading] = useState(false);
 const [managerLoading, setManagerLoading] = useState(false);
 
 const [createDepartmentMode, setCreateDepartmentMode] = useState(false);
 const [createDesignationMode, setCreateDesignationMode] = useState(false);
 
 const [newDepartmentName, setNewDepartmentName] = useState('');
 const [newDepartmentDesignationName, setNewDepartmentDesignationName] = useState('');
 const [newDesignationName, setNewDesignationName] = useState('');
 const [newLocationName, setNewLocationName] = useState('');
 
 const [savingDepartment, setSavingDepartment] = useState(false);
 const [savingDesignation, setSavingDesignation] = useState(false);
 const [savingLocation, setSavingLocation] = useState(false);
 const [masterError, setMasterError] = useState('');
 
 const loadDepartments = async () => {
  const res = await orgApi.getAllDepartments();
  const data = res.data?.content || res.data || [];
  setDepartments(Array.isArray(data) ? data : []);
 };
 
 const loadLocations = async () => {
  setLocationLoading(true);
  try {
   const res = await userApi.getAllLocations();
   const data = res.data?.content || res.data || [];
   setLocations(Array.isArray(data) ? data : []);
  } catch {
   setLocations([]);
  } finally {
   setLocationLoading(false);
  }
 };
 
 const loadManagers = async () => {
  setManagerLoading(true);
  try {
   const res = await userApi.getEligibleManagers();
   const data = res.data?.content || res.data || [];
   setManagers(Array.isArray(data) ? data : []);
  } catch {
   setManagers([]);
  } finally {
   setManagerLoading(false);
  }
 };
 
 const loadDesignations = async (departmentId) => {
  if (!departmentId || departmentId === OTHER_DEPARTMENT) {
   setDesignations([]);
   return;
  }
 
  setDesignationLoading(true);
  try {
   const res = await orgApi.getDesignationsByDepartment(departmentId);
   const data = res.data?.content || res.data || [];
   setDesignations(Array.isArray(data) ? data : []);
  } catch {
   setDesignations([]);
  } finally {
   setDesignationLoading(false);
  }
 };
 
 useEffect(() => {
  if (!open) {
   reset();
   setDepartments([]);
   setDesignations([]);
   setLocations([]);
   setManagers([]);
   setCreateDepartmentMode(false);
   setCreateDesignationMode(false);
   setNewDepartmentName('');
   setNewDepartmentDesignationName('');
   setNewDesignationName('');
   setNewLocationName('');
   setMasterError('');
   return;
  }
 
  const init = async () => {
   setMetaLoading(true);
   try {
    await Promise.all([loadDepartments(), loadLocations(), loadManagers()]);
   } catch {
    toast.error('Failed to load masters');
   } finally {
    setMetaLoading(false);
   }
  };
 
  init();
 }, [open, reset]);
 
 useEffect(() => {
  if (!open) return;
 
  if (!selectedDepartmentId || selectedDepartmentId === OTHER_DEPARTMENT) {
   setValue('designationId', '');
   setDesignations([]);
   setCreateDesignationMode(false);
   setNewDesignationName('');
   return;
  }
 
  setValue('designationId', '');
  setCreateDesignationMode(false);
  setNewDesignationName('');
  setMasterError('');
  loadDesignations(selectedDepartmentId);
 }, [selectedDepartmentId, open, setValue]);
 
 useEffect(() => {
  if (selectedDesignationId === OTHER_DESIGNATION) {
   setCreateDesignationMode(true);
   clearErrors('designationId');
  } else {
   setCreateDesignationMode(false);
  }
 }, [selectedDesignationId, clearErrors]);
 
 const selectedDepartmentName = useMemo(() => {
  const found = departments.find((d) => String(d.id) === String(selectedDepartmentId));
  return found?.name || '';
 }, [departments, selectedDepartmentId]);
 
 const selectedLocationName = useMemo(() => {
  const found = locations.find((l) => String(l.id) === String(selectedLocationId));
  return found?.name || '';
 }, [locations, selectedLocationId]);
 
 const handleDepartmentChange = (value, onChange) => {
  setMasterError('');
 
  if (value === OTHER_DEPARTMENT) {
   onChange(value);
   setCreateDepartmentMode(true);
   setCreateDesignationMode(false);
   setNewDesignationName('');
   setValue('designationId', '');
   clearErrors(['departmentId', 'designationId']);
   return;
  }
 
  setCreateDepartmentMode(false);
  onChange(value);
 };
 
 const handleDesignationChange = (value, onChange) => {
  setMasterError('');
  onChange(value);
 
  if (value === OTHER_DESIGNATION) {
   setCreateDesignationMode(true);
   clearErrors('designationId');
  } else {
   setCreateDesignationMode(false);
  }
 };
 
 const handleCreateDepartmentAndDesignation = async () => {
  const dept = newDepartmentName.trim();
  const desig = newDepartmentDesignationName.trim();
 
  if (!dept) {
   setMasterError('Department name is required');
   return;
  }
 
  if (!desig) {
   setMasterError('First designation name is required');
   return;
  }
 
  if (!/^[A-Za-zs]{2,50}$/.test(dept)) {
   setMasterError('Department must contain only alphabets (min 2 characters)');
   return;
  }
 
  if (!/^[A-Za-zs]{2,50}$/.test(desig)) {
   setMasterError('Designation must contain only alphabets (min 2 characters)');
   return;
  }
 
  if (departments.some((d) => d.name.toLowerCase() === dept.toLowerCase())) {
   setMasterError('Department already exists');
   return;
  }
 
  setSavingDepartment(true);
  setMasterError('');
 
  try {
   const deptRes = await orgApi.createDepartment({
    name: newDepartmentName.trim(),
   });
 
   const createdDepartment = deptRes.data;
 
   const desigRes = await orgApi.createDesignation({
    name: newDepartmentDesignationName.trim(),
    departmentId: createdDepartment.id,
   });
 
   const createdDesignation = desigRes.data;
 
   await loadDepartments();
   await loadDesignations(createdDepartment.id);
 
   setValue('departmentId', createdDepartment.id, { shouldValidate: true });
   setValue('designationId', createdDesignation.id, { shouldValidate: true });
 
   setCreateDepartmentMode(false);
   setNewDepartmentName('');
   setNewDepartmentDesignationName('');
   clearErrors(['departmentId', 'designationId']);
 
   toast.success('Department and designation created successfully');
  } catch (err) {
   setMasterError(err.response?.data?.message || 'Failed to create department/designation');
  } finally {
   setSavingDepartment(false);
  }
 };
 
 const handleCreateDesignation = async () => {
  const desig = newDesignationName.trim();
 
  if (!selectedDepartmentId || selectedDepartmentId === OTHER_DEPARTMENT) {
   setMasterError('Please select a valid department first');
   return;
  }
 
  if (!desig) {
   setMasterError('Designation name is required');
   return;
  }
 
  if (!/^[A-Za-zs]{2,50}$/.test(desig)) {
   setMasterError('Designation must contain only alphabets (min 2 characters)');
   return;
  }
 
  if (designations.some((d) => d.name.toLowerCase() === desig.toLowerCase())) {
   setMasterError('Designation already exists');
   return;
  }
 
  setSavingDesignation(true);
  setMasterError('');
 
  try {
   const res = await orgApi.createDesignation({
    name: newDesignationName.trim(),
    departmentId: Number(selectedDepartmentId),
   });
 
   const createdDesignation = res.data;
 
   await loadDesignations(selectedDepartmentId);
 
   setValue('designationId', createdDesignation.id, { shouldValidate: true });
   setCreateDesignationMode(false);
   setNewDesignationName('');
   clearErrors('designationId');
 
   toast.success('Designation created successfully');
  } catch (err) {
   setMasterError(err.response?.data?.message || 'Failed to create designation');
  } finally {
   setSavingDesignation(false);
  }
 };
 
 const handleCreateLocation = async () => {
  if (!newLocationName.trim()) {
   setMasterError('Location name is required');
   return;
  }
 
  setSavingLocation(true);
  setMasterError('');
 
  try {
   const res = await userApi.createLocation({
    name: newLocationName.trim(),
   });
 
   const createdLocation = res.data;
 
   await loadLocations();
   setValue('locationId', createdLocation.id, { shouldValidate: true });
   setNewLocationName('');
 
   toast.success('Location created successfully');
  } catch (err) {
   setMasterError(err.response?.data?.message || 'Failed to create location');
  } finally {
   setSavingLocation(false);
  }
 };
 
 const handleFinalSubmit = (formData) => {
  if (
   formData.departmentId === OTHER_DEPARTMENT ||
   formData.designationId === OTHER_DESIGNATION
  ) {
   setMasterError('Please finish creating and selecting department/designation');
   return;
  }
 
  const payload = {
   firstName: formData.firstName.trim(),
   lastName: formData.lastName.trim(),
   email: formData.email.trim(),
   departmentId: Number(formData.departmentId),
   designationId: Number(formData.designationId),
   locationId: formData.locationId ? Number(formData.locationId) : null,
   managerId: formData.managerId ? Number(formData.managerId) : null,
  };
 
  onSubmit(payload);
 };
 
 return (
  <Dialog open={open} onClose={() => !loading && onClose()} maxWidth="sm" fullWidth>
   <DialogTitle sx={{ pb: 1 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box
       sx={{
        width: 36,
        height: 36,
        borderRadius: 2,
        background: 'linear-gradient(135deg, #27235C, #97247E)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
       }}
      >
       <PersonAdd sx={{ color: '#fff', fontSize: 18 }} />
      </Box>
      <Box>
       <Typography fontWeight={700} fontSize="0.95rem">
        Create new user
       </Typography>
       <Typography fontSize="0.75rem" color="text.secondary">
        User receives a temp password by email
       </Typography>
      </Box>
     </Box>
 
     <IconButton onClick={onClose} disabled={loading} size="small" sx={{ color: '#6B7280' }}>
      <Close fontSize="small" />
     </IconButton>
    </Box>
   </DialogTitle>
 
   <Divider />
 
   <DialogContent sx={{ pt: 2.5 }}>
    {error && (
     <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
      {error}
     </Alert>
    )}
 
    {masterError && (
     <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
      {masterError}
     </Alert>
    )}
 
    <Box component="form" id="create-user-form" onSubmit={handleSubmit(handleFinalSubmit)} noValidate>
     <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
       <TextField
        {...register('firstName')}
        label="First name"
        fullWidth
        error={!!errors.firstName}
        helperText={errors.firstName?.message}
        InputProps={{
         endAdornment: (
          <FieldStatus error={!!errors.firstName} touched={touchedFields.firstName} />
         ),
        }}
       />
      </Grid>
 <Grid item xs={12} sm={6}>
       <TextField
        {...register('lastName')}
        label="Last name"
        fullWidth
        error={!!errors.lastName}
        helperText={errors.lastName?.message}
        InputProps={{
         endAdornment: (
          <FieldStatus error={!!errors.lastName} touched={touchedFields.lastName} />
         ),
        }}
       />
      </Grid>
 
      <Grid item xs={12}>
       <TextField
        {...register('email')}
        label="Email address"
        type="email"
        fullWidth
        error={!!errors.email}
        helperText={errors.email?.message || 'Temp password will be sent to this email'}
        InputProps={{
         endAdornment: (
          <FieldStatus error={!!errors.email} touched={touchedFields.email} />
         ),
        }}
       />
      </Grid>
 
      <Grid item xs={12} sm={6}>
       <Controller
        name="departmentId"
        control={control}
        render={({ field }) => (
         <TextField
          select
          fullWidth
          label="Department"
          value={field.value}
          onChange={(e) => handleDepartmentChange(e.target.value, field.onChange)}
          error={!!errors.departmentId}
          helperText={errors.departmentId?.message}
          disabled={metaLoading}
         >
          <MenuItem value="">
           <em>{metaLoading ? 'Loading departments...' : 'Select department'}</em>
          </MenuItem>
 
          {departments.map((dept) => (
           <MenuItem key={dept.id} value={dept.id}>
            {dept.name}
           </MenuItem>
          ))}
 
          <MenuItem value={OTHER_DEPARTMENT}>
           + Other / Create new department
          </MenuItem>
         </TextField>
        )}
       />
      </Grid>
 <Grid item xs={12} sm={6}>
       <Controller
        name="designationId"
        control={control}
        render={({ field }) => (
         <TextField
          select
          fullWidth
          label="Designation"
          value={field.value}
          onChange={(e) => handleDesignationChange(e.target.value, field.onChange)}
          error={!!errors.designationId}
          helperText={
           errors.designationId?.message ||
           (!selectedDepartmentId || selectedDepartmentId === OTHER_DEPARTMENT
            ? 'Select valid department first'
            : `Select designation for ${selectedDepartmentName}`)
          }
          disabled={
           !selectedDepartmentId ||
           selectedDepartmentId === OTHER_DEPARTMENT ||
           designationLoading
          }
         >
          <MenuItem value="">
           <em>
            {designationLoading
             ? 'Loading designations...'
             : !selectedDepartmentId || selectedDepartmentId === OTHER_DEPARTMENT
             ? 'Select valid department first'
             : 'Select designation'}
           </em>
          </MenuItem>
 
          {designations.map((desig) => (
           <MenuItem key={desig.id} value={desig.id}>
            {desig.name}
           </MenuItem>
          ))}
 
          {selectedDepartmentId && selectedDepartmentId !== OTHER_DEPARTMENT && (
           <MenuItem value={OTHER_DESIGNATION}>
            + Other / Create new designation
           </MenuItem>
          )}
         </TextField>
        )}
       />
      </Grid>
 
      <Grid item xs={12}>
       <Controller
        name="locationId"
        control={control}
        render={({ field }) => (
         <TextField
          select
          fullWidth
          label="Location"
          value={field.value}
          onChange={field.onChange}
          error={!!errors.locationId}
          helperText={errors.locationId?.message || 'Optional location mapping'}
          disabled={metaLoading || locationLoading}
         >
          <MenuItem value="">
           <em>
            {locationLoading ? 'Loading locations...' : 'Select location'}
           </em>
          </MenuItem>
 
          {locations.map((location) => (
           <MenuItem key={location.id} value={location.id}>
            {location.name}
           </MenuItem>
          ))}
         </TextField>
        )}
       />
      </Grid>
 {/* <Grid item xs={12}>
       <Controller
        name="managerId"
        control={control}
        render={({ field }) => (
         <TextField
          {...field}
          select
          fullWidth
          label="Manager (optional)"
          helperText="Assign a manager to this user — required for END_USER role context"
          disabled={managerLoading}
         >
          <MenuItem value="">— No manager —</MenuItem>
          {managers.map((m) => (
           <MenuItem key={m.id} value={m.id}>
            {m.fullName || `${m.firstName} ${m.lastName}`}
            {m.designationName ? ` · ${m.designationName}` : ''}
           </MenuItem>
          ))}
         </TextField>
        )}
       />
      </Grid> */}
     </Grid>
 
     {createDepartmentMode && (
      <Box
       sx={{
        mt: 2.5,
        p: 2,
        border: '1px dashed #D1D5DB',
        borderRadius: 2,
        backgroundColor: '#FAFAFD',
       }}
      >
       <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
        <AddBusiness sx={{ color: '#27235C', fontSize: 18 }} />
        <Typography fontWeight={700} fontSize="0.9rem">
         Create new department
        </Typography>
       </Stack>
 
       <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
         <TextField
          label="New department name"
          fullWidth
          value={newDepartmentName}
          onChange={(e) => setNewDepartmentName(e.target.value)}
          placeholder="e.g. Procurement"
         />
        </Grid>
 
        <Grid item xs={12} sm={6}>
         <TextField
          label="First designation for this department"
          fullWidth
          value={newDepartmentDesignationName}
          onChange={(e) => setNewDepartmentDesignationName(e.target.value)}
          placeholder="e.g. Procurement Manager"
         />
        </Grid>
       </Grid>
 
       <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
        <Button
         variant="contained"
         onClick={handleCreateDepartmentAndDesignation}
         disabled={savingDepartment}
        >
         {savingDepartment ? (
          <>
           <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
           Saving...
          </>
         ) : (
          'Create department'
         )}
        </Button>
 
        <Button
         variant="outlined"
         onClick={() => {
          setCreateDepartmentMode(false);
          setNewDepartmentName('');
          setNewDepartmentDesignationName('');
          setMasterError('');
          setValue('departmentId', '');
          setValue('designationId', '');
         }}
         disabled={savingDepartment}
        >
         Cancel
        </Button>
       </Stack>
      </Box>
     )}
  {createDesignationMode && !createDepartmentMode && (
      <Box
       sx={{
        mt: 2.5,
        p: 2,
        border: '1px dashed #D1D5DB',
        borderRadius: 2,
        backgroundColor: '#FAFAFD',
       }}
      >
       <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
        <AddCircleOutline sx={{ color: '#27235C', fontSize: 18 }} />
        <Typography fontWeight={700} fontSize="0.9rem">
         Create new designation for {selectedDepartmentName || 'selected department'}
        </Typography>
       </Stack>
 
       <Grid container spacing={2}>
        <Grid item xs={12}>
         <TextField
          label="New designation name"
          fullWidth
          value={newDesignationName}
          onChange={(e) => setNewDesignationName(e.target.value)}
          placeholder="e.g. Senior HR Executive"
         />
        </Grid>
       </Grid>
 
       <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
        <Button
         variant="contained"
         onClick={handleCreateDesignation}
         disabled={savingDesignation}
        >
         {savingDesignation ? (
          <>
           <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
           Saving...
          </>
         ) : (
          'Create designation'
         )}
        </Button>
 
        <Button
         variant="outlined"
         onClick={() => {
          setCreateDesignationMode(false);
          setNewDesignationName('');
          setMasterError('');
          setValue('designationId', '');
         }}
         disabled={savingDesignation}
        >
         Cancel
        </Button>
       </Stack>
      </Box>
     )}
 
     {(watched.firstName || watched.email) && (
      <Box
       sx={{
        mt: 2,
        p: 1.5,
        backgroundColor: '#F8F8FC',
        borderRadius: 2,
        border: '1px solid #E5E7EB',
       }}
      >
       <Typography
        sx={{
         fontSize: '0.72rem',
         color: '#6B7280',
         mb: 0.5,
         fontWeight: 600,
         textTransform: 'uppercase',
         letterSpacing: '0.04em',
        }}
       >
        Preview
       </Typography>
 
       <Typography sx={{ fontSize: '0.82rem', color: '#1B193F' }}>
        <strong>{[watched.firstName, watched.lastName].filter(Boolean).join(' ') || '—'}</strong>
        {watched.email ? ` · ${watched.email}` : ''}
        {selectedDepartmentName ? ` · ${selectedDepartmentName}` : ''}
        {selectedLocationName ? ` · ${selectedLocationName}` : ''}
       </Typography>
      </Box>
     )}
    </Box>
   </DialogContent>
 
   <Divider />
 
   <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
    <Button variant="outlined" onClick={onClose} disabled={loading}>
     Cancel
    </Button>
 
    <Button
     type="submit"
     form="create-user-form"
     variant="contained"
     disabled={loading || metaLoading || managerLoading}
    >
     {loading ? <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} /> : null}
     {loading ? 'Creating...' : 'Create user'}
    </Button>
   </DialogActions>
  </Dialog>
 );
};
 
export default CreateUserDialog;
 