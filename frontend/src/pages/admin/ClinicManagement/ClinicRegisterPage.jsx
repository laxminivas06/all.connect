import React from 'react';
import { Navigate } from 'react-router-dom';

export const ClinicRegisterPage = () => {
  return <Navigate to="/dashboard/admin/register-organisation?type=clinic" replace />;
};

export default ClinicRegisterPage;
