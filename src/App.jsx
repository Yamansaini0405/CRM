import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import { useAuth } from './contexts/AuthContext'
import DashboardLayout from './layouts/DashboardLayout'
import CustomerView from './pages/customers/CustomerView'
import CustomerCreate from './pages/customers/CustomerCreate'
import LinkView from './pages/links/LinkView'
import Users from './pages/Users'
import CustomerEdit from './pages/customers/CustomerEdit'
import BankManagement from './pages/BankManagement'
import ProductManagement from './pages/ProductManagement'
import TermsAndConditionsPage from './pages/TermsAndConditionsPage'

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/dashboard" replace />;

  return children;
}

function App() {
  return (
    <Routes>
      <Route path='/onboard/customer/:id/:id' element={<div>Hello customer</div>}/>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CustomerView />} />
        <Route path="customers" element={<CustomerView />} />
        <Route path="customers/create" element={<CustomerCreate />} />
        <Route path="customers/edit/:id" element={<CustomerEdit />} />
        <Route path="links" element={<LinkView />} />
        <Route path='create-bank' element={<BankManagement/>}/>
        <Route path='create-product' element={<ProductManagement/>}/>
        <Route path='/terms-and-conditions' element={<TermsAndConditionsPage/>}/>
        <Route path="users" element={<ProtectedRoute requiredRole="ADMIN"><Users /></ProtectedRoute>} />
      </Route>
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App