# ui/dashboard.py

import os
import requests
import streamlit as st

API_BASE = os.getenv("API_BASE", "http://localhost:8000")

st.set_page_config(page_title="SovAI Index", layout="wide")
st.title("SovAI Index – Sovereign AI Readiness Dashboard (MVP)")

# Country list
resp = requests.get(f"{API_BASE}/countries")
countries = resp.json()

col1, col2 = st.columns([1, 2])

with col1:
    st.subheader("Countries")
    selected = st.selectbox(
        "Select country",
        options=[c["iso_code"] for c in countries],
        format_func=lambda iso: next(c["name"] for c in countries if c["iso_code"] == iso),
    )

with col2:
    st.subheader("Readiness Snapshot")
    if selected:
        detail = requests.get(f"{API_BASE}/country/{selected}").json()
        r = detail.get("readiness", {})
        st.metric("Readiness Score", f"{r.get('score', 'N/A')}")
        st.metric("Policy Score", r.get("policy_score", "N/A"))
        st.metric("Infra Score", r.get("infra_score", "N/A"))
        st.metric("Risk Score", r.get("risk_score", "N/A"))

        st.markdown("### Key Indicators")
        for ind in detail.get("indicators", [])[:15]:
            st.write(f"- **{ind['policy']}**: `{ind['key']}` = `{ind['value']}`")

