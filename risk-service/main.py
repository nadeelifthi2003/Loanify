from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from fastapi.middleware.cors import CORSMiddleware
import math
import os
import joblib
import pandas as pd
from datetime import date, datetime

app = FastAPI(title="Loanify Risk & Eligibility API")

# Load ML model safely
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.joblib")
risk_model = joblib.load(MODEL_PATH) if os.path.exists(MODEL_PATH) else None

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# Shared models
# ─────────────────────────────────────────────

class ApplicationData(BaseModel):
    id: str
    grossMonthlyIncome: float
    netMonthlyIncome: float
    existingLoanCommitments: float = 0.0
    loanAmount: float
    tenure: int
    employmentType: str
    servicePeriod: str
    dependents: int = 0
    dob: Optional[str] = None
    residentialStatus: Optional[str] = None

class EligibilityInput(BaseModel):
    """Accepts the raw customer form fields for immediate eligibility prediction."""
    firstName: str
    lastName: str
    annualIncome: float          # from form (converted to monthly internally)
    employmentStatus: str        # Permanent / Contract / Self-Employed / Business
    loanAmount: float
    loanTerm: int                # months
    loanPurpose: str
    dependents: int = 0
    existingLoanCommitments: float = 0.0
    incomeVerified: bool = False # True when proof-of-income document was uploaded
    dob: Optional[str] = None

class RiskFactor(BaseModel):
    label: str
    score: str
    color: str
    desc: str

class EligibilityRecommendation(BaseModel):
    eligible: bool
    verdict: str                 # "Likely Eligible" | "Conditionally Eligible" | "Not Eligible"
    verdictColor: str            # tailwind colour class
    eligibilityScore: int        # 0–100 composite score
    approvalProbability: int
    estimatedEMI: int
    dti: float
    dtiCategory: str
    lti: float
    maxRecommendedLoan: int
    documentBonus: int           # +points given because proof-of-income was uploaded
    strengths: List[RiskFactor]
    improvements: List[RiskFactor]
    insights: List[str]
    alerts: List[Dict[str, str]]

class RiskAssessmentResponse(BaseModel):
    overallRiskScore: int
    riskCategory: str
    approvalProbability: int
    approvalCategory: str
    dti: float
    dtiCategory: str
    factors: List[RiskFactor]
    insights: List[str]
    alerts: List[Dict[str, str]]


# ─────────────────────────────────────────────
# Shared calculation helpers
# ─────────────────────────────────────────────

def calculate_emi(principal: float, annual_rate: float, months: int) -> float:
    if months <= 0:
        return principal
    mr = annual_rate / 12
    if mr == 0:
        return principal / months
    return (principal * mr * math.pow(1 + mr, months)) / (math.pow(1 + mr, months) - 1)


def classify_dti(dti_pct: float):
    if dti_pct < 30:
        return "Low"
    elif dti_pct < 45:
        return "Moderate"
    return "High"


def normalize_employment_status(status: str) -> str:
    normalized = (status or "").strip().lower()

    if (
        "permanent" in normalized
        or "full-time" in normalized
        or normalized in {"employed", "employee", "employer", "full time"}
    ):
        return "Permanent"
    if "contract" in normalized or "temporary" in normalized:
        return "Contract"
    if "self" in normalized:
        return "Self-Employed"
    if "business" in normalized:
        return "Business"

    return status.title() if status else "Unknown"


def calculate_rule_based_risk(dti_pct: float, lti: float, employment_type: str, dependents: int = 0) -> int:
    risk_score = 10
    normalized_emp = normalize_employment_status(employment_type).lower()

    if dti_pct >= 60:
        risk_score += 55
    elif dti_pct >= 50:
        risk_score += 40
    elif dti_pct >= 40:
        risk_score += 25
    elif dti_pct >= 30:
        risk_score += 15
    elif dti_pct < 15:
        risk_score -= 5

    if lti >= 5:
        risk_score += 25
    elif lti >= 4:
        risk_score += 20
    elif lti >= 2:
        risk_score += 10
    elif lti < 0.5:
        risk_score -= 5

    if "business" in normalized_emp or "self" in normalized_emp:
        risk_score += 15
    elif "contract" in normalized_emp:
        risk_score += 10
    elif "permanent" in normalized_emp:
        risk_score -= 5

    risk_score += min(max(dependents, 0), 5)

    return max(0, min(int(risk_score), 99))


def calculate_age_from_dob(dob: Optional[str], default_age: int = 30) -> int:
    if not dob:
        return default_age

    try:
        birth_date = datetime.strptime(dob, "%Y-%m-%d").date()
        today = date.today()
        age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
        return max(18, min(age, 75))
    except ValueError:
        return default_age


# ─────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────

@app.get("/")
def read_root():
    return {"status": "Loanify Risk & Eligibility Service is running"}


@app.post("/eligibility", response_model=EligibilityRecommendation)
def predict_eligibility(data: EligibilityInput):
    """
    Core loan eligibility prediction.
    Takes the customer's application form fields and returns a detailed
    eligibility decision with score breakdown, EMI estimate, and actionable tips.

    Key financial criteria used:
      - DTI  (Debt-to-Income Ratio)   → must stay below 50 % to be eligible
      - LTI  (Loan-to-Income Ratio)   → loan should be ≤ 5× annual income
      - Employment stability          → permanent > contract > self-employed / business
      - Income verification bonus     → +10 eligibility points when proof-of-income doc uploaded
    """
    try:
        # ── 1. Derived financials ──────────────────────────────────────────
        gross_monthly = data.annualIncome / 12
        # Use 15 % p.a. as representative rate (Sri Lankan banks, personal loans)
        estimated_annual_rate = 0.15
        emi = calculate_emi(data.loanAmount, estimated_annual_rate, data.loanTerm)
        total_obligations = data.existingLoanCommitments + emi

        dti = (total_obligations / gross_monthly * 100) if gross_monthly > 0 else 999
        dti = round(dti, 1)
        dti_category = classify_dti(dti)

        lti = data.loanAmount / data.annualIncome if data.annualIncome > 0 else float("inf")

        # Maximum recommended loan = 3× annual income, capped at what DTI permits
        max_affordable_monthly = gross_monthly * 0.40 - data.existingLoanCommitments
        if max_affordable_monthly > 0:
            # Reverse EMI formula to find max principal
            mr = estimated_annual_rate / 12
            n = data.loanTerm
            max_loan = max_affordable_monthly * (math.pow(1 + mr, n) - 1) / (mr * math.pow(1 + mr, n))
        else:
            max_loan = 0
        max_recommended_loan = int(min(max_loan, data.annualIncome * 3))
        normalized_emp = normalize_employment_status(data.employmentStatus)
        emp = normalized_emp.lower()
        applicant_age = calculate_age_from_dob(data.dob)


        # ── 2. Eligibility scoring (0–100) ────────────────────────────────
        if risk_model:
            input_df = pd.DataFrame([{
                'age': applicant_age,
                'annual_income': data.annualIncome,
                'net_monthly_income': gross_monthly * 0.85, # Estimate net
                'existing_loan_commitments': data.existingLoanCommitments,
                'loan_amount': data.loanAmount,
                'loan_term': data.loanTerm,
                'employment_status': normalized_emp,
                'dependents': data.dependents
            }])
            ml_risk_score = risk_model.predict(input_df)[0]
            # Convert risk (high=bad) to eligibility score (high=good)
            score = int(100 - ml_risk_score)


            document_bonus = 10 if data.incomeVerified else 0
            score += document_bonus
        else:
            score = 60  # base score – applicant starts with a fair standing

            # A. DTI contribution (±30 points)
            if dti < 25:
                score += 30
            elif dti < 35:
                score += 20
            elif dti < 45:
                score += 10
            elif dti < 55:
                score -= 10
            else:
                score -= 30   # hard penalise > 55 %

            # B. LTI contribution (±15 points)
            if lti < 1:
                score += 15
            elif lti < 2:
                score += 10
            elif lti < 3.5:
                score += 5
            elif lti < 5:
                score -= 5
            else:
                score -= 15

            # C. Employment stability (±10 points)
            if "permanent" in emp:
                score += 10
            elif "contract" in emp:
                score += 3
            elif "business" in emp or "self" in emp:
                score -= 5

            # D. Dependents (up to ‑5)
            score -= min(data.dependents, 5)

            # E. Document bonus – income verification via uploaded document
            document_bonus = 10 if data.incomeVerified else 0
            score += document_bonus

        score = max(0, min(score, 100))

        # ── 3. Verdict ────────────────────────────────────────────────────
        hard_rejection = dti >= 60 or lti > 6

        if hard_rejection or score < 35:
            eligible = False
            verdict = "Not Eligible"
            verdict_color = "text-red-600 dark:text-red-400"
            approval_prob = max(5, score // 2)
        elif score < 55:
            eligible = True
            verdict = "Conditionally Eligible"
            verdict_color = "text-yellow-600 dark:text-yellow-400"
            approval_prob = 40 + score // 3
        else:
            eligible = True
            verdict = "Likely Eligible"
            verdict_color = "text-green-600 dark:text-green-400"
            approval_prob = 60 + (score - 55) // 2

        approval_prob = min(approval_prob, 98)

        # ── 4. Strengths & improvement factors ────────────────────────────
        strengths: List[RiskFactor] = []
        improvements: List[RiskFactor] = []

        # DTI
        if dti < 35:
            strengths.append(RiskFactor(
                label="Debt-to-Income Ratio",
                score="Excellent",
                color="text-green-600",
                desc=f"Your total debt burden is only {dti}% of income — well within safe limits."
            ))
        elif dti < 50:
            improvements.append(RiskFactor(
                label="Debt-to-Income Ratio",
                score="Moderate",
                color="text-yellow-600",
                desc=f"Your DTI stands at {dti}%. Paying off existing loans before applying could improve your score."
            ))
        else:
            improvements.append(RiskFactor(
                label="Debt-to-Income Ratio",
                score="High Risk",
                color="text-red-600",
                desc=f"Your DTI is {dti}% — exceeding the recommended 50% cap. Consider a smaller loan or clearing existing debts."
            ))

        # LTI
        if lti < 2:
            strengths.append(RiskFactor(
                label="Loan-to-Annual Income",
                score="Good",
                color="text-blue-600",
                desc=f"The loan amount ({lti:.1f}× your annual income) is conservative and manageable."
            ))
        elif lti < 4:
            improvements.append(RiskFactor(
                label="Loan-to-Annual Income",
                score="Moderate",
                color="text-yellow-600",
                desc=f"Your loan request is {lti:.1f}× your annual income. A smaller loan amount would improve approval chances."
            ))
        else:
            improvements.append(RiskFactor(
                label="Loan-to-Annual Income",
                score="Risky",
                color="text-red-600",
                desc=f"Requesting {lti:.1f}× annual income. We recommend borrowing no more than LKR {max_recommended_loan:,}."
            ))

        # Employment
        if "permanent" in emp:
            strengths.append(RiskFactor(
                label="Employment Stability",
                score="Excellent",
                color="text-green-600",
                desc="Permanent or full-time employment is viewed very favourably by lenders."
            ))
        elif "contract" in emp:
            improvements.append(RiskFactor(
                label="Employment Stability",
                score="Fair",
                color="text-yellow-600",
                desc="Contract employment introduces income uncertainty. A longer tenure helps."
            ))
        else:
            improvements.append(RiskFactor(
                label="Employment Stability",
                score="Variable",
                color="text-yellow-600",
                desc="Self-employed or business income may vary. Providing 12 months of bank statements strengthens your case."
            ))

        # Income verification document
        if data.incomeVerified:
            strengths.append(RiskFactor(
                label="Income Verification",
                score="Verified ✓",
                color="text-green-600",
                desc=f"Proof-of-income document uploaded — eligibility score boosted by +{document_bonus} points."
            ))
        else:
            improvements.append(RiskFactor(
                label="Income Verification",
                score="Missing",
                color="text-orange-600",
                desc="Uploading pay slips or bank statements can increase your eligibility score by up to 10 points."
            ))

        # ── 5. Insights & alerts ──────────────────────────────────────────
        insights = [
            f"Estimated monthly EMI for this loan: approximately {int(emi):,}.",
            f"Your debt obligations would use {dti}% of your gross monthly income after approval.",
        ]
        if max_recommended_loan > 0 and data.loanAmount > max_recommended_loan:
            insights.append(
                f"Based on your income, we recommend a maximum loan of {max_recommended_loan:,} for comfortable repayment."
            )
        if data.incomeVerified:
            insights.append("Income document uploaded — Our system has factored document verification into your score.")

        alerts: List[Dict[str, str]] = []
        if dti >= 60:
            alerts.append({"title": "DTI Too High", "desc": "Total debt obligations exceed 60% of gross income. Loan cannot be approved at this level."})
        if lti > 6:
            alerts.append({"title": "Loan Amount Exceeds 6× Income", "desc": f"Requested amount is very high relative to annual income. Maximum advisable: {max_recommended_loan:,}."})
        if not data.incomeVerified:
            alerts.append({"title": "No Income Document Uploaded", "desc": "Uploading proof of income is mandatory and strengthens your application significantly."})

        return EligibilityRecommendation(
            eligible=eligible,
            verdict=verdict,
            verdictColor=verdict_color,
            eligibilityScore=score,
            approvalProbability=approval_prob,
            estimatedEMI=int(emi),
            dti=dti,
            dtiCategory=dti_category,
            lti=round(lti, 2),
            maxRecommendedLoan=max_recommended_loan,
            documentBonus=document_bonus,
            strengths=strengths,
            improvements=improvements,
            insights=insights,
            alerts=alerts,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict", response_model=RiskAssessmentResponse)
def predict_risk(data: ApplicationData):
    """Officer-side deep risk assessment for an already-submitted application."""
    try:
        annual_rate = 0.15
        emi = calculate_emi(data.loanAmount, annual_rate, data.tenure)
        total_monthly_obligations = data.existingLoanCommitments + emi

        dti = (total_monthly_obligations / data.grossMonthlyIncome * 100) if data.grossMonthlyIncome > 0 else 999
        dti = round(dti, 1)
        dti_category = classify_dti(dti)

        lti = data.loanAmount / (data.grossMonthlyIncome * 12) if data.grossMonthlyIncome > 0 else float("inf")

        normalized_emp = normalize_employment_status(data.employmentType)
        emp_type = normalized_emp.lower()
        rule_risk_score = calculate_rule_based_risk(dti, lti, normalized_emp, data.dependents)
        risk_score = rule_risk_score
        applicant_age = calculate_age_from_dob(data.dob)

        if risk_model:
            input_df = pd.DataFrame([{
                'age': applicant_age,
                'annual_income': data.grossMonthlyIncome * 12,
                'net_monthly_income': data.netMonthlyIncome,
                'existing_loan_commitments': data.existingLoanCommitments,
                'loan_amount': data.loanAmount,
                'loan_term': data.tenure,
                'employment_status': normalized_emp,
                'dependents': data.dependents
            }])
            ml_risk_score = int(risk_model.predict(input_df)[0])
            # Blend the ML prediction with hard affordability rules so low-risk
            # applications are not overstated and clearly risky ones stay elevated.
            risk_score = int(round((ml_risk_score * 0.45) + (rule_risk_score * 0.55)))

            if dti >= 60 or lti > 5.5:
                risk_score = max(risk_score, 75)
            elif dti < 15 and lti < 0.5 and "permanent" in emp_type:
                risk_score = min(risk_score, 29)
        else:
            risk_score = rule_risk_score

        risk_score = min(int(risk_score), 99)

        if risk_score < 30:
            risk_category, approval_prob, app_category = "Low Risk", 85 + (30 - risk_score) // 2, "Highly Recommended"
        elif risk_score < 60:
            risk_category, approval_prob, app_category = "Medium Risk", 50 + (60 - risk_score), "Review Needed"
        else:
            risk_category, approval_prob, app_category = "High Risk", max(5, 100 - risk_score), "Not Recommended"

        approval_prob = min(max(int(approval_prob), 0), 100)

        factors = []
        if "permanent" in emp_type:
            factors.append(RiskFactor(label="Employment Stability", score="Excellent", color="text-green-600", desc="Permanent employment shows stability"))
        else:
            factors.append(RiskFactor(label="Employment Stability", score="Fair", color="text-yellow-600", desc=f"{normalized_emp} may have income variance"))

        if dti < 30:
            factors.append(RiskFactor(label="Debt-to-Income", score="Excellent", color="text-green-600", desc=f"Healthy ratio at {dti}%"))
        elif dti < 45:
            factors.append(RiskFactor(label="Debt-to-Income", score="Good", color="text-blue-600", desc=f"Moderate ratio at {dti}%"))
        else:
            factors.append(RiskFactor(label="Debt-to-Income", score="Poor", color="text-red-600", desc=f"High ratio at {dti}%"))

        if lti < 2:
            factors.append(RiskFactor(label="Loan-to-Income", score="Good", color="text-blue-600", desc="Loan amount is reasonable vs income"))
        else:
            factors.append(RiskFactor(label="Loan-to-Income", score="Fair", color="text-yellow-600", desc="Loan amount is high compared to annual income"))

        insights = [
            f"DTI ratio is {dti}%, which is considered {dti_category.lower()}.",
            f"Estimated EMI: {int(emi):,} per month.",
        ]
        if data.dependents > 2:
            insights.append("Higher number of dependents may impact disposable income.")

        alerts = []
        if dti > 50:
            alerts.append({"title": "High Debt Burden", "desc": "Total obligations exceed 50% of gross income."})
        if lti > 5:
            alerts.append({"title": "Excessive Loan Amount", "desc": "Loan is more than 5× annual gross income."})

        return RiskAssessmentResponse(
            overallRiskScore=risk_score,
            riskCategory=risk_category,
            approvalProbability=approval_prob,
            approvalCategory=app_category,
            dti=dti,
            dtiCategory=dti_category,
            factors=factors,
            insights=insights,
            alerts=alerts,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
