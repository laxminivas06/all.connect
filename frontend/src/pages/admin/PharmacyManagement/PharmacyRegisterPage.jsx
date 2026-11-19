import React from 'react';
import { Navigate } from 'react-router-dom';

export const PharmacyRegisterPage = () => {
  return <Navigate to="/dashboard/admin/register-organisation?type=pharmacy" replace />;
};

export default PharmacyRegisterPage;
