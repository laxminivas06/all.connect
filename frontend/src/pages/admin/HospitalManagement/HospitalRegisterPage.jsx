import React from 'react';
import { Navigate } from 'react-router-dom';

export const HospitalRegisterPage = () => {
  return <Navigate to="/dashboard/admin/register-organisation?type=hospital" replace />;
};

export default HospitalRegisterPage;
