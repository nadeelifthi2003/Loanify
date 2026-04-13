import os

file_path = r"j:\Loanify\risk-service\main.py"

with open(file_path, "r", encoding="utf-8") as f:
    data = f.read()

new_payload = """

# ─────────────────────────────────────────────
# Document Validation Endpoint
# ─────────────────────────────────────────────

class DocumentData(BaseModel):
    fileName: str
    fileType: str
    data: str  # Base64 encoded

class DocumentValidationResponse(BaseModel):
    status: str
    confidence: float
    reason: Optional[str] = None

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
        seed = len(doc.fileName) + sum(ord(c) for c in doc.fileName)
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
    data += new_payload
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(data)
    print("Safely patched Python at EOF")
else:
    print("Already patched")
