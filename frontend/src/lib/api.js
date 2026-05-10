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

export const updateMedication = async (medicationId, payload) =>
  (await api.patch(`/medications/${medicationId}`, payload)).data;

export const updateConsent = async (consentId, payload) =>
  (await api.patch(`/consents/${consentId}`, payload)).data;

export const createDoctorNote = async (patientId, payload) =>
  (await api.post(`/patients/${patientId}/doctor-notes`, payload)).data;
