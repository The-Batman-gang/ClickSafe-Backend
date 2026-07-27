# 🛡️ ClickSafe
# - Technical Overview & Features

An end-to-end security browser extension designed to detect website scams/fraud, phishing attempts, and employment/job listing fraud in real time.

---

## 🌟 Core Functionality

The extension dynamically inspects the current page upon loading and exposes two specialized security evaluation pipelines:

### 📱 Dynamic UI & Route Detection

* **Page Detection On Load:** When a web page finishes loading, a background check determines whether the page is a job posting or a standard website.
* **Contextual Toggle UI:**
* **Job Page Detected:** Displays an interactive toggle switch allowing the user to select between **Job Analysis** or **Website Analysis** before initiating the scan.
* **Standard Page Detected:** Hides the toggle option and automatically routes the request through the **Website Analysis** pipeline upon clicking **Analyse**.



---

## 🚀 Analysis Pipelines

### 1. 🌐 Website Scam Analysis Pipeline

A multi-layered threat analysis divided into three distinct modules:

* **a. Technical Analysis:**
    * **DNS Lookup & DNS Record Check:** Validates domain routing integrity.
    * **Redirect Chain Verification:** Traces link redirects (up to 10 hops) to reveal cloaked or hidden malicious URLs.
    * **SSL Certificate Check:** Verifies HTTPS security parameters and issuer validity.
    * **WHOIS Check:** Evaluates domain registration age, registrar info, and expiry risks.


* **b. Reputation Analysis:**
    * **AbuseIPDB:** Checks host IP reputation against active server abuse reports.
    * **PhishTank:** Verifies real-time community-submitted phishing status.
    * **VirusTotal API:** Scans the domain against 70+ global antivirus and security vendors.
    * **Reddit & Public Discussion Grounding (Gemini AI):** Live searches community forums (via Google Search Grounding) for user-reported scam warnings regarding the domain.


* **c. Content Analysis (Crawled DOM via Gemini AI):**
    * Crawls web page text, links, and structure to detect dark patterns and deceptive signals:
    * Fake Trust Badges & Certificates
    * Fake Urgency / Pressure Tactics
    * Missing Legal Policies (Privacy Policy, Terms of Service)
    * Grammar Quality & Suspicious Content Claims
    * Hidden & Deceptive Links
    * And many more





---

### 2. 💼 Job Scam Detection Pipeline

Specially tuned to catch recruitment fraud, task scams, and fake HR listings:

* **a. Compensation & Community Sentiment Check:**
    * **"Too Good to Be True" Claims:** Scans salary data, low-effort requirements, and upfront payment/deposit demands.
    * **Public Discussion Search:** Live checks Reddit and forums for past scam reports or complaints mentioning the company name.


* **b. Entity & HR Footprint Verification:**
    * **Recruiter Email Domain Alignment:** Cross-checks recruiter contact emails against official corporate domains (flagging personal webmail addresses like `@gmail.com`).
    * **Corporate Web Footprint:** Searches for official news coverage, corporate events, and public press releases to verify the legitimacy of the hiring entity.



---

## 🧠 Master Synthesis & Final Output

1. **JSON Aggregation:** Raw data from technical checks, reputation APIs, and content analysis is compiled into a single structured JSON payload.
2. **Gemini AI Master Summarizer:** The aggregated payload is processed by the Gemini API to produce the final user-facing summary:
    * **Overall Risk Level:** `HIGH`, `MEDIUM`, or `LOW`
    * **Safety Score:** Calculated percentage score
    * **Executive Verdict:** Clear plain-language explanation of whether the site/job is safe
    * **Flagged Risk Factors:** Itemized list of triggers that caused the alert
    * **Attributed Sources:** Real-time web search links used to substantiate claims



---

## ⚡ Caching & Performance Architecture

* **Database Lookup Strategy:** Maintains a persistent database storing completed scan results linked to evaluated URLs/job listings.
* **Token Optimization & Low Latency:**
* Before initiating new external API calls or AI processing, the backend checks the database for an existing result.
* **Cache Hit:** Serves the pre-computed analysis instantly, reducing token usage and response latency.
* **Cache Miss:** Runs the full pipeline, returns the result to the user, and asynchronously caches it in the database for future requests.