import pytest

pytest.importorskip("httpx")

from fastapi.testclient import TestClient
from api.main import app


def test_health_and_methodology():
    client = TestClient(app)
    r = client.get("/health"); assert r.status_code == 200 and r.json().get("status") == "ok"

    r = client.get("/methodology"); assert r.status_code == 200
    data = r.json()
    for k in ("inputs", "weights", "equations", "notes"):
        assert k in data

