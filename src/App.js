import React, { useState, useEffect, useContext } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';

// Import components
import Login from './components/Auth/Login';
import AppLayout from './components/Layout/AppLayout';

// Import pages
import Dashboard from './pages/Dashboard';
import MaintenancePage from './pages/MaintenancePage';
import MaintenanceComponentPage from './pages/MaintenanceComponentPage';
import InventoryPage from './pages/InventoryPage';
import PurchasePage from './pages/PurchasePage';
import NotFound from './pages/NotFound';

// Auth context
import { UserContext } from './components/Auth/UserContext';
import MaintenanceWorklistPage from './pages/MaintenanceWorklistPage';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (from session storage)
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    sessionStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
  };

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const { user, login } = useContext(UserContext);

    useEffect(() => {
      // Check if user exists in context
      if (user) {
        setIsAuthenticated(true);
        setCheckingAuth(false);
        return;
      }

      // If not in context, try to get from sessionStorage
      const storedUser = sessionStorage.getItem('user');
      console.log('Stored user from sessionStorage:', storedUser);

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Update the context with the user from sessionStorage
          login(parsedUser);
          setIsAuthenticated(true);
          console.log('Authenticated', parsedUser);
        } catch (error) {
          console.error('Error parsing user from sessionStorage:', error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }

      setCheckingAuth(false);
    }, [user, setUser]);

    if (checkingAuth) return <div>Loading...</div>;
    if (!isAuthenticated) return <Navigate to="/login" />;

    return children;
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1e88e5',
        },
      }}
    >
      <UserContext.Provider value={{ user, login, logout }}>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/maintenance" element={
              <ProtectedRoute>
                <AppLayout>
                  <MaintenancePage />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/maintenance/component" element={
              <ProtectedRoute>
                <AppLayout>
                  <MaintenanceComponentPage />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/maintenance/worklists" element={
              <ProtectedRoute>
                <AppLayout>
                  <MaintenanceWorklistPage />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/inventory" element={
              <ProtectedRoute>
                <AppLayout>
                  <InventoryPage />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/purchase" element={
              <ProtectedRoute>
                <AppLayout>
                  <PurchasePage />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="*" element={
              <ProtectedRoute>
                <AppLayout>
                  <NotFound />
                </AppLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </UserContext.Provider>
    </ConfigProvider>
  );
};

export default App;