// src/App.tsx
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/common/Layout";
import TrendPage from "./components/Trend/TrendPage";
import Home from "./components/common/Home";
import UploadData from "./components/common/UploadData";
import LoginForm from './components/LoginForm';
import "./App.css";

import { ThemeProvider } from './utils/ThemeProvider';

// helper to check expiry
function tokenExpired(token: string): boolean {
  try {
    const { exp } = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}

const App: React.FC = () => {
  // 1) State hook
  const [loggedIn, setLoggedIn] = useState<boolean>(() => {
    const t = localStorage.getItem('authToken');
    return !!t && !tokenExpired(t);
  });

  // 2) Effect hook (must be before any returns)
  useEffect(() => {
    const checkExpiry = () => {
      const t = localStorage.getItem('authToken');
      if (!t || tokenExpired(t)) {
        localStorage.removeItem('authToken');
        setLoggedIn(false);
      }
    };
    window.addEventListener('focus', checkExpiry);
    return () => window.removeEventListener('focus', checkExpiry);
  }, []);

  // 3) Conditional render based on loggedIn
  if (!loggedIn) {
    return <LoginForm onSuccess={() => setLoggedIn(true)} />;
  }

  // 4) Protected app UI
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div style={{ minHeight: '100vh' }}>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/trend" element={<TrendPage />} />
              <Route path="/upload" element={<UploadData />} />
            </Routes>
          </Layout>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
