// serviceCatalogApi.js
const BASE_URL = 'http://localhost:8080/api/service-catalog';

/* ── Service Types ── */
export const getServiceTypes = async () => {
  const res = await fetch(`${BASE_URL}/serviceTypes`);
  return { data: await res.json() };
};
export const createServiceType = async (body) => {
  const res = await fetch(`${BASE_URL}/serviceTypes`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { data: await res.json() };
};
export const updateServiceType = async (id, body) => {
  const res = await fetch(`${BASE_URL}/serviceTypes/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { data: await res.json() };
};
export const deleteServiceType = async (id) => {
  let res = await fetch(`${BASE_URL}/serviceTypes/${id}`, { method: 'DELETE' });
  return res;
};

/* ── Categories ── */
export const getCategoriesByType = async (typeId) => {
  const res = await fetch(`${BASE_URL}/categories?serviceTypeId=${typeId}`);
  return { data: await res.json() };
};
export const getServiceCategories = async () => {
  const res = await fetch(`${BASE_URL}/categories`);
  return { data: await res.json() };
};
export const createCategory = async (body) => {
  const res = await fetch(`${BASE_URL}/categories`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { data: await res.json() };
};
export const updateCategory = async (id, body) => {
  const res = await fetch(`${BASE_URL}/categories/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { data: await res.json() };
};
export const deleteCategory = async (id) => {
  return await fetch(`${BASE_URL}/categories/${id}`, { method: 'DELETE' });
};

/* ── Subcategories ── */
export const getSubcategoriesByCategory = async (categoryId) => {
  const res = await fetch(`${BASE_URL}/subcategories?categoryId=${categoryId}`);
  return { data: await res.json() };
};
export const getSubcategories = getSubcategoriesByCategory;
export const createSubcategory = async (body) => {
  const res = await fetch(`${BASE_URL}/subcategories`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { data: await res.json() };
};
export const updateSubcategory = async (id, body) => {
  const res = await fetch(`${BASE_URL}/subcategories/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { data: await res.json() };
};
export const deleteSubcategory = async (id) => {
  return await fetch(`${BASE_URL}/subcategories/${id}`, { method: 'DELETE' });
};


/* ── Services / Items ── */
export const getItemsBySubcategory = async (subcategoryId) => {
  const res = await fetch(`${BASE_URL}/services?subcategoryId=${subcategoryId}`);
  console.log(res);
  
  return { data: await res.json() };
};
export const getAllServices = async () => {
  const res = await fetch(`${BASE_URL}/services`);
  return { data: await res.json() };
};
export const getServicesByCategory = async (categoryId) => {
  const res = await fetch(`${BASE_URL}/services?categoryId=${categoryId}`);
  return { data: await res.json() };
};
export const getServiceById = async (id) => {
  const res = await fetch(`${BASE_URL}/services/${id}`);
  return { data: await res.json() };
};
export const createService = async (body) => {
  const res = await fetch(`${BASE_URL}/services`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { data: await res.json() };
};
export const updateService = async (id, body) => {
  const res = await fetch(`${BASE_URL}/services/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { data: await res.json() };
};
export const deleteService = async (id) => {
  await fetch(`${BASE_URL}/services/${id}`, { method: 'DELETE' });
  return { data: null };
};

/* ── SLA & Approval ── */
export const getServiceSla = async (serviceId) => {
  const res = await fetch(`${BASE_URL}/services/${serviceId}`);
  const service = await res.json();
  return { data: { slaHours: service.slaHours ?? null } };
};
export const getApprovalWorkflow = async (serviceId) => {
  const res = await fetch(`${BASE_URL}/services/${serviceId}`);
  const service = await res.json();
  if (!service.requiresApproval) return { data: [] };
  return { data: [{ level: 1, approverRole: 'Manager', mandatory: true }] };
};

/* ── Requests ── */
export const submitServiceRequest = async (serviceId, body) => {
  const res = await fetch(`${BASE_URL}/requests`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ serviceId, ...body, status: 'SUBMITTED', createdAt: new Date().toISOString() }),
  });
  return { data: await res.json() };
};
export const getMyRequests = async () => {
  const res = await fetch(`${BASE_URL}/requests`);
  return { data: await res.json() };
};
export const getRequestById = async (id) => {
  const res = await fetch(`${BASE_URL}/requests/${id}`);
  return { data: await res.json() };
};
export const cancelRequest = async (id) => {
  const res = await fetch(`${BASE_URL}/requests/${id}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'CANCELLED' }),
  });
  return { data: await res.json() };
};
