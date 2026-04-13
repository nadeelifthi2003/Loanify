import os

file_path = r"j:\Loanify\risk-service\main.py"

with open(file_path, "r", encoding="utf-8") as f:
    data = f.read()

new_models = """

class DocumentData(BaseModel):
    fileName: str
    fileType: str
    data: str  # Base64 encoded

class DocumentValidationResponse(BaseModel):
    status: str
    confidence: float
    reason: Optional[str] = None
"""

new_endpoint = """
@app.post("/validate-document", response_model=DocumentValidationResponse)
def validate_document(doc: DocumentData):
    \"\"\"
    Simulates ML document validation for identity and income proofs.
    Returns Valid/Invalid status based on deterministic mock rules.
    \"\"\"
    try:
        name_lower = doc.fileName.lower()
        
        # Simulated risk logic based on filenames
        if "fake" in name_lower or "fraud" in name_lower or "test_invalid" in name_lower:
            return DocumentValidationResponse(
                status="Invalid",
                confidence=0.98,
                reason="Document metadata indicates potential forgery."
            )
        
        # Default mock simulation
        # Use filename length as a deterministic seed to make it reproducible
        seed = len(doc.fileName) + sum(ord(c) for c in doc.fileName)
        
        # Have a high chance of validation to not block flow, but fake name forces Invalid
        is_valid = seed % 15 != 0
        
        if is_valid:
            return DocumentValidationResponse(
                status="Valid",
                confidence=0.85 + (seed % 15) / 100.0,
                reason="Document passed verification checks."
            )
        else:
            return DocumentValidationResponse(
                status="Invalid",
                confidence=0.75 + (seed % 20) / 100.0,
                reason="Document failed automated visual consistency checks."
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
"""

if "class DocumentData(BaseModel):" not in data:
    # Insert models after the application models
    search_str = "class RiskAssessmentResponse(BaseModel):"
    
    parts = data.split(search_str)
    if len(parts) == 2:
        new_data = parts[0] + search_str + parts[1].split("class")[0] + new_models + "class" + "".join(parts[1].split("class")[1:])
        # Now there's an issue with the split, let's just use string replace.
        # Let's cleanly replace the end of RiskAssessmentResponse
    
        target_end_of_model = "alerts: List[Dict[str, str]]"
        data = data.replace(target_end_of_model, target_end_of_model + new_models)
        
    data += new_endpoint

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(data)
    print("Patched Python")
else:
    print("Already patched")
