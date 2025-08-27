# Bun + React + PostgreSQL Starter on Railway

Deploy a React application with PostgreSQL powered by the Bun runtime to Railway.

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/bun-react-postgres?referralCode=Bun&utm_medium=integration&utm_source=template&utm_campaign=bun)

## Local Development

After cloning the repository: 

1. Install dependencies:
```bash
bun install
```

2. Run the development server:
```bash
bun dev
```

## Deployment

### Method 1: Deploy via CLI

Make sure you have the Railway CLI installed:

```bash
bun install -g @railway/cli
```

Log into your Railway account:

```bash
railway login
```

After successfully authenticating, create a new project:

```bash
# Initialize project
bun-react-postgres$ railway init

# Add PostgreSQL database. Make sure to add this first!
bun-react-postgres$ railway add --database postgres

# Add your application service.
bun-react-postgres$ railway add --service bun-react-db --variables DATABASE_URL=\${{Postgres.DATABASE_URL}}
```

After the services have been created and connected, deploy the application to Railway. By default, services are only accessible within Railway's private network. To make your app publicly accessible, you need to generate a public domain.

```bash
# Deploy your application
bun-nextjs-starter$ railway up

# Generate public domain
bun-nextjs-starter$ railway domain
```

## Method 2: Deploy via Dashboard

### Step 1: Create New Project

1. Go to [Railway Dashboard](http://railway.com/?utm_medium=integration&utm_source=docs&utm_campaign=bun)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository

### Step 2: Generate Public Domain

1. Select your service
2. Go to **"Settings"** tab
3. Under **"Networking"**, click **"Generate Domain"**

Your website is now live! Railway auto-deploys on every GitHub push.

---

- [Bun Documentation](https://bun.com/docs)
- [Railway Documentation](https://docs.railway.app)
