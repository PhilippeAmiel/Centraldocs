import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Login from "./components/Login";
import Register from "./components/Register";
import ResetPassword from "./components/ResetPassword";
import ClientMesDemandes from "./pages/ClientMesDemandes";
import Dashboard from "./components/Dashboard";
import DashboardNavbar from "./components/DashboardNavbar";
import Requests from "./components/Requests";
import RequestDetails from "./components/RequestDetails";
import SecureSharing from "./components/SecureSharing";
import DocumentLists from "./components/DocumentLists";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import WhyChoose from "./components/WhyChoose";
import Pricing from "./components/Pricing";
import Testimonials from "./components/Testimonials";
import Footer from "./components/Footer";
import ClientLogin from "./components/ClientLogin";
import ClientDashboard from "./components/ClientDashboard";
import ClientRequestDetails from "./components/ClientRequestDetails";
import FirestoreCollections from "./components/FirestoreCollections";
import Clients from "./components/Clients";
import ClientDetails from "./components/ClientDetails";
import PermissionsFixer from "./components/PermissionsFixer";

function App() {
  const { user, loading } = useAuth();

  console.log('App render - User:', user?.email || 'No user', 'Loading:', loading);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'application...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Routes publiques */}
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-white">
              <Navbar />
              <Hero />
              <HowItWorks />
              <WhyChoose />
              <Testimonials />
              <Pricing />
              <Footer />
            </div>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/client-login" element={<ClientLogin />} />

        {/* Route pour corriger les permissions */}
        <Route
          path="/fix-permissions"
          element={
            user ? <PermissionsFixer /> : <Navigate to="/login" />
          }
        />

        {/* Routes protégées pour les clients */}
        <Route
          path="/client"
          element={
            user ? <ClientDashboard /> : <Navigate to="/client-login" />
          }
        />
        <Route
          path="/client/mes-demandes"
          element={
            user ? <ClientMesDemandes /> : <Navigate to="/client-login" />
          }
        />
        <Route
          path="/client/request/:id"
          element={
            user ? <ClientRequestDetails /> : <Navigate to="/client-login" />
          }
        />

        {/* Routes protégées pour les professionnels */}
        <Route
          path="/dashboard"
          element={
            user ? (
              <div className="min-h-screen bg-gray-50">
                <DashboardNavbar onTabChange={() => {}} />
                <Dashboard />
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/clients"
          element={
            user ? (
              <div className="min-h-screen bg-gray-50">
                <DashboardNavbar onTabChange={() => {}} />
                <Clients />
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/client/:id"
          element={
            user ? (
              <div className="min-h-screen bg-gray-50">
                <DashboardNavbar onTabChange={() => {}} />
                <ClientDetails />
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/lists"
          element={
            user ? (
              <div className="min-h-screen bg-gray-50">
                <DashboardNavbar onTabChange={() => {}} />
                <DocumentLists />
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/requests"
          element={
            user ? (
              <div className="min-h-screen bg-gray-50">
                <DashboardNavbar onTabChange={() => {}} />
                <Requests onRequestSelect={() => {}} />
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/request/:id"
          element={
            user ? (
              <div className="min-h-screen bg-gray-50">
                <DashboardNavbar onTabChange={() => {}} />
                <RequestDetails requestId="" />
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/sharing"
          element={
            user ? (
              <div className="min-h-screen bg-gray-50">
                <DashboardNavbar onTabChange={() => {}} />
                <SecureSharing />
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Route pour les collections Firestore (dev only) */}
        <Route path="/collections" element={<FirestoreCollections />} />
      </Routes>
    </Router>
  );
}

export default App;