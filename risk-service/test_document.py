"""
Loanify — Document Verification Testing
Tests the /validate-document endpoint across 5 scenarios:
  1. Valid PDF   (bank statement with keywords)
  2. Invalid PDF (no financial keywords)
  3. Valid Image (large enough file, clean name)
  4. Invalid Image — too small (fake/small file)
  5. Invalid Image — suspicious filename
"""

import base64
import io
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

SEPARATOR = "-" * 55


def make_pdf_base64(content: str) -> str:
    """Build a properly structured binary PDF with correct xref offsets that pypdf can parse."""
    stream_text = f"BT /F1 12 Tf 100 700 Td ({content}) Tj ET"
    stream_len  = len(stream_text.encode("latin-1"))

    obj1 = b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
    obj2 = b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
    obj3 = (
        b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
        b"/Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n"
    )
    stream_body = stream_text.encode("latin-1")
    obj4 = (
        b"4 0 obj\n<< /Length " + str(stream_len).encode() + b" >>\n"
        b"stream\n" + stream_body + b"\nendstream\nendobj\n"
    )
    obj5 = (
        b"5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n"
    )

    header = b"%PDF-1.4\n"
    offsets = []
    body = header

    for obj in [obj1, obj2, obj3, obj4, obj5]:
        offsets.append(len(body))
        body += obj

    xref_offset = len(body)
    xref  = b"xref\n0 6\n"
    xref += b"0000000000 65535 f \n"
    for off in offsets:
        xref += f"{off:010d} 00000 n \n".encode()

    trailer = (
        b"trailer\n<< /Size 6 /Root 1 0 R >>\n"
        b"startxref\n" + str(xref_offset).encode() + b"\n%%EOF\n"
    )

    pdf_bytes = body + xref + trailer
    return base64.b64encode(pdf_bytes).decode("utf-8")


def make_image_base64(size_kb: int) -> str:
    """Create a fake image payload of given size in KB."""
    fake_bytes = b"\xFF\xD8\xFF\xE0" + b"\x00" * (size_kb * 1024)
    return base64.b64encode(fake_bytes).decode("utf-8")


def print_result(test_name: str, response, expected_status: str):
    data = response.json()
    actual   = data.get("status", "UNKNOWN")
    confidence = data.get("confidence", 0)
    reason   = data.get("reason", "")
    passed   = "PASSED" if actual == expected_status else "FAILED"

    print(f"\n{SEPARATOR}")
    print(f"  Test : {test_name}")
    print(f"  HTTP : {response.status_code}")
    print(f"  Status     : {actual}")
    print(f"  Confidence : {confidence:.0%}")
    print(f"  Reason     : {reason}")
    print(f"  Expected   : {expected_status}  -->  [{passed}]")
    print(SEPARATOR)
    return passed == "PASSED"


# ── TEST 1: Valid PDF with bank/salary keywords ──────────────────────────────
def test_valid_pdf_bank_statement():
    pdf_b64 = make_pdf_base64(
        "Bank Statement account balance credit debit salary employee payslip"
    )
    response = client.post("/validate-document", json={
        "fileName": "bank_statement_2024.pdf",
        "fileType": "application/pdf",
        "data": pdf_b64
    })
    assert response.status_code == 200
    return print_result("Valid PDF — Bank Statement", response, "Valid")


# ── TEST 2: Invalid PDF — no financial keywords ──────────────────────────────
def test_invalid_pdf_no_keywords():
    pdf_b64 = make_pdf_base64("Hello world this is a random document with no financial terms")
    response = client.post("/validate-document", json={
        "fileName": "random_doc.pdf",
        "fileType": "application/pdf",
        "data": pdf_b64
    })
    assert response.status_code == 200
    return print_result("Invalid PDF — No Keywords", response, "Invalid")


# ── TEST 3: Valid Image — large enough, clean filename ───────────────────────
def test_valid_image_large():
    img_b64 = make_image_base64(size_kb=20)   # 20 KB — passes the 15 KB threshold
    response = client.post("/validate-document", json={
        "fileName": "payslip_march_2024.png",
        "fileType": "image/png",
        "data": img_b64
    })
    assert response.status_code == 200
    return print_result("Valid Image — Large Payslip Scan", response, "Valid")


# ── TEST 4: Invalid Image — file too small ───────────────────────────────────
def test_invalid_image_too_small():
    img_b64 = make_image_base64(size_kb=5)    # 5 KB — below 15 KB threshold
    response = client.post("/validate-document", json={
        "fileName": "small_image.png",
        "fileType": "image/png",
        "data": img_b64
    })
    assert response.status_code == 200
    return print_result("Invalid Image — Too Small (<15KB)", response, "Invalid")


# ── TEST 5: Invalid Image — suspicious filename ──────────────────────────────
def test_invalid_image_fake_name():
    img_b64 = make_image_base64(size_kb=20)   # Large enough but suspicious name
    response = client.post("/validate-document", json={
        "fileName": "fake_document.png",
        "fileType": "image/png",
        "data": img_b64
    })
    assert response.status_code == 200
    return print_result("Invalid Image — Suspicious Filename (fake_*)", response, "Invalid")


# ── MAIN RUNNER ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("\n" + "=" * 55)
    print("   LOANIFY — Document Verification Test Suite")
    print("   Endpoint: POST /validate-document")
    print("=" * 55)

    results = [
        test_valid_pdf_bank_statement(),
        test_invalid_pdf_no_keywords(),
        test_valid_image_large(),
        test_invalid_image_too_small(),
        test_invalid_image_fake_name(),
    ]

    passed = results.count(True)
    failed = results.count(False)

    print(f"\n{'=' * 55}")
    print(f"  RESULTS: {passed} passed  |  {failed} failed  |  {len(results)} total")
    print(f"{'=' * 55}\n")
