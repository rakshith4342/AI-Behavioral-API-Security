# AI-Powered Behavioral API Security

> **HackSprint Round 2 Prototype Submission**  
> **Status:** Phase 1 Rule-Based Security Prototype (Working) | Phase 2 ML Anomaly Detection (Planned)

---

## 1. Problem Statement
REST APIs are the backbone of modern web applications, exposing critical data and internal functionality to external consumers. Traditional API security heavily relies on static authentication tokens and rate limiters. However, APIs remain vulnerable to sophisticated attacks such as:
- Automated credential stuffing and brute-force login attempts
- Broken Object Level Authorization (BOLA) and unauthorized endpoint probing
- Distributed rate-limit evasion (low-and-slow traffic bursts)
- Suspicious parameter injections and zero-day behavioral anomalies

Static firewalls often fail to analyze context-aware request patterns or evaluate behavioral risk in real time.

---

## 2. Existing Approach
Standard API security implementations rely primarily on traditional defenses:
- **Authentication:** Standard passwords or API tokens (JWTs)
- **Authorization:** Role-Based Access Control (RBAC) at route handlers
- **Basic Rate Limiting:** Fixed IP counters per minute
- **Static Rules / WAFs:** Pattern matching against known attack signatures
- **Request Monitoring:** Post-hoc log aggregation without real-time interception

While necessary, these traditional layers operate independently and miss contextual behavioral patterns across multiple endpoints.

---

## 3. Proposed Solution
The **AI-Powered Behavioral API Security Platform** introduces an inline security middleware layer sitting directly between incoming client requests and backend REST API business logic.

The system combines:
1. **Security Middleware Interception:** Intercepts every API call before business logic execution.
2. **Rule-Based Risk Scoring:** Real-time evaluation of rate limits, authentication failures, route privileges, and payload signatures.
3. **Request & Telemetry Logging:** Comprehensive log storage in MongoDB for SecOps auditing.
4. **Automated Policy Action:** Instant classification into ALLOW, FLAG (Monitor), or BLOCK (Forbidden).
5. **Future ML-Based Behavioral Anomaly Detection:** An extension hook to integrate Python and Scikit-learn for unsupervised Isolation Forest anomaly detection.

---

## 4. CURRENT IMPLEMENTATION
> ⚠️ **IMPORTANT NOTE FOR HACKSPRINT ROUND 2:**  
> The current prototype implements the **Rule-Based Security Layer** and risk-based request classification. All rules, rate limiters, authentication failure counters, endpoint guards, risk scoring (0–100), decision classification (ALLOW/FLAG/BLOCK), MongoDB logging, and the React cybersecurity dashboard are 100% functional end-to-end.

---

## 5. FUTURE ML COMPONENT (PLANNED)
> 🔮 **FUTURE SCOPE (PHASE 2):**  
> Future implementation will integrate **Python**, **Scikit-learn**, and **Isolation Forest** for behavioral anomaly detection. The ML model will analyze multi-dimensional request vectors (payload size entropy, endpoint access frequency, time-of-day entropy) after rule checks to catch complex zero-day anomalies that rules may miss.

---

## 6. Architecture Diagram

```
                                  +---------------------------------------+
                                  |         React Security Dashboard       |
                                  |      (Interactive Request Runner)     |
                                  +---------------------------------------+
                                                      │
                                                      ▼
                                  +---------------------------------------+
                                  |           Express REST API            |
                                  +---------------------------------------+
                                                      │
                                                      ▼
                                  +---------------------------------------+
                                  |     Behavioral Security Middleware    |
                                  +---------------------------------------+
                                                      │
                       ┌──────────────────────────────┴──────────────────────────────┐
                       ▼                                                             ▼
     +-----------------------------------+                         +-----------------------------------+
     |    Phase 1: Rule-Based Engine     |                         | Phase 2: ML Isolation Forest      |
     |          [ CURRENT ACTIVE ]       |                         |        [ PLANNED FUTURE ]         |
     |  • Rate Limit Frequency Burst     |                         |  • Python + Scikit-Learn Service  |
     |  • Failed Login Tracker           |                         |  • Behavioral Anomaly Detector    |
     |  • Protected Route Auth Check     |                         |  • Unsupervised Outlier Scoring   |
     |  • SQLi / XSS Signature Audit     |                         |                                   |
     +-----------------------------------+                         +-----------------------------------+
                       │                                                             │
                       └──────────────────────────────┬──────────────────────────────┘
                                                      │
                                                      ▼
                                  +---------------------------------------+
                                  |      Rule-Based Risk Score (0-100)    |
                                  |     LOW (0-30) | MED (31-60) | HIGH (61-100)
                                  +---------------------------------------+
                                                      │
                                    ┌─────────────────┴─────────────────┐
                                    ▼                                   ▼
                         [ ALLOW / FLAG (200 OK) ]                   [ BLOCK (403 Forbidden) ]
                                    │                                   │
                                    └─────────────────┬─────────────────┘
                                                      │
                                                      ▼
                                  +---------------------------------------+
                                  |        MongoDB Audit Logging          |
                                  +---------------------------------------+
```

---

## 7. Technology Stack

- **Frontend:** React.js, Vite, Lucide React Icons, Dark Mode Cybersecurity CSS
- **Backend:** Node.js, Express.js (REST API & Custom Security Middleware)
- **Database:** MongoDB (via Mongoose) + Hybrid In-Memory Fallback Store
- **Future ML Engine (Planned):** Python 3.11+, Scikit-learn (Isolation Forest), FastAPI/gRPC

---

## 8. Security Features

- **Inline Request Monitoring:** Intercepts and logs every incoming HTTP request.
- **Adaptive Rate Limiting:** Detects high-frequency request bursts from individual client IPs.
- **Failed Login Tracking:** Maintains sliding window counters of failed authentication attempts to halt brute-force attacks.
- **Protected Endpoint Detection:** Enforces strict authorization token requirements on restricted paths like `/api/admin`.
- **Deterministic Risk Scoring:** Maps triggered rule violations to a 0–100 numerical risk score.
- **Dynamic Decision Engine:**
  - `0–30 (LOW RISK)` ➔ **ALLOW** request
  - `31–60 (MEDIUM RISK)` ➔ **FLAG & MONITOR** request
  - `61–100 (HIGH RISK)` ➔ **BLOCK** request with HTTP 403 Forbidden
- **MongoDB Audit Telemetry:** Records timestamp, HTTP method, endpoint, IP address, risk score, risk level, request status, reason summary, and execution latency.

---

## 9. Demo Scenarios

The included React Security Dashboard features **One-Click Demo Attack Scenario Buttons**:

1. **Normal Request (`GET /api/products` or `GET /api/users`):**
   - **Result:** `ALLOWED` | Status `200 OK` | Risk Score `0` | Level `LOW`
2. **Repeated Failed Login Attack (`POST /api/login` repeatedly):**
   - **Result:** Initially `ALLOWED/401` ➔ `FLAGGED` (Score 35) ➔ `BLOCKED` (Score 75, Status `403 Forbidden`)
   - **Reason:** *Brute-force Threat: 2+ previous failed login attempts recorded for IP*
3. **Unauthorized Admin Access (`GET /api/admin` without token):**
   - **Result:** `BLOCKED` | Status `403 Forbidden` | Risk Score `65` | Level `HIGH`
   - **Reason:** *Unauthorized Access Attempt: Protected route '/api/admin' missing valid admin token*

---

## 10. Future Scope

- **Isolation Forest Unsupervised Model:** Integration of Scikit-learn Isolation Forest model via Python microservice.
- **Behavioral Anomaly Detection:** Machine learning analysis of payload size variance, access time entropy, and route sequence probabilities.
- **ML-Based Risk Enhancement:** Combining static rule risk scores with ML anomaly probability.
- **Adaptive Rate Limiting:** Dynamic adjustment of client rate limits based on behavioral threat levels.
- **Automated Incident Analysis:** Automated summary reports of threat patterns.
- **Advanced Policy Configuration:** Customizable rule weights and threshold policies via SecOps UI.

---

## 11. Installation & Setup

### Prerequisites
- Node.js (v18+)
- npm (v9+)
- MongoDB (Optional local service on `mongodb://127.0.0.1:27017/api_security_db`. If MongoDB is not running locally, the application automatically uses a built-in in-memory fallback store so hackathon testing works seamlessly out of the box!).

### 1️⃣ Start Backend Server

```bash
cd backend
npm install
npm start
```
> Server starts on: `http://localhost:5000`

### 2️⃣ Start Frontend Dashboard

Open a second terminal window:

```bash
cd frontend
npm install
npm run dev
```
> Dashboard starts on: `http://localhost:5173`

---

## 🛠️ Project Structure

```
project/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── RequestSimulator.jsx
│   │   │   ├── ArchitectureModal.jsx
│   │   │   └── LiveLogsTable.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   ├── riskEngine.js
│   │   └── securityMiddleware.js
│   ├── models/
│   │   └── Log.js
│   ├── routes/
│   │   ├── apiRoutes.js
│   │   └── logRoutes.js
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── README.md
└── .gitignore
```
