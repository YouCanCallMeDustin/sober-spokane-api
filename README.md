# Sober Spokane Local Event Scraper API

A Node.js Express API to serve sobriety-related events for the Sober Spokane website. Connects to MongoDB Atlas (free tier).

## Folder Structure

```
api/
  index.js         # Main Express server
.env.example       # Example environment variables
package.json       # Project dependencies and scripts
README.md          # Project documentation
```

## Setup Instructions

1. **Clone the repository**
2. **Install dependencies**
   ```
   npm install
   ```
3. **Set up environment variables**
   - Copy `.env.example` to `.env` and fill in your MongoDB Atlas URI and desired port.
4. **Start the server**
   ```
   npm start
   ```
   Or for development with auto-reload:
   ```
   npm run dev
   ```
5. **Access the API**
   - Visit [http://localhost:3000/events](http://localhost:3000/events) to see a sample event.

## Environment Variables

- `MONGODB_URI` - Your MongoDB Atlas connection string
- `PORT` - Port for the Express server (default: 3000)

## Ethical Scraping Reminders

- Always check the terms of service of any website you scrape.
- Limit the frequency of your requests to avoid overloading target sites.
- Respect robots.txt and other site policies.
- Use scraped data responsibly and for non-commercial, community-focused purposes.

## Deployment: Render (Free Tier)

You can deploy this API for free using [Render](https://render.com/). Render will use the included `render.yaml` for configuration.

1. **Push your code to GitHub.**
2. **Create a new Web Service on Render:**
   - Click "New Web Service" and connect your GitHub repo.
   - Render will auto-detect the `render.yaml` file and configure your service.
   - Set the environment variable `MONGODB_URI` in the Render dashboard (get this from your MongoDB Atlas account).
3. **Deploy the service.**
   - Render will install dependencies and start the server using `node api/index.js`.
   - The API will be available at your Render URL (e.g., `https://sober-spokane-api.onrender.com`).
4. **Health Check:**
   - Render will check the `/health` endpoint to verify the service is running.
5. **API Endpoints:**
   - `/events` — Get all events
   - `/scrape` — Scrape and update events (use sparingly)
   - `/health` — Health check for Render

### Example `render.yaml`
```yaml
# render.yaml - Render configuration for Sober Spokane API (free tier)
services:
  - type: web
    name: sober-spokane-api
    env: node
    plan: free
    region: oregon
    buildCommand: 'npm install'
    startCommand: 'node api/index.js'
    envVars:
      - key: MONGODB_URI
        sync: false  # Set this in the Render dashboard for security
    autoDeploy: true
    healthCheckPath: /health
```

### Troubleshooting & Error Handling
- If deployment fails due to missing environment variables, check that `MONGODB_URI` is set in the Render dashboard.
- If MongoDB connection fails, verify your Atlas IP whitelist and connection string.
- Check Render logs for errors (e.g., port in use, missing dependencies).
- The API will exit with an error if required environment variables are missing or if MongoDB cannot connect.

## Notes
- All tools and dependencies are free and open source.
- The `/events` endpoint currently returns a sample event. Extend as needed. 