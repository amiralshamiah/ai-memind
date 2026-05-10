import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "next-themes";

import "./App.css";
import { Toaster } from "./components/ui/sonner";
import { fetchAiStatus, fetchPatients } from "./lib/api";
import { I18nProvider } from "./lib/i18n";
import RoleSwitcherPage from "./pages/RoleSwitcherPage";
import PatientAppPage from "./pages/PatientAppPage";
import CaregiverDashboardPage from "./pages/CaregiverDashboardPage";
import DoctorDashboardPage from "./pages/DoctorDashboardPage";
import AdminPanelPage from "./pages/AdminPanelPage";

function AppInner() {
  const [patients, setPatients] = useState([]);
  const [aiStatus, setAiStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState(() => localStorage.getItem("memind:selectedPatientId") || "patient-ahmad-001");

  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.body.classList.add("dark");
  }, []);

  useEffect(() => {
    localStorage.setItem("memind:selectedPatientId", selectedPatientId);
  }, [selectedPatientId]);

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      try {
        const [patientsData, aiData] = await Promise.all([fetchPatients(), fetchAiStatus()]);
        setPatients(patientsData);
        setAiStatus(aiData);
        if (!selectedPatientId && patientsData?.[0]?.id) {
          setSelectedPatientId(patientsData[0].id);
        }
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const sharedProps = useMemo(
    () => ({
      patients,
      aiStatus,
      loading,
      selectedPatientId,
      setSelectedPatientId,
      refreshAiStatus: async () => setAiStatus(await fetchAiStatus()),
    }),
    [patients, aiStatus, loading, selectedPatientId]
  );

  return (
    <div className="memind-app">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RoleSwitcherPage {...sharedProps} />} />
          <Route path="/patient/*" element={<PatientAppPage {...sharedProps} />} />
          <Route path="/caregiver/*" element={<CaregiverDashboardPage {...sharedProps} />} />
          <Route path="/doctor/*" element={<DoctorDashboardPage {...sharedProps} />} />
          <Route path="/admin/*" element={<AdminPanelPage {...sharedProps} />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" forcedTheme="dark" enableSystem={false}>
      <I18nProvider>
        <AppInner />
      </I18nProvider>
    </ThemeProvider>
  );
}

export default App;
