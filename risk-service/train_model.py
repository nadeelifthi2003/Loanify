import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
import joblib

np.random.seed(42)

def generate_synthetic_data(num_samples=5000):
    # Features aligned with our API input
    # Age (calculated from dob if needed, here simulated 18-65)
    age = np.random.randint(18, 65, num_samples)
    
    # Financials
    annual_income = np.random.uniform(500000, 15000000, num_samples)
    monthly_income = annual_income / 12
    # Net income is slightly less than gross
    net_monthly_income = monthly_income * np.random.uniform(0.7, 0.95, num_samples)
    
    # Existing debt and Loan request
    existing_loan_commitments = monthly_income * np.random.uniform(0.0, 0.6, num_samples)
    loan_amount = np.random.uniform(100000, 5000000, num_samples)
    loan_term = np.random.choice([12, 24, 36, 48, 60], num_samples)
    
    # Demographics / Job
    employment_statuses = ['Permanent', 'Contract', 'Self-Employed', 'Business']
    employment_status = np.random.choice(employment_statuses, num_samples, p=[0.6, 0.2, 0.1, 0.1])
    
    dependents = np.random.randint(0, 5, num_samples)
    
    # Derived inputs just to make the dataset rich (used in internal calculation of score)
    # This reflects the user's requested dataset style
    num_bank_accounts = np.random.randint(1, 8, num_samples)
    num_credit_cards = np.random.randint(0, 5, num_samples)
    credit_utilization = np.random.uniform(0, 100, num_samples)
    
    # Calculate initial Risk Target based on rules-like formula but with noise
    mr = 0.15 / 12
    emi = (loan_amount * mr * ((1 + mr)**loan_term)) / (((1 + mr)**loan_term) - 1)
    
    dti = ((existing_loan_commitments + emi) / monthly_income) * 100
    lti = loan_amount / annual_income
    
    # We will compute a risk_score (0-100)
    # Higher risk_score = High Risk. Lower = Safe
    # We add some realistic non-linearities and noise
    risk_score = 10 + (dti * 0.8) + (lti * 5) + (dependents * 2) - (age * 0.1)
    
    # Penalty for bad credit utilization and too many credit cards 
    risk_score += (credit_utilization * 0.2) + (num_credit_cards * 1.5)
    
    # Employment penalty
    emp_penalty = {'Permanent': 0, 'Contract': 10, 'Self-Employed': 15, 'Business': 15}
    risk_score += np.array([emp_penalty[e] for e in employment_status])
    
    # Add random noise
    risk_score += np.random.normal(0, 5, num_samples)
    
    # Bound between 0 and 100
    risk_score = np.clip(risk_score, 0, 100)
    
    df = pd.DataFrame({
        'age': age,
        'annual_income': annual_income,
        'net_monthly_income': net_monthly_income,
        'existing_loan_commitments': existing_loan_commitments,
        'loan_amount': loan_amount,
        'loan_term': loan_term,
        'employment_status': employment_status,
        'dependents': dependents,
        # 'num_bank_accounts': num_bank_accounts,
        # 'num_credit_cards': num_credit_cards,
        # 'credit_utilization': credit_utilization,
        'risk_score': risk_score
    })
    
    return df

def train_and_save_model():
    df = generate_synthetic_data(10000)
    
    print("Dataset sample:")
    print(df.head())
    
    X = df.drop(columns=['risk_score'])
    y = df['risk_score']
    
    # Define features
    numeric_features = ['age', 'annual_income', 'net_monthly_income', 
                       'existing_loan_commitments', 'loan_amount', 'loan_term', 'dependents']
    categorical_features = ['employment_status']
    
    # Create preprocessing pipelines
    numeric_transformer = StandardScaler()
    categorical_transformer = OneHotEncoder(handle_unknown='ignore')
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ])
    
    # Create the full pipeline with Regressor
    model = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42))
    ])
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training model...")
    model.fit(X_train, y_train)
    
    score = model.score(X_test, y_test)
    print(f"Model R^2 Score on test set: {score:.4f}")
    print(f"Overall ML Model Accuracy: {score * 100:.2f}% accurate")
    
    # Save the pipeline
    joblib.dump(model, 'model.joblib')
    print("Model saved to model.joblib")

if __name__ == '__main__':
    train_and_save_model()
