import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { CMSProvider, useCMS } from './context/CMSContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ToastContainer } from './components/common/Toast';
import { LoginView } from './components/auth/LoginView';

// Page Views
import {
  DashboardPage,
  UsersPage,
  TagsPage,
  ContentPage,
  MediaPage,
  ContentMetaPage,
  ContentTagPage,
  UserProgressPage,
  SchemaPage,
  DesignSystemPage,
} from './pages';

const CMSAppContent: React.FC = () => {
  const { sidebarCollapsed, isAuthenticated } = useCMS();
  const navigate = useNavigate();

  // If unauthenticated, show WordPress login screen
  if (!isAuthenticated) {
    return (
      <>
        <LoginView />
        <ToastContainer />
      </>
    );
  }

  // Global Quick Action Trigger States
  const [quickUserOpen, setQuickUserOpen] = useState(false);
  const [quickTagOpen, setQuickTagOpen] = useState(false);
  const [quickContentOpen, setQuickContentOpen] = useState(false);

  const handleOpenCreateUser = () => {
    navigate('/users');
    setQuickUserOpen(true);
  };

  const handleOpenCreateTag = () => {
    navigate('/tags');
    setQuickTagOpen(true);
  };

  const handleOpenCreateContent = () => {
    navigate('/content');
    setQuickContentOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors flex">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Container */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        {/* Top Header */}
        <Header
          onOpenCreateUser={handleOpenCreateUser}
          onOpenCreateTag={handleOpenCreateTag}
          onOpenCreateContent={handleOpenCreateContent}
        />

        {/* Dynamic Route View */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Routes>
            <Route
              path="/"
              element={
                <DashboardPage
                  onOpenCreateContent={handleOpenCreateContent}
                  onOpenCreateUser={handleOpenCreateUser}
                  onOpenCreateTag={handleOpenCreateTag}
                />
              }
            />
            <Route
              path="/users"
              element={
                <UsersPage
                  isOpenCreateModal={quickUserOpen}
                  onCloseCreateModal={() => setQuickUserOpen(false)}
                />
              }
            />
            <Route
              path="/tags"
              element={
                <TagsPage
                  isOpenCreateModal={quickTagOpen}
                  onCloseCreateModal={() => setQuickTagOpen(false)}
                />
              }
            />
            <Route
              path="/content"
              element={
                <ContentPage
                  isOpenCreateModal={quickContentOpen}
                  onCloseCreateModal={() => setQuickContentOpen(false)}
                />
              }
            />
            <Route path="/media" element={<MediaPage />} />
            <Route path="/content-meta" element={<ContentMetaPage />} />
            <Route path="/content-tag" element={<ContentTagPage />} />
            <Route path="/user-progress" element={<UserProgressPage />} />
            <Route path="/schema" element={<SchemaPage />} />
            <Route path="/design-system" element={<DesignSystemPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Floating Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <CMSProvider>
        <CMSAppContent />
      </CMSProvider>
    </BrowserRouter>
  );
}
