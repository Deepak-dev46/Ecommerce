import * as yup from 'yup';
 
export const createUserSchema = yup.object({
  firstName: yup
    .string()
    .matches(/^[A-Za-z]+$/, 'Only letters allowed')
    .min(2, 'Min 2 characters')
    .required('First name is required'),
  lastName: yup
    .string()
    .matches(/^[A-Za-z]+$/, 'Only letters allowed')
    .min(2, 'Min 2 characters')
    .required('Last name is required'),
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
  departmentId: yup.mixed().required('Department is required'),   // ← fixed
  designationId: yup.mixed().required('Designation is required'), // ← fixed
  locationId: yup.mixed().nullable().optional(),                  // ← added (optional)
});
 
export const editUserSchema = yup.object({
  firstName: yup.string().matches(/^[A-Za-z]+$/, 'Only letters').min(2).required('Required'),
  lastName: yup.string().matches(/^[A-Za-z]+$/, 'Only letters').min(2).required('Required'),
  departmentId: yup.mixed().required('Required'),   // ← fixed
  designationId: yup.mixed().required('Required'),  // ← fixed
});
 
 