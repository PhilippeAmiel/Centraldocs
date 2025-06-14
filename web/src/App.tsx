import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../../src/contexts/AuthContext";
import Login from "../../src/components/Login";
import Register from "../../src/components/Register";
import ResetPassword from "../../src/components/ResetPassword";
import ClientMesDemandes from "../../src/pages/ClientMesDemandes";
import Dashboard from "../../src/components/Dashboard";
import DashboardNavbar from "../../src/components/DashboardNavbar";
import Requests from "../../src/components/Requests";
import RequestDetails from "../../src/components/RequestDetails";
import SecureSharing from "../../src/components/SecureSharing";
import DocumentLists from "../../src/components/DocumentLists";
import Navbar from "../../src/components/Navbar";
import Hero from "../../src/components/Hero";
import HowItWorks from "../../src/components/HowItWorks";
import WhyChoose from "../../src/components/WhyChoose";
import Pricing from "../../src/components/Pricing";
import Testimonials from "../../src/components/Testimonials";
import Footer from "../../src/components/Footer";
import ClientLogin from "../../src/components/ClientLogin";
import ClientDashboard from "../../src/components/ClientDashboard";
import ClientRequestDetails from "../../src/components/ClientRequestDetails";
import FirestoreCollections from "../../src/components/FirestoreCollections";
import Clients from "../../src/components/Clients";
import ClientDetails from "../../src/components/ClientDetails";

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