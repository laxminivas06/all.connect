import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Overview
import { SuperAdminOverview } from './SuperAdminOverview';

// Unified Organisation Registration
import { UnifiedOrgRegisterPage } from './UnifiedRegistration/UnifiedOrgRegisterPage';

// Hospital Management
import { HospitalsListPage } from './HospitalManagement/HospitalsListPage';
import { HospitalDetailPage } from './HospitalManagement/HospitalDetailPage';
import { HospitalApprovalsPage } from './HospitalManagement/HospitalApprovalsPage';
import { HospitalSubscriptionsPage } from './HospitalManagement/HospitalSubscriptionsPage';

// Clinic Management
import { ClinicsListPage } from './ClinicManagement/ClinicsListPage';

// Patient Management
import { PatientsListPage } from './PatientManagement/PatientsListPage';

// Pharmacy Management
import { PharmaciesListPage } from './PharmacyManagement/PharmaciesListPage';

// SaaS Plans & Subscriptions
import { SubscriptionPlansPage } from './SubscriptionPlans/SubscriptionPlansPage';

// Promotions & Ads Monitor
import { PromotionsManagerPage } from './PromotionsManagement/PromotionsManagerPage';

// Billing & Revenue
import { BillingRevenuePage } from './BillingRevenue/BillingRevenuePage';

// Settings & Security Audit
import { AdminSettingsPage } from './AdminSettings/AdminSettingsPage';

// Data Management Centre & 7-Day Rolling Backups
import { DataManagementPage } from './DataManagement/DataManagementPage';

export const SuperAdminRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<SuperAdminOverview />} />
      
      {/* Central Unified Organisation Registration */}
      <Route path="register-organisation" element={<UnifiedOrgRegisterPage />} />
      <Route path="organisations/register" element={<UnifiedOrgRegisterPage />} />

      {/* Hospital Management */}
      <Route path="hospitals" element={<HospitalsListPage />} />
      <Route path="hospitals/register" element={<Navigate to="/dashboard/admin/register-organisation?type=hospital" replace />} />
      <Route path="hospitals/approvals" element={<HospitalApprovalsPage />} />
      <Route path="approvals" element={<HospitalApprovalsPage />} />
      <Route path="hospitals/subscriptions" element={<HospitalSubscriptionsPage />} />
      <Route path="hospitals/:id" element={<HospitalDetailPage />} />

      {/* Clinic Management */}
      <Route path="clinics" element={<ClinicsListPage />} />
      <Route path="clinics/register" element={<Navigate to="/dashboard/admin/register-organisation?type=clinic" replace />} />

      {/* Doctor Management - Redirected to Platform Overview with Notice */}
      <Route path="doctors" element={<Navigate to="/dashboard/admin" replace />} />
      <Route path="doctors/register" element={<Navigate to="/dashboard/admin" replace />} />

      {/* Patient Management */}
      <Route path="patients" element={<PatientsListPage />} />

      {/* Pharmacy Management */}
      <Route path="pharmacies" element={<PharmaciesListPage />} />
      <Route path="pharmacies/register" element={<Navigate to="/dashboard/admin/register-organisation?type=pharmacy" replace />} />

      {/* Subscriptions & Plans */}
      <Route path="subscriptions" element={<SubscriptionPlansPage />} />

      {/* Promotions & Ads */}
      <Route path="promotions" element={<PromotionsManagerPage />} />

      {/* Billing & Revenue */}
      <Route path="billing" element={<BillingRevenuePage />} />

      {/* Data Management & 7-Day Backups */}
      <Route path="data-management" element={<DataManagementPage />} />
      <Route path="storage" element={<DataManagementPage />} />
      <Route path="backups" element={<DataManagementPage />} />

      {/* Settings & Security Audit */}
      <Route path="settings" element={<AdminSettingsPage />} />
      <Route path="audit" element={<AdminSettingsPage defaultTab="audit" />} />
    </Routes>
  );
};
