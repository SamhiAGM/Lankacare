# 🇱🇰 LankaCare — Production Deployment Runbook
### Complete Step-by-Step Guide for Real Production Deployment
**Target Architecture**: Next.js (Vercel) + Express REST API (Render) + MongoDB Atlas + Custom Domain (`.lk` / `.com`)

---

## 1. 🏗️ Target Production Architecture

```
                                      🌐 USER / CLIENT
                                              │
                                              ▼
                                   CUSTOM DOMAIN / ROUTING
                           https://yourdomain.lk (or yourdomain.com)
                                              │
                                              ▼
                             ┌─────────────────────────────────┐
                             │    VERCEL — NEXT.JS FRONTEND    │
                             │        (Server & Client)        │
                             └────────────────┬────────────────┘
                                              │
                         NEXT_PUBLIC_API_URL  │  HTTPS REST API
                                              ▼
                             ┌─────────────────────────────────┐
                             │     RENDER — EXPRESS REST API   │
                             │      api.yourdomain.lk / .com   │
                             └────────────────┬────────────────┘
                                              │
                                  MONGODB_URI │  Encrypted TLS Connection
                                              ▼
                             ┌─────────────────────────────────┐
                             │      MONGODB ATLAS CLUSTER      │
                             │    (Automated Backups & HA)     │
                             └─────────────────────────────────┘
```

---

## 2. 🍃 Step 1: Set Up MongoDB Atlas Production Cluster

> [!IMPORTANT]
> **REQUIRED FROM USER**: You must provision your MongoDB Atlas account and cluster. AntiGravity/AI cannot and should not invent or guess your Atlas credentials. Follow these official steps:

1. **Sign in / Create Account**:
   - Navigate to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   - Create a project: `LankaCare-Production`.

2. **Deploy Cluster**:
   - Choose **M0 (Free)** for initial staging or **M10+ (Dedicated)** for production with automated daily point-in-time recovery.
   - Provider: **AWS** or **Google Cloud**.
   - Region: Select nearest geographic region: **ap-south-1 (Mumbai)** or **ap-southeast-1 (Singapore)** for lowest latency to Sri Lanka.

3. **Create Database User**:
   - Go to **Security → Database Access → Add New Database User**.
   - Authentication method: **Password**.
   - Username: e.g., `lankacare_admin`
   - Password: Click **Autogenerate Secure Password** and copy it safely into your password manager.
   - Database User Privileges: `Read and write to any database` (or restrict to `lankacare` database).

4. **Configure Network Access**:
   - Go to **Security → Network Access → Add IP Address**.
   - Select **Allow Access from Anywhere (`0.0.0.0/0`)** because Render uses dynamic outbound IP addresses across cloud providers.
   - Enter description: `Render Cloud API Gateway Outbound Access`.

5. **Obtain Connection String**:
   - Click **Database → Connect → Drivers (Node.js)**.
   - Copy connection URI template:
     ```text
     mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/lankacare?retryWrites=true&w=majority&appName=LankaCare
     ```
   - Replace `<username>` and `<password>` with your database user credentials.
   - Replace database name with `lankacare`.
   - **DO NOT commit this connection string to GitHub, .env files, or code.** Keep it for Render environment variables.

---

## 3. 🐙 Step 2: Prepare & Push Code to GitHub

1. **Initialize Git Repository** (if not already initialized):
   ```bash
   cd "c:\Users\User\OneDrive\Desktop\Digital Health Coordination"
   git init
   ```

2. **Verify .gitignore**:
   Ensure `.env`, `.env.local`, `.env.production`, `.env.development`, `node_modules`, `.next`, `dist`, `coverage` are ignored.
   ```bash
   git status
   ```
   *Verify that no `.env` or sensitive files appear in the untracked list.*

3. **Commit and Push**:
   ```bash
   git add .
   git commit -m "feat: complete LankaCare production deployment preparation"
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_ORG/lankacare.git
   git push -u origin main
   ```

---

## 4. ☁️ Step 3: Deploy Express Backend to Render

1. **Sign in to Render**:
   - Navigate to [Render Dashboard](https://dashboard.render.com/).
   - Click **New + → Web Service**.
   - Connect your GitHub repository.

2. **Configure Service Settings**:
   - **Name**: `lankacare-api` (or preferred name)
   - **Region**: Singapore or Frankfurt (choose region closest to Atlas cluster)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free or Starter ($7/mo recommended for production 24/7 uptime)

3. **Add Environment Variables in Render**:
   In **Environment Variables** tab, add the following (values provided by you):

   | Variable Name | Production Description | Example Format |
   | :--- | :--- | :--- |
   | `NODE_ENV` | Environment mode | `production` |
   | `PORT` | Web service port (Render injects automatically, default 5000) | `5000` |
   | `MONGODB_URI` | **REQUIRED FROM USER**: Your Atlas URI from Step 1 | `mongodb+srv://user:pass@cluster.mongodb.net/lankacare` |
   | `JWT_SECRET` | **REQUIRED FROM USER**: High-entropy 64-char hex string | `openssl rand -hex 32` |
   | `JWT_REFRESH_SECRET` | **REQUIRED FROM USER**: High-entropy 64-char hex string | `openssl rand -hex 32` |
   | `JWT_EXPIRES_IN` | Access token lifespan | `15m` |
   | `JWT_REFRESH_EXPIRES_IN` | Refresh token lifespan | `7d` |
   | `FRONTEND_URL` | Allowed frontend origin for CORS | `https://yourdomain.lk` (or temporary Vercel URL) |

4. **Deploy & Verify Health**:
   - Click **Create Web Service**.
   - Wait for build to complete.
   - Test endpoints:
     - Root health: `https://lankacare-api.onrender.com/health` → Expect:
       ```json
       {
         "status": "ok",
         "service": "LankaCare API"
       }
       ```
     - Database health: `https://lankacare-api.onrender.com/api/health` → Expect:
       ```json
       {
         "status": "ok",
         "service": "LankaCare API",
         "database": "connected",
         "environment": "production",
         "timestamp": "2026-09-08T..."
       }
       ```

---

## 5. 🖥️ Step 4: Deploy Next.js Frontend to Vercel

1. **Sign in to Vercel**:
   - Navigate to [Vercel Dashboard](https://vercel.com/).
   - Click **Add New… → Project**.
   - Import your GitHub repository.

2. **Configure Project Settings**:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click **Edit** and choose `frontend`.
   - **Build Command**: `next build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

3. **Add Environment Variables in Vercel**:
   In **Environment Variables** section:

   | Variable Name | Target Value | Description |
   | :--- | :--- | :--- |
   | `NEXT_PUBLIC_API_URL` | `https://lankacare-api.onrender.com/api` | Pointing to your deployed Render API (update to `https://api.yourdomain.lk/api` after domain setup) |

4. **Deploy**:
   - Click **Deploy**.
   - Vercel compiles all 52 static and dynamic routes.
   - You will receive a production URL: `https://lankacare.vercel.app`.

---

## 6. 🔄 Step 5: Connect Frontend to Backend (Initial Handshake)

1. Return to **Render Dashboard → lankacare-api → Environment Variables**.
2. Update `FRONTEND_URL`:
   ```text
   FRONTEND_URL=https://lankacare.vercel.app
   ```
3. Click **Save Changes**. Render will automatically redeploy with CORS updated to accept requests from your Vercel URL.
4. Verify by logging in on the Vercel URL with any authorized portal account.

---

## 7. 🌐 Step 6: Connect Custom Domain (.lk or .com)

> [!NOTE]
> For `.lk` domains: Register via the [LK Domain Registry](https://www.nic.lk/).
> For `.com` domains: Register via Cloudflare, Namecheap, GoDaddy, Google Cloud Domains, etc.

### Recommended Production DNS Architecture:
- Frontend: `yourdomain.lk` (or `yourdomain.com`)
- Backend API: `api.yourdomain.lk` (or `api.yourdomain.com`)

### DNS Configuration Table:

| Host / Subdomain | Type | Target / Value | Purpose |
| :--- | :--- | :--- | :--- |
| `@` (Apex) | `A` | `76.76.21.21` (or Vercel CNAME) | Points root domain to Vercel |
| `www` | `CNAME` | `cname.vercel-dns.com.` | Points www to Vercel |
| `api` | `CNAME` | `<your-render-service>.onrender.com.` | Points API subdomain to Render |

### Configure in Vercel:
1. Go to **Vercel Dashboard → Project Settings → Domains**.
2. Add `yourdomain.lk` and `www.yourdomain.lk`.
3. Vercel automatically provisions free, auto-renewing Let's Encrypt SSL/TLS certificates.

### Configure in Render:
1. Go to **Render Dashboard → lankacare-api → Settings → Custom Domains**.
2. Add `api.yourdomain.lk`.
3. Render automatically provisions SSL/TLS certificates via Cloudflare/Let's Encrypt.

---

## 8. 🔄 Step 7: Final Environment URL Synchronization

Once DNS propagation completes (usually 15–60 minutes):

1. **Update Render Environment Variables**:
   ```text
   FRONTEND_URL=https://yourdomain.lk,https://www.yourdomain.lk
   ```
2. **Update Vercel Environment Variables**:
   ```text
   NEXT_PUBLIC_API_URL=https://api.yourdomain.lk/api
   ```
3. **Trigger Redeploy in Vercel**:
   Go to **Vercel → Deployments → Redeploy** to bake the new `NEXT_PUBLIC_API_URL` into client components.

---

## 9. 🧪 Step 8: Post-Deployment Smoke Test Checklist

Execute these verifications against `https://yourdomain.lk`:

- [ ] **HTTPS Enforced**: Both `https://yourdomain.lk` and `https://api.yourdomain.lk` serve valid SSL certificates without mixed-content warnings.
- [ ] **Root Health**: `curl -I https://api.yourdomain.lk/health` returns HTTP 200 `{ "status": "ok", "service": "LankaCare API" }`.
- [ ] **Database Health**: `curl https://api.yourdomain.lk/api/health` returns `"database": "connected"`.
- [ ] **CORS Verification**: Requests from unauthorized origins receive `403` CORS rejection; requests from `https://yourdomain.lk` receive headers.
- [ ] **Citizen Portal Flow**: Citizen registers/logs in, views personal health records only, books outpatient consultation.
- [ ] **RBAC Isolation Flow**: Citizen attempting to access `/admin/permissions` or `/hospital-admin` receives strict HTTP 403 Access Denied.
- [ ] **Hospital Scoping**: Hospital Admin from Colombo NHSL cannot view or mutate Kinniya Hospital or Galle Karapitiya private data.
- [ ] **Kinniya Hospital**: Verified normal MongoDB record loaded without special conditional overrides.
- [ ] **No Hardcoded Fake Data**: Live inventory, dengue, and bed metrics accurately state their data provenance tier (OFFICIAL, VERIFIED, HISTORICAL, CALCULATED, USER_SUBMITTED, or UNKNOWN).

---

## 10. 🩺 Step 9: Database Backup, Restore & Recovery Strategy

1. **Continuous Backups**:
   - In MongoDB Atlas, enable **Cloud Backups** in cluster settings.
   - Point-in-time recovery allows rolling back database state to any minute in the last 7 days.
2. **Scheduled Snapshots**:
   - Daily snapshots retained for 30 days.
   - Monthly snapshots retained for 1 year.
3. **Restoration Procedure**:
   - Navigate to **MongoDB Atlas → Backup → Restore Snapshot**.
   - Select point-in-time or snapshot.
   - Restore into an isolated staging cluster to inspect before replacing production database.
4. **Disaster Recovery**:
   - Never rely on ephemeral server filesystems (Vercel/Render) for patient clinical records. All state lives in MongoDB Atlas replica sets across multiple availability zones.
