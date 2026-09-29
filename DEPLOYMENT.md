# LocalFix Deployment Guide

This document outlines the deployment configuration for LocalFix with **Frontend hosted on Vercel** and **Backend + PostgreSQL hosted on Render**.

---

## 1. Vercel Configuration (Frontend)

Vite bakes environment variables into static assets at **build time**. Setting environment variables after building will not update the frontend.

1. Go to your **Vercel Dashboard** -> Project Settings -> **Environment Variables**.
2. Add the following environment variable:
   - `VITE_API_URL`: `https://<your-render-app>.onrender.com/api` (Ensure it ends with `/api` and has no trailing slash after `/api`).
3. **Trigger a new deployment** (Re-deploy without cache) so Vite bakes the new `VITE_API_URL` into the build output.

---

## 2. Render Configuration (Backend & Database)

### Web Service Environment Variables
In your **Render Web Service** -> Settings -> **Environment Variables**, configure:

- `ENVIRONMENT`: `production`
- `PYTHON_VERSION`: `3.11.9` (Recommended stable Python version)
- `CORS_ORIGINS`: `https://<your-vercel-app>.vercel.app` (Exact Vercel URL without trailing slash. For multiple domains, separate by comma: `https://app.vercel.app,https://customdomain.com`)
- `DATABASE_URL`: `postgresql://<user>:<password>@<host>:<port>/<dbname>` (Use Render PostgreSQL internal database URL)
- `JWT_SECRET`: `<secure-random-secret-key>` (Must be set and unique in production)
- `JWT_ALGORITHM`: `HS256`
- `ADMIN_EMAIL`: `admin@localfix.com`
- `ADMIN_PASSWORD`: `<your-secure-admin-password>`
- `GEMINI_API_KEY`: `<your-gemini-api-key>`

---

## 3. How to Verify Deployment

1. **Verify Backend Health**:
   Visit `https://<your-render-app>.onrender.com/api/health` in your browser. It should return `{"status": "healthy", ...}`.

2. **Verify API Documentation**:
   Visit `https://<your-render-app>.onrender.com/docs` to test endpoints directly via Swagger UI.

3. **Verify Frontend API Connection**:
   - Open your deployed Vercel site in Chrome / Firefox.
   - Open **Developer Tools** (`F12`) -> **Network** tab.
   - Perform an action (e.g. attempt admin or user login).
   - Check that request URLs point to `https://<your-render-app>.onrender.com/api/auth/login`.
   - Ensure response status is `200` (or `401` for bad credentials), and NOT `Failed to fetch` or CORS errors.
