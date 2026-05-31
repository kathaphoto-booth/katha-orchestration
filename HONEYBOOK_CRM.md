# HoneyBook CRM Integration Specification

This document details the end-to-end client intake and reservation enrichment pipeline. It preserves the clean CRM integration parameters and logic while maintaining strict decoupling from legacy namespaces.

---

## 1. Core Objective
Automate the event booking pipeline to capture, enrich, and lock in event details from the initial touchpoint to final contract issuance, minimizing conversion friction while ensuring data integrity.

---

## 2. Data Flow Architecture

```
[1. WEBSITE 3-FIELD INTAKE]
       │ (Name, Email, Event Date)
       ▼
[2. API ROUTE: /api/inquiry]
       │
       ├───► [SUPABASE DB] (Records lead state: "Inquired")
       │
       └───► [HONEYBOOK PIPELINE (PID: 679039857c7a9b001f4098a8)]
                 │
                 ▼
[3. PERSONALIZED RESEND ENRICHMENT MAIL]
                 │ (Sent instantly to client with unique access token link)
                 ▼
[4. SECURE CLIENT PANEL (/reserve?lead=[hash])]
                 │ (Client completes Tier, Template, Gallery, & Logistics)
                 ▼
[5. HONEYBOOK SMART CONTRACT PROPOSAL]
                 │ (Auto-generated contract showing complete parameters)
                 ▼
[6. CLINICAL DISPATCH] (Vince & Jed receive the exact parameter checklist)
```

---

## 3. Implementation Blueprint

### Phase 1: Conversion-Optimized Capture
To maximize mobile touch-zone conversion momentum and keep friction at a minimum, public-facing inquiry modals must collect **strictly three fields**:
1. `client_name`
2. `client_email`
3. `event_date`

On submission, the backend:
* Write a new record to the `leads` table in Supabase.
* Generates a unique, non-sequential cryptographic `lead_hash`.
* Pings the HoneyBook CRM intake pipeline using PID `679039857c7a9b001f4098a8`.

### Phase 2: Transactional Enrichment Link
Immediately upon database write, a transaction email is dispatched via **Resend**:
* **Destination:** `client_email`
* **Payload:** A secure, tokenized URL: `[domain]/reserve?lead_token=[hash]`
* **Purpose:** Allows the client to details their package at their own pace, bypassing checkout friction on the initial marketing touchpoint.

### Phase 3: Parameters Intake (/reserve)
On the token-authenticated `/reserve` dashboard, the client completes their logistical and creative checklist:
* **Package Selection:** Classic / Signature / Heritage.
* **Creative Add-ons:** Custom backdrops, slideshow additions, bespoke print templates.
* **Logistics:** Venue name, precise physical address (for automated travel surcharges), and setup constraints.

### Phase 4: CRM Synchronization
Upon form completion:
1. The Supabase record transitions state to `"Enriched"`.
2. Finalized details are synchronized into the **HoneyBook Smart Contract** under project ID `679039857c7a9b001f4098a8`.
3. An automated dispatch notification is sent to the operations team detailing the exact parameters.
