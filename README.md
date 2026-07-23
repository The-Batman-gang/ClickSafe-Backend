# 🛡️ ClickSafe Backend

ClickSafe (also known as VeriWeb) is a comprehensive, production-ready URL and website technical analysis API service. Built on **Node.js**, **Express**, and **Supabase**, ClickSafe analyzes web domains in real-time to inspect their security configurations, hosting infrastructure, domain authority, and redirect behaviors.

It is designed to power client applications, browser extensions, or security tools that need to quickly assess the safety, technical structure, and legitimacy of any web link.

---

## 🚀 Key Features

ClickSafe performs deep, concurrent checks across multiple layers of a website's technical stack:

1. **🔒 SSL/TLS Security Checker**
   * Establishes a TLS connection to verify SSL certificate validity.
   * Extracts certificate metadata: issuer (organization/common name), subject, validation dates, and remaining days until expiration.
   * Gracefully flags invalid, self-signed, or expired certificates.

2. **🏷️ WHOIS Domain Lookup**
   * Resolves registrar name, registry location (country), and registered nameservers.
   * Extracts domain registration and expiry dates.
   * Calculates the exact age of the domain (in days) to help assess trustworthiness.

3. **🌍 Hosting & Geolocation Information**
   * Resolves target hostname to its primary IPv4 address.
   * Performs IP lookup to extract the Hosting ISP, hosting organization, hosting country, city, and Autonomous System (AS) details.

4. **🔄 Redirect Chain Analysis**
   * Probes the URL to count HTTP redirect hops (up to 10 redirects).
   * Identifies the final destination URL.
   * Verifies if insecure URLs (`http://`) successfully redirect/upgrade to secure HTTPS (`https://`).

5. **🔍 DNS Records Resolver**
   * Resolves fundamental DNS records concurrently: `A`, `AAAA`, `MX` (Mail Exchange), and `NS` (Name Servers) records.

6. **💾 Supabase Data Persistence**
   * Automatically saves and indexes every completed analysis report in a Supabase PostgreSQL database for historical logging, audits, and caching.

---

## 📂 Project Structure

```text
ClickSafe-Backend/
├── src/
│   ├── app.js               # Express application initialization & middleware setup
│   ├── server.js            # Database verification & server listener entry point
│   ├── config/
│   │   └── supabase.js      # Supabase Client configuration
│   ├── controllers/
│   │   └── analysis.controller.js  # Main route handler orchestration logic
│   ├── routes/
│   │   └── analysis.routes.js      # Endpoint route mapping (/api/analyze)
│   ├── services/
│   │   ├── database/
│   │   │   └── database.service.js # Supabase queries (insert/select reports)
│   │   └── technical/
│   │       ├── technical.service.js # Parallel checker runner (orchestrator)
│   │       ├── dns.service.js       # DNS A, AAAA, MX, NS records resolver
│   │       ├── hosting.service.js   # IP resolution & ip-api geolocation service
│   │       ├── redirect.service.js  # Axios redirect-chain scanner
│   │       ├── ssl.service.js       # tls client peer-certificate inspector
│   │       └── whois.service.js     # WHOIS registration info parser
│   └── utils/
│       └── .gitkeep
├── .env.example             # Template for required environment variables
├── nodemon.json             # Development reloading watcher config
├── package.json             # Dependencies and scripts metadata
└── README.md                # System documentation
```

---

## 🛠️ Tech Stack & Dependencies

* **Runtime**: [Node.js](https://nodejs.org/) (v16+)
* **Framework**: [Express.js](https://expressjs.com/) (v5.x)
* **Database / Backend-as-a-Service**: [Supabase](https://supabase.com/) (`@supabase/supabase-js`)
* **Libraries**:
  * `axios` for HTTP/HTTPS redirects and hosting geolocation requests.
  * `whois-json` for automated WHOIS raw information parsing.
  * `helmet` for HTTP response security headers.
  * `cors` for enabling Cross-Origin Resource Sharing.
  * `morgan` for development request logging.
  * `nodemon` (dev dependency) for hot-reloading code modifications.

---

## ⚙️ Getting Started

### 1. Prerequisites
* [Node.js](https://nodejs.org/) installed locally (v18+ recommended).
* A [Supabase](https://supabase.com/) account and project.

### 2. Supabase Table Setup
Before running the server, ensure you have created an `analysis_reports` table in your Supabase database. You can execute the following query in your Supabase SQL Editor:

```sql
CREATE TABLE analysis_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    technical_report JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### 3. Installation
Clone the repository, navigate into the directory, and install dependencies:

```bash
npm install
```

### 4. Environment Configuration
Create a `.env` file in the root directory (you can copy from `.env.example` if available) and add your credentials:

```ini
PORT=5000
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-service-role-or-anon-key
```

### 5. Running the Application

* **Development Mode** (with hot-reloading via nodemon):
  ```bash
  npm run dev
  ```

* **Production Mode**:
  ```bash
  npm start
  ```

The server will start up, verify connection with Supabase, and output:
```text
✅ Supabase Connected
🚀 Server running on http://localhost:5000
```

---

## 📡 API Reference

### 1. Health / Status Check
Checks if the API is running correctly.

* **Endpoint**: `GET /`
* **Response Status**: `200 OK`
* **Response Body**:
```json
{
  "success": true,
  "message": "🚀 VeriWeb Backend is running"
}
```

---

### 2. Analyze Website
Performs a full suite of technical and security checks on a given URL, saves the result to Supabase, and returns the analysis.

* **Endpoint**: `POST /api/analyze`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
```json
{
  "url": "https://github.com"
}
```

* **Response Status**: `200 OK`
* **Response Body Example**:
```json
{
  "success": true,
  "url": "https://github.com",
  "analysisId": "8f8e02bc-33d3-466d-a7b6-e26b840801d9",
  "technical": {
    "ssl": {
      "valid": true,
      "issuer": "DigiCert Inc",
      "subject": "github.com",
      "valid_from": "Mar 10 00:00:00 2026 GMT",
      "valid_to": "Mar 10 23:59:59 2027 GMT",
      "expires_in_days": 230
    },
    "whois": {
      "success": true,
      "registrar": "MarkMonitor, Inc.",
      "creationDate": "1999-10-09T18:07:00Z",
      "expiryDate": "2028-10-09T18:07:00Z",
      "domainAgeDays": 9784,
      "country": "US",
      "nameServers": [
        "ns-1234.awsdns-26.org",
        "ns-567.awsdns-07.net"
      ]
    },
    "dns": {
      "success": true,
      "A": ["140.82.112.4"],
      "AAAA": [],
      "MX": [
        { "exchange": "aspmx.l.google.com", "priority": 1 }
      ],
      "NS": [
        "ns-1234.awsdns-26.org",
        "ns-567.awsdns-07.net"
      ]
    },
    "redirects": {
      "success": true,
      "redirectCount": 0,
      "finalUrl": "https://github.com/",
      "redirected": false,
      "httpsRedirect": false
    },
    "hosting": {
      "success": true,
      "ip": "140.82.112.4",
      "isp": "GitHub, Inc.",
      "organization": "GitHub, Inc.",
      "country": "United States",
      "city": "Seattle",
      "as": "AS36459 GitHub, Inc."
    }
  }
}
```

* **Error Response Example** (e.g., if domain/url query is missing):
  * **Response Status**: `400 Bad Request`
  ```json
  {
    "success": false,
    "message": "URL is required"
  }
  ```

---

## 🛡️ License

This project is licensed under the **ISC License**. Feel free to modify and adapt it for your own safety and analysis applications.