import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  headers: {
    "Content-Type": "application/json",
  },
});

export const fetchPatients = async () => (await api.get("/patients")).data;
export const fetchAiStatus = async () => (await api.get("/ai/status")).data;
export const fetchDashboardBundle = async (patientId) => (await api.get(`/dashboard/bootstrap/${patientId}`)).data;
export const fetchAdminOverview = async () => (await api.get("/admin/overview")).data;

export const fetchPatientCollection = async (patientId, collection) =>
  (await api.get(`/patients/${patientId}/${collection}`)).data;

export const generateAiTask = async (path, payload) => (await api.post(path, payload)).data;

export const generateDailySummary = async (patientId, payload = {}) =>
  generateAiTask("/ai/daily-summary", { patientId, ...payload });

export const generateCaregiverRecommendations = async (patientId, payload = {}) =>
  generateAiTask("/ai/recommendations", { patientId, ...payload });

export const generateClinicalObservations = async (patientId, payload = {}) =>
  generateAiTask("/ai/clinical-observations", { patientId, ...payload });

export const generateConfusionSupport = async (patientId, phrase, payload = {}) =>
  generateAiTask("/ai/confusion-support", { patientId, ...payload, context: { ...(payload.context || {}), question: phrase } });

export const generateMemoryRecall = async (patientId, query, payload = {}) =>
  generateAiTask("/ai/memory-recall", { patientId, ...payload, context: { ...(payload.context || {}), question: query } });

export const generateWeeklyReport = async (patientId, payload = {}) =>
  generateAiTask("/ai/report", { patientId, ...payload, period: "weekly" });

export const generateMonthlyReport = async (patientId, payload = {}) =>
  generateAiTask("/ai/report", { patientId, ...payload, period: "monthly" });

export const generateBrainStateSummary = async (patientId, payload = {}) =>
  generateAiTask("/ai/brain-state-summary", { patientId, ...payload });

export const generateBrainCoreInterpretation = async (patientId, payload = {}) =>
  generateAiTask("/ai/brain-core-interpretation", { patientId, ...payload });

export const updateMedication = async (medicationId, payload) =>
  (await api.patch(`/medications/${medicationId}`, payload)).data;

export const updateConsent = async (consentId, payload) =>
  (await api.patch(`/consents/${consentId}`, payload)).data;

export const createDoctorNote = async (patientId, payload) =>
  (await api.post(`/patients/${patientId}/doctor-notes`, payload)).data;
