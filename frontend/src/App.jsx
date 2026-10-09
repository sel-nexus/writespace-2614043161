import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import Home from './pages/Home';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ReadBlog from './pages/ReadBlog';
import RegisterPage from './pages/RegisterPage';
import UserManagement from './pages/UserManagement';
import WriteBlog from './pages/WriteBlog';
import { getSession } from './utils/auth';

/**
 * Render the single-router application and select navigation by current session.
 * @returns {JSX.Element} Routed WriteSpace application.
 */
export default function App() {
  const session = getSession();
  return (
    <BrowserRouter>
      {session && <Navbar />}
      <Routes>
        <Route element={<LandingPage />} path="/" />
        <Route element={<LoginPage />} path="/login" />
        <Route element={<RegisterPage />} path="/register" />
        <Route element={<ProtectedRoute><Home /></ProtectedRoute>} path="/blogs" />
        <Route element={<ProtectedRoute><ReadBlog /></ProtectedRoute>} path="/blog/:id" />
        <Route element={<ProtectedRoute><WriteBlog /></ProtectedRoute>} path="/write" />
        <Route element={<ProtectedRoute><WriteBlog /></ProtectedRoute>} path="/edit/:id" />
        <Route element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} path="/admin" />
        <Route element={<ProtectedRoute adminOnly><UserManagement /></ProtectedRoute>} path="/users" />
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </BrowserRouter>
  );
}
