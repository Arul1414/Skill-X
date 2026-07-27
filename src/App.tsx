/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { useAuth } from './components/FirebaseProvider';
import { Loader2 } from 'lucide-react';

// Lazy load pages for performance
const Landing = lazy(() => import('./pages/Landing'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Auth = lazy(() => import('./pages/Auth'));
const SkillExchange = lazy(() => import('./pages/SkillExchange'));
const Interview = lazy(() => import('./pages/Interview'));
const ResumeAnalyzer = lazy(() => import('./pages/ResumeAnalyzer'));
const Chat = lazy(() => import('./pages/Chat'));
const Profile = lazy(() => import('./pages/Profile'));
const Materials = lazy(() => import('./pages/Materials'));
const Reviews = lazy(() => import('./pages/Reviews'));
const Premium = lazy(() => import('./pages/Premium'));
const Achievements = lazy(() => import('./pages/Achievements'));

function LoadingScreen({ message = "Initializing SkillX..." }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">{message}</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthReady } = useAuth();

  if (!isAuthReady || loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const { isAuthReady, loading } = useAuth();

  if (!isAuthReady || loading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen message="Loading page..." />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
          
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/exchange" element={<SkillExchange />} />
            <Route path="/interview" element={<Interview />} />
            <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
            <Route path="/materials" element={<Materials />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/premium" element={<Premium />} />
            <Route path="/achievements" element={<Achievements />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}



