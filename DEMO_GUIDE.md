# 🎬 FinGuard MLOps — 5-Minute Presentation & Demo Guide

This guide gives you a structured, minute-by-minute pitch script and live demonstration workflow for examiners, interviewers, or team demos.

---

## 🔑 Access Credentials & Dashboard URLs

| Service | URL | Default Credentials | Description |
|---|---|---|---|
| **FinGuard Web Dashboard** | [http://localhost:5173](http://localhost:5173) | `admin@finguard.ai` / `admin123` | Main analyst UI with Live Simulator |
| **Grafana MLOps Dashboards** | [http://localhost:3000](http://localhost:3000) | `admin` / `admin` | Real-time AI latency & fraud curves |
| **Prometheus Metrics & Alerts** | [http://localhost:9090](http://localhost:9090) | *(None)* | Live metrics scraping & active alert rules |
| **Alertmanager UI** | [http://localhost:9093](http://localhost:9093) | *(None)* | Threat routing to Slack channel |

---

## ⏱️ Minute-by-Minute Presentation Pitch Script

### **[Minute 0:00 – 1:00] Introduction & Architecture**
> *"Welcome! Today I'm presenting **FinGuard**, an end-to-end AI-powered financial fraud and money laundering detection platform built with modern MLOps practices.*
> 
> *Our system operates as a decoupled microservices architecture:*
> 1. *A **React + Vite** real-time analyst dashboard with 3D visualization and glassmorphism UX.*
> 2. *An **Express + MongoDB** transactional backend.*
> 3. *A high-throughput **FastAPI + XGBoost** AI microservice with SHAP explainability.*
> 4. *A **NetworkX graph engine** that uncovers multi-hop smurfing and money-laundering rings.*
> 5. *And an enterprise observability stack using **Prometheus**, **Grafana**, and **Alertmanager** sending instant alerts to **Slack**."*

---

### **[Minute 1:00 – 2:00] The Analyst Dashboard & Pre-Seeded History**
> *(Open [http://localhost:5173](http://localhost:5173) and log in with `admin@finguard.ai` / `admin123`)*
> 
> *"Here on the main dashboard, you can see live transaction volume, risk score distributions, and flagged alerts.*
> *At the top of the screen is our **Interactive Demo & Simulator Control Panel**, allowing us to simulate real-world transactional events in real-time.*
> 
> *If we click on any transaction in the table below, our **SHAP explainability engine** breaks down exactly why a risk score was assigned — showing whether it was driven by midnight odd-hour timing, high amounts, or cross-continental geolocation mismatches."*

---

### **[Minute 2:00 – 3:00] Triggering a Real-Time Fraud Attack & Slack Alert**
> *(Click the red **"2. Trigger Fraud Attack"** button on the screen)*
> 
> *"Watch what happens when an attacker attempts a coordinated fraud surge:*
> 1. *The simulator injects high-risk midnight transactions ($8,500+) with foreign geolocation discrepancies.*
> 2. *Our AI model scores them $>0.90$ probability and automatically flags them as **BLOCKED**.*
> 3. *The Prometheus metric `finguard_scored_transactions_total{verdict="Fraud"}` immediately spikes.*
> 4. *Now let's switch over to Slack — **Alertmanager has immediately fired a critical alert into our #alerts channel** with transaction details and timestamps!"*
> 
> *(Show your Slack channel on screen with the incoming alert message).*

---

### **[Minute 3:00 – 4:00] Money Laundering Smurfing & Graph Anomaly Detection**
> *(Click the amber **"3. Inject Smurfing Ring"** button on screen)*
> 
> *"Traditional rule engines miss smurfing because criminals deliberately keep individual transactions just under legal reporting thresholds (e.g. $4,900).*
> 
> *To solve this, FinGuard maintains a live, in-memory transaction graph:*
> *When we inject this smurfing cycle, our NetworkX graph engine detects the circular layering pattern across multiple cards.*
> *Navigating to the **Fraud Graph** page in our navigation menu, we can visually inspect the coordinated cycle and freeze the linked accounts immediately."*

---

### **[Minute 4:00 – 4:45] MLOps Monitoring: Grafana & Prometheus**
> *(Click the **"Grafana Dashboard"** button on the control panel to open [http://localhost:3000](http://localhost:3000))*
> 
> *"In production MLOps, model accuracy is only half the battle — we must monitor inference latency and concept drift.*
> 
> *In our auto-provisioned Grafana dashboard, we have real-time visibility into:*
> * **AI Inference Latency (p50 and p95)**: Verifying models respond in under 50ms.*
> * **Fraud Score Heatmap**: Showing normal traffic clustered near 0.05 and attack spikes near 0.95.*
> * **API Throughput (RPS)**: Tracking request volume by HTTP status.*
> 
> *And in Prometheus ([http://localhost:9090/alerts](http://localhost:9090/alerts)), we can see all 4 active threshold rules protecting our microservices."*

---

### **[Minute 4:45 – 5:00] Conclusion & Q&A**
> *"In summary, FinGuard provides full-lifecycle fraud prevention: from Machine Learning inference and graph algorithms to automated CI/CD with Jenkins and 24/7 Slack observability.*
> *Thank you, and I welcome any questions!"*

---

## 🛠️ Instant Command Reference

* **Seed sample data via terminal**:
  ```powershell
  docker compose exec backend npm run seed
  ```
* **Run automated traffic simulation from terminal**:
  ```powershell
  python scripts/trigger_events.py
  ```
* **Restart the entire stack**:
  ```powershell
  docker compose up -d
  ```
