from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_eligibility():
    response = client.post("/eligibility", json={
        "firstName": "John",
        "lastName": "Doe",
        "annualIncome": 1200000,
        "employmentStatus": "Permanent",
        "loanAmount": 500000,
        "loanTerm": 24,
        "loanPurpose": "Personal",
        "dependents": 0,
        "existingLoanCommitments": 10000,
        "incomeVerified": True
    })
    assert response.status_code == 200
    data = response.json()
    print("Eligibility Test Pass:", data['verdict'])
    print("Eligibility Score:", data['eligibilityScore'])

def test_predict():
    response = client.post("/predict", json={
        "id": "app_123",
        "grossMonthlyIncome": 100000,
        "netMonthlyIncome": 85000,
        "existingLoanCommitments": 10000,
        "loanAmount": 500000,
        "tenure": 24,
        "employmentType": "Permanent",
        "servicePeriod": "2 years",
        "dependents": 0,
        "dob": "1990-01-01",
        "residentialStatus": "Rented"
    })
    assert response.status_code == 200
    data = response.json()
    print("Predict Test Pass:", data['riskCategory'])
    print("Risk Score:", data['overallRiskScore'])

if __name__ == "__main__":
    test_eligibility()
    test_predict()
    print("All tests completed successfully!")
