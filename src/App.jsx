// src/App.js
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import PrivateRoute from './components/Layout/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import UserDetails from './pages/Users/UserDetails';
import Verification from './pages/Verification';
import VerificationDetails from './pages/Verification/VerificationDetails';
import Reviews from './pages/Reviews';
import ReviewDetails from './pages/Reviews/ReviewDetails';
import Settings from './pages/Settings/index';
import Layout from './components/Layout/Layout';
import Ads from './pages/Ads';
import DBHealth from './pages/DBHealth';


function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="users/:userId" element={<UserDetails />} />
          <Route path="verification" element={<Verification />} />
          <Route path="verification/:requestId" element={<VerificationDetails />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/reviews/:id" element={<ReviewDetails />} />
          <Route path="/ads" element={<Ads />} />

          <Route path="settings" element={<Settings />} />
          <Route path="/db/health" element={<DBHealth />} />

        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;