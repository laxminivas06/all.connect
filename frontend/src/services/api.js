const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('allconnect_token');
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  if (!response.ok) {
    let errorDetail = 'An unexpected error occurred';
    try {
      const errorData = await response.json();
      errorDetail = errorData.detail || errorData.message || JSON.stringify(errorData);
    } catch {
      errorDetail = response.statusText;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  registerPatient: (data) => request('/auth/register-patient', { method: 'POST', body: JSON.stringify(data) }),
  registerOrg: (data) => request('/auth/register-organization', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/auth/me'),
  getDemoAccounts: () => request('/auth/demo-accounts'),
  changePassword: (data) => request('/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),

  // Patient
  getMyPatientData: () => request('/patients/me'),
  getMyDoctors: () => request('/patients/me/doctors'),
  updateMyPatientProfile: (data) => request('/patients/me', { method: 'PUT', body: JSON.stringify(data) }),
  updateConsent: (data) => request('/patients/consent', { method: 'PUT', body: JSON.stringify(data) }),
  searchPatients: (query = '') => request(`/patients/search?query=${encodeURIComponent(query)}`),
  getPatientProfile: (patientId) => request(`/patients/${patientId}`),
  getMyPatientQrToken: () => request('/patients/me/qr-token'),
  refreshMyPatientQrToken: () => request('/patients/me/qr-token/refresh', { method: 'POST' }),
  verifyPatientCard: (token) => request(`/patients/verify-card?token=${encodeURIComponent(token)}`),

  // Hospitals
  getHospitals: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/hospitals${q ? `?${q}` : ''}`);
  },
  getHospital: (id) => request(`/hospitals/${id}`),
  getHospitalPublic: (id) => request(`/hospitals/${id}`),
  getHospitalDashboard: () => request('/hospitals/dashboard/overview'),
  addHospitalDoctor: (data) => request('/hospitals/dashboard/doctors', { method: 'POST', body: JSON.stringify(data) }),
  updateHospitalSettings: (data) => request('/hospitals/dashboard/settings', { method: 'PUT', body: JSON.stringify(data) }),
  updateHospitalDocuments: (data) => request('/hospitals/dashboard/documents', { method: 'PUT', body: JSON.stringify(data) }),

  // Clinics
  getClinics: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/clinics${q ? `?${q}` : ''}`);
  },
  getClinic: (id) => request(`/clinics/${id}`),
  getClinicDashboard: () => request('/clinics/dashboard/overview'),
  updateClinicSettings: (data) => request('/clinics/dashboard/settings', { method: 'PUT', body: JSON.stringify(data) }),
  updateClinicDocuments: (data) => request('/clinics/dashboard/documents', { method: 'PUT', body: JSON.stringify(data) }),

  // Doctors
  getDoctors: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/doctors${q ? `?${q}` : ''}`);
  },
  getDoctor: (id) => request(`/doctors/${id}`),
  getDoctorDashboard: () => request('/doctors/dashboard/overview'),
  discoverySearchDoctors: (query, facilityType = null) => {
    const ftypeParam = facilityType ? `&facility_type=${encodeURIComponent(facilityType)}` : '';
    return request(`/doctors/discovery-search?query=${encodeURIComponent(query)}${ftypeParam}`);
  },
  enquireProcedure: (data) => request('/doctors/procedures/enquire', { method: 'POST', body: JSON.stringify(data) }),
  createDoctor: (data) => request('/doctors', { method: 'POST', body: JSON.stringify(data) }),
  updateDoctorAvailability: (id, data) => request(`/doctors/${id}/availability`, { method: 'PUT', body: JSON.stringify(data) }),
  updateDoctorProfile: (id, data) => request(`/doctors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getDoctorSchedule: (doctorId) => request(`/doctors/${doctorId}/schedule`),
  getDoctorDailySlots: (doctorId, date, mode = 'In-Person') => request(`/doctors/${doctorId}/daily-slots?date=${encodeURIComponent(date)}&mode=${encodeURIComponent(mode)}`),
  getDoctorMonthAvailability: (doctorId, year, month) => request(`/doctors/${doctorId}/month-availability?year=${year}&month=${month}`),
  applyDoctorLeave: (doctorId, data) => request(`/doctors/${doctorId}/leave`, { method: 'POST', body: JSON.stringify(data) }),
  cancelDoctorLeave: (doctorId) => request(`/doctors/${doctorId}/leave/cancel`, { method: 'PUT' }),
  getDoctorLeaves: (doctorId) => request(`/doctors/${doctorId}/leaves`),

  // Appointments
  getAppointments: (status) => request(`/appointments${status ? `?status=${status}` : ''}`),
  getAppointmentPricingQuote: (data) => request('/appointments/pricing-quote', { method: 'POST', body: JSON.stringify(data) }),
  bookAppointment: (data) => request('/appointments/book', { method: 'POST', body: JSON.stringify(data) }),
  cancelAppointment: (id, data) => request(`/appointments/${id}/cancel`, { method: 'PUT', body: JSON.stringify(data || {}) }),
  rescheduleAppointment: (id, data) => request(`/appointments/${id}/reschedule`, { method: 'PUT', body: JSON.stringify(data) }),
  updateAppointmentStatus: (id, data) => request(`/appointments/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),
  assignAppointmentDoctor: (id, data) => request(`/appointments/${id}/assign`, { method: 'PUT', body: JSON.stringify(data) }),
  updateAppointmentBilling: (id, data) => request(`/appointments/${id}/billing`, { method: 'PUT', body: JSON.stringify(data) }),

  // Clinical Services
  getServices: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/services${q ? `?${q}` : ''}`);
  },
  createService: (data) => request('/services', { method: 'POST', body: JSON.stringify(data) }),
  updateService: (id, data) => request(`/services/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteService: (id) => request(`/services/${id}`, { method: 'DELETE' }),

  // Prescriptions
  getPrescriptions: () => request('/prescriptions'),
  getPrescription: (id) => request(`/prescriptions/${id}`),
  createPrescription: (data) => request('/prescriptions/create', { method: 'POST', body: JSON.stringify(data) }),
  simulateOcr: (data = {}) => request('/prescriptions/simulate-ocr', { method: 'POST', body: JSON.stringify(data) }),
  uploadOcrPrescription: (data) => request('/prescriptions/upload-ocr', { method: 'POST', body: JSON.stringify(data) }),

  // Pharmacies
  getPharmacies: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/pharmacies${q ? `?${q}` : ''}`);
  },
  getPharmacy: (id) => request(`/pharmacies/${id}`),
  getPharmacyDashboard: () => request('/pharmacies/dashboard/overview'),

  // Orders & Quotes
  getOrders: () => request('/orders'),
  requestQuotations: (data) => request('/orders/request-quotations', { method: 'POST', body: JSON.stringify(data) }),
  placeOrder: (data) => request('/orders/place-order', { method: 'POST', body: JSON.stringify(data) }),
  updateOrderStatus: (id, data) => request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),

  // Offers
  getPublishedOffers: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/offers${q ? `?${q}` : ''}`);
  },
  getMyOffers: () => request('/offers/my'),
  createOffer: (data) => request('/offers/create', { method: 'POST', body: JSON.stringify(data) }),
  updateOfferStatus: (id, data) => request(`/offers/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),
  updateOffer: (id, data) => request(`/offers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteOffer: (id) => request(`/offers/${id}`, { method: 'DELETE' }),

  // Subscriptions
  getSubscriptionPlans: () => request('/subscriptions/plans'),
  getCurrentSubscription: () => request('/subscriptions/current'),
  subscribePlan: (data) => request('/subscriptions/subscribe', { method: 'POST', body: JSON.stringify(data) }),
  requestSubscriptionUpgrade: (data) => request('/subscriptions/request-upgrade', { method: 'POST', body: JSON.stringify(data) }),
  renewSubscription: (data = {}) => request('/subscriptions/renew', { method: 'POST', body: JSON.stringify(data) }),

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request('/notifications/mark-all-read', { method: 'PUT' }),
  deleteNotification: (id) => request(`/notifications/${id}`, { method: 'DELETE' }),
  deleteAllNotifications: () => request('/notifications', { method: 'DELETE' }),

  // Admin
  getAdminOverview: () => request('/admin/overview'),
  getAdminOrganizations: () => request('/admin/organizations'),
  updateOrgPublishing: (orgId, data) => request(`/admin/organizations/${orgId}/publishing`, { method: 'PUT', body: JSON.stringify(data) }),
  getAdminAdvertisements: () => request('/admin/advertisements'),
  moderateAdvertisement: (offerId, action) => request(`/admin/advertisements/${offerId}/moderate?action=${action}`, { method: 'PUT' }),
  getAdminPharmacies: () => request('/admin/pharmacies'),
  verifyPharmacy: (pharmacyId, status) => request(`/admin/pharmacies/${pharmacyId}/verify?status_val=${status}`, { method: 'PUT' }),
  getAdminDoctors: () => request('/admin/doctors'),
  verifyDoctor: (doctorId, status) => request(`/admin/doctors/${doctorId}/verify?status_val=${status}`, { method: 'PUT' }),
  getAdminAuditLogs: () => request('/admin/audit-logs'),
  getAdminSystemHealth: () => request('/admin/system-health'),
  overrideOrgSubscription: (orgId, data) => request(`/admin/organizations/${orgId}/subscription-override`, { method: 'PUT', body: JSON.stringify(data) }),
  getAdminPatients: () => request('/admin/patients'),
  updatePatientStatus: (id, status) => request(`/admin/patients/${id}/status?status_val=${status}`, { method: 'PUT' }),
  registerHospitalAdmin: (data) => request('/admin/hospitals/register', { method: 'POST', body: JSON.stringify(data) }),
  updateHospitalAdmin: (id, data) => request(`/admin/hospitals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  reviewOrgAdmin: (id, data) => request(`/admin/organizations/${id}/review`, { method: 'PUT', body: JSON.stringify(data) }),
  registerClinicAdmin: (data) => request('/admin/clinics/register', { method: 'POST', body: JSON.stringify(data) }),
  updateClinicAdmin: (id, data) => request(`/admin/clinics/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  registerDoctorAdmin: (data) => request('/admin/doctors/register', { method: 'POST', body: JSON.stringify(data) }),
  registerPharmacyAdmin: (data) => request('/admin/pharmacies/register', { method: 'POST', body: JSON.stringify(data) }),
  getAdminPlans: () => request('/admin/plans'),
  createAdminPlan: (data) => request('/admin/plans', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminPlan: (id, data) => request(`/admin/plans/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminPlan: (id) => request(`/admin/plans/${id}`, { method: 'DELETE' }),
  getAdminSubscriptions: () => request('/admin/subscriptions'),
  updateSubscriptionStatus: (subId, data) => request(`/admin/subscriptions/${subId}/status`, { method: 'PUT', body: JSON.stringify(data) }),
  uploadAdminDocument: (formData) => request('/admin/documents/upload', { method: 'POST', body: formData }),
  uploadOrgLogo: (formData) => request('/admin/organizations/upload-logo', { method: 'POST', body: formData }),
  uploadOrgDocument: (formData) => request('/admin/organizations/upload-document', { method: 'POST', body: formData }),
  deleteAdminDocument: (filename) => request(`/admin/documents/${filename}`, { method: 'DELETE' }),
  getAdminBillingOverview: () => request('/admin/billing/overview'),
  getAdminBillingPayments: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/admin/billing/payments${q ? `?${q}` : ''}`);
  },
  recordAdminPayment: (data) => request('/admin/billing/record-payment', { method: 'POST', body: JSON.stringify(data) }),
  registerOrganizationUnified: (data) => request('/admin/organizations/register', { method: 'POST', body: JSON.stringify(data) }),
  toggleHospitalStatus: (id, status) => request(`/admin/hospitals/${id}/status?status_val=${status}`, { method: 'PUT' }),
  toggleClinicStatus: (id, status) => request(`/admin/clinics/${id}/status?status_val=${status}`, { method: 'PUT' }),
  updatePharmacyAdmin: (id, data) => request(`/admin/pharmacies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  togglePharmacyStatus: (id, status) => request(`/admin/pharmacies/${id}/status?status_val=${status}`, { method: 'PUT' }),
  verifyPharmacyLicense: (id, data) => request(`/admin/pharmacies/${id}/license-verify`, { method: 'PUT', body: JSON.stringify(data) }),
};
