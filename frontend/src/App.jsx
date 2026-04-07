import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/EmployeeList';
import EmployeeForm from './pages/EmployeeForm';
import SalaryDetails from './pages/SalaryDetails';
import AttendancePage from './pages/AttendancePage';
import LeavePage from './pages/LeavePage';
import ReportsPage from './pages/ReportsPage';

function AppRoutes() {
  const { currentUser } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={currentUser ? <Navigate to="/" /> : <Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="leaves" element={<LeavePage />} />
        <Route path="employees" element={<EmployeeList />} />
        <Route path="employees/new" element={<PrivateRoute adminOnly={true}><EmployeeForm /></PrivateRoute>} />
        <Route path="employees/edit/:id" element={<PrivateRoute adminOnly={true}><EmployeeForm /></PrivateRoute>} />
        <Route path="employees/:id/salary" element={<SalaryDetails />} />
        <Route path="profile" element={<SalaryDetails />} />
        <Route path="reports" element={<PrivateRoute adminOnly={true}><ReportsPage /></PrivateRoute>} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
