#!/usr/bin/env python3
"""
Memind Backend API Test Suite
Tests all core endpoints for Patient, Caregiver, Doctor, and Admin roles
"""

import sys
import requests
from datetime import datetime

BASE_URL = "https://ai-memory-assistant.preview.emergentagent.com/api"
PATIENT_ID = "patient-ahmad-001"
MEDICATION_ID = "med-donepezil-001"
CONSENT_ID = "consent-audio-001"


class MemindAPITester:
    def __init__(self):
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status=200, data=None, check_keys=None):
        """Run a single API test"""
        url = f"{BASE_URL}{endpoint}"
        headers = {"Content-Type": "application/json"}
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == "GET":
                response = requests.get(url, headers=headers, timeout=10)
            elif method == "POST":
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == "PATCH":
                response = requests.patch(url, json=data, headers=headers, timeout=10)
            else:
                print(f"❌ Failed - Unsupported method: {method}")
                self.failed_tests.append({"test": name, "reason": f"Unsupported method: {method}"})
                return False, {}

            success = response.status_code == expected_status
            
            if success:
                try:
                    response_data = response.json()
                    
                    # Check for required keys if specified
                    if check_keys:
                        missing_keys = [key for key in check_keys if key not in response_data]
                        if missing_keys:
                            print(f"⚠️  Warning - Missing keys: {missing_keys}")
                    
                    self.tests_passed += 1
                    print(f"✅ Passed - Status: {response.status_code}")
                    return True, response_data
                except Exception as e:
                    print(f"✅ Passed - Status: {response.status_code} (non-JSON response)")
                    self.tests_passed += 1
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error detail: {error_detail}")
                except:
                    print(f"   Response text: {response.text[:200]}")
                self.failed_tests.append({"test": name, "status": response.status_code, "expected": expected_status})
                return False, {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout")
            self.failed_tests.append({"test": name, "reason": "Timeout"})
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({"test": name, "reason": str(e)})
            return False, {}

    def test_core_endpoints(self):
        """Test core API endpoints"""
        print("\n" + "="*60)
        print("TESTING CORE ENDPOINTS")
        print("="*60)
        
        # Root endpoint
        self.run_test("Root API", "GET", "/")
        
        # Patients list
        success, patients = self.run_test("Get Patients List", "GET", "/patients", check_keys=None)
        if success and patients:
            print(f"   Found {len(patients)} patients")
        
        # AI Status
        success, ai_status = self.run_test("Get AI Status", "GET", "/ai/status", check_keys=["configuredProvider", "configuredModel", "fallbackMode"])
        if success and ai_status:
            print(f"   Provider: {ai_status.get('configuredProvider')}/{ai_status.get('configuredModel')}")
            print(f"   Fallback mode: {ai_status.get('fallbackMode')}")

    def test_patient_endpoints(self):
        """Test patient-specific endpoints"""
        print("\n" + "="*60)
        print("TESTING PATIENT ENDPOINTS")
        print("="*60)
        
        # Get patient details
        self.run_test("Get Patient Details", "GET", f"/patients/{PATIENT_ID}", check_keys=["id", "name", "diagnosis"])
        
        # Get patient events
        success, events = self.run_test("Get Patient Events", "GET", f"/patients/{PATIENT_ID}/events")
        if success and events:
            print(f"   Found {len(events)} events")
        
        # Get patient memories
        success, memories = self.run_test("Get Patient Memories", "GET", f"/patients/{PATIENT_ID}/memories")
        if success and memories:
            print(f"   Found {len(memories)} memories")
        
        # Get patient people
        success, people = self.run_test("Get Patient People", "GET", f"/patients/{PATIENT_ID}/people")
        if success and people:
            print(f"   Found {len(people)} people")
        
        # Get patient episodes
        success, episodes = self.run_test("Get Patient Episodes", "GET", f"/patients/{PATIENT_ID}/episodes")
        if success and episodes:
            print(f"   Found {len(episodes)} episodes")
        
        # Get patient medications
        success, medications = self.run_test("Get Patient Medications", "GET", f"/patients/{PATIENT_ID}/medications")
        if success and medications:
            print(f"   Found {len(medications)} medications")
        
        # Get patient reports
        success, reports = self.run_test("Get Patient Reports", "GET", f"/patients/{PATIENT_ID}/reports")
        if success and reports:
            print(f"   Found {len(reports)} reports")
        
        # Get patient AI observations
        success, observations = self.run_test("Get Patient AI Observations", "GET", f"/patients/{PATIENT_ID}/ai-observations")
        if success and observations:
            print(f"   Found {len(observations)} AI observations")
        
        # Get patient risk scores
        success, risk_scores = self.run_test("Get Patient Risk Scores", "GET", f"/patients/{PATIENT_ID}/risk-scores")
        if success and risk_scores:
            print(f"   Found {len(risk_scores)} risk score entries")
        
        # Get patient consents
        success, consents = self.run_test("Get Patient Consents", "GET", f"/patients/{PATIENT_ID}/consents")
        if success and consents:
            print(f"   Found {len(consents)} consents")
        
        # Get patient doctor notes
        success, notes = self.run_test("Get Patient Doctor Notes", "GET", f"/patients/{PATIENT_ID}/doctor-notes")
        if success and notes:
            print(f"   Found {len(notes)} doctor notes")

    def test_dashboard_endpoints(self):
        """Test dashboard bootstrap endpoint"""
        print("\n" + "="*60)
        print("TESTING DASHBOARD ENDPOINTS")
        print("="*60)
        
        success, bundle = self.run_test(
            "Get Dashboard Bootstrap", 
            "GET", 
            f"/dashboard/bootstrap/{PATIENT_ID}",
            check_keys=["patient", "events", "memories", "medications", "reports", "aiStatus"]
        )
        if success and bundle:
            print(f"   Patient: {bundle.get('patient', {}).get('name')}")
            print(f"   Events: {len(bundle.get('events', []))}")
            print(f"   Memories: {len(bundle.get('memories', []))}")
            print(f"   Reports: {len(bundle.get('reports', []))}")

    def test_admin_endpoints(self):
        """Test admin endpoints"""
        print("\n" + "="*60)
        print("TESTING ADMIN ENDPOINTS")
        print("="*60)
        
        success, overview = self.run_test(
            "Get Admin Overview", 
            "GET", 
            "/admin/overview",
            check_keys=["summary", "auditLogs", "systemHealth", "aiStatus"]
        )
        if success and overview:
            summary = overview.get("summary", {})
            print(f"   Total patients: {summary.get('totalPatients')}")
            print(f"   Active doctors: {summary.get('activeDoctors')}")
            print(f"   Active caregivers: {summary.get('activeCaregivers')}")
            print(f"   Audit logs: {len(overview.get('auditLogs', []))}")

    def test_ai_endpoints(self):
        """Test AI generation endpoints"""
        print("\n" + "="*60)
        print("TESTING AI ENDPOINTS")
        print("="*60)
        
        # Test daily summary
        success, result = self.run_test(
            "Generate Daily Summary",
            "POST",
            "/ai/daily-summary",
            data={
                "patientId": PATIENT_ID,
                "locale": "en",
                "useCache": True,
                "context": {"actorRole": "caregiver", "timeOfDay": "evening"}
            },
            check_keys=["task", "patientId", "output"]
        )
        if success and result:
            print(f"   Cached: {result.get('cached')}")
            print(f"   Provider: {result.get('provider')}")
        
        # Test recommendations
        success, result = self.run_test(
            "Generate Recommendations",
            "POST",
            "/ai/recommendations",
            data={
                "patientId": PATIENT_ID,
                "locale": "en",
                "useCache": True,
                "context": {"actorRole": "caregiver"}
            },
            check_keys=["task", "patientId", "output"]
        )
        if success and result:
            print(f"   Cached: {result.get('cached')}")
            recommendations = result.get('output', {}).get('recommendations', [])
            print(f"   Recommendations count: {len(recommendations)}")
        
        # Test clinical observations
        success, result = self.run_test(
            "Generate Clinical Observations",
            "POST",
            "/ai/clinical-observations",
            data={
                "patientId": PATIENT_ID,
                "locale": "en",
                "useCache": True,
                "context": {"actorRole": "doctor"}
            },
            check_keys=["task", "patientId", "output"]
        )
        if success and result:
            print(f"   Cached: {result.get('cached')}")
            observations = result.get('output', {}).get('observations', [])
            print(f"   Observations count: {len(observations)}")
        
        # Test report generation
        success, result = self.run_test(
            "Generate Weekly Report",
            "POST",
            "/ai/report",
            data={
                "patientId": PATIENT_ID,
                "locale": "en",
                "period": "weekly",
                "useCache": True,
                "context": {"actorRole": "doctor"}
            },
            check_keys=["task", "patientId", "output"]
        )
        if success and result:
            print(f"   Cached: {result.get('cached')}")
            print(f"   Report title: {result.get('output', {}).get('title')}")
        
        # Test memory recall
        success, result = self.run_test(
            "Memory Recall Support",
            "POST",
            "/ai/memory-recall",
            data={
                "patientId": PATIENT_ID,
                "locale": "en",
                "useCache": True,
                "context": {"actorRole": "patient", "question": "Where am I?"}
            },
            check_keys=["task", "patientId", "output"]
        )
        if success and result:
            print(f"   Cached: {result.get('cached')}")
            print(f"   Response preview: {result.get('output', {}).get('response', '')[:60]}...")
        
        # Test confusion support
        success, result = self.run_test(
            "Confusion Support",
            "POST",
            "/ai/confusion-support",
            data={
                "patientId": PATIENT_ID,
                "locale": "en",
                "useCache": True,
                "context": {"actorRole": "patient", "question": "I want to go home"}
            },
            check_keys=["task", "patientId", "output"]
        )
        if success and result:
            print(f"   Cached: {result.get('cached')}")
            print(f"   Response preview: {result.get('output', {}).get('response', '')[:60]}...")

    def test_update_endpoints(self):
        """Test update endpoints"""
        print("\n" + "="*60)
        print("TESTING UPDATE ENDPOINTS")
        print("="*60)
        
        # Update medication
        success, result = self.run_test(
            "Update Medication Status",
            "PATCH",
            f"/medications/{MEDICATION_ID}",
            data={
                "adherenceStatus": "Taken",
                "actorRole": "caregiver",
                "note": "Test update"
            }
        )
        if success and result:
            print(f"   Updated medication: {result.get('name')}")
        
        # Update consent
        success, result = self.run_test(
            "Update Consent Status",
            "PATCH",
            f"/consents/{CONSENT_ID}",
            data={
                "status": "granted",
                "actorRole": "admin"
            }
        )
        if success and result:
            print(f"   Updated consent: {result.get('id')}")
        
        # Create doctor note
        success, result = self.run_test(
            "Create Doctor Note",
            "POST",
            f"/patients/{PATIENT_ID}/doctor-notes",
            data={
                "doctorId": "doctor-lena-001",
                "note": "Test note from automated testing",
                "carePlan": "Continue current care plan",
                "followUpRecommendation": "Review in 2 weeks",
                "createdAt": datetime.now().isoformat()
            }
        )
        if success and result:
            print(f"   Created doctor note: {result.get('id')}")

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        print(f"Total tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Tests failed: {len(self.failed_tests)}")
        print(f"Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failed_tests:
            print("\n❌ FAILED TESTS:")
            for failure in self.failed_tests:
                reason = failure.get('reason')
                if not reason:
                    status = failure.get('status')
                    expected = failure.get('expected')
                    reason = f'Status {status} (expected {expected})'
                print(f"   - {failure.get('test')}: {reason}")
        
        return 0 if len(self.failed_tests) == 0 else 1


def main():
    print("="*60)
    print("MEMIND BACKEND API TEST SUITE")
    print("="*60)
    print(f"Base URL: {BASE_URL}")
    print(f"Test Patient ID: {PATIENT_ID}")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    tester = MemindAPITester()
    
    # Run all test suites
    tester.test_core_endpoints()
    tester.test_patient_endpoints()
    tester.test_dashboard_endpoints()
    tester.test_admin_endpoints()
    tester.test_ai_endpoints()
    tester.test_update_endpoints()
    
    # Print summary and exit
    return tester.print_summary()


if __name__ == "__main__":
    sys.exit(main())
