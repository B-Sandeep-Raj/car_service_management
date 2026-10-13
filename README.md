# Car Service Management and Analysis

A local car workshop management dashboard built with React, Vite, Express, TypeScript, MongoDB, and Chart.js. The application covers seven operational modules and uses MongoDB aggregation pipelines for its analytics dashboard.

## Prerequisites

- Windows 10/11
- Node.js 20 LTS or newer and npm
- MongoDB Community Server 6.0 or newer running locally, or a reachable MongoDB deployment
- A terminal opened in the project folder

MongoDB must be running before the backend starts. The application will use its embedded Mingo-backed demo engine only when MongoDB cannot be reached; use the `db-status` endpoint to confirm that real MongoDB is being used.

## Install and configure

```powershell
cd "C:\Users\sandeep\Downloads\car-service-management-and-analysis-using-mongodb (1)"
npm install
Copy-Item .env.example .env
```

Edit `.env` as needed:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/car_service_db
MONGODB_DB_NAME=car_service_db
PORT=3000
```

For a MongoDB service installed by the Windows installer:

```powershell
Get-Service MongoDB
Start-Service MongoDB
```

If MongoDB is installed as a manually managed process, start `mongod.exe` with its configured data directory instead.

## Seed realistic demo data safely

The seed command is idempotent. It upserts the known demo IDs and never duplicates existing records or overwrites records that already use those IDs:

```powershell
npm run seed
```

To deliberately replace the seven demo collections with the bundled demo dataset:

```powershell
npm run seed:force
```

The force command deletes only the seven application collections (`Customers`, `Cars`, `Services`, `Mechanics`, `SpareParts`, `Bills`, and `ServiceHistory`). Do not use it against a database containing data you need to keep.

## Run the application

For development, Vite serves the React frontend and mounts the same Express API middleware, so use one terminal:

```powershell
cd "C:\Users\sandeep\Downloads\car-service-management-and-analysis-using-mongodb (1)"
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser. The Vite development server mounts the `/api` routes directly. For a production-style local run, build first and then start the backend:

```powershell
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) after the production-style start. Do not run `npm run dev` and `npm run start` simultaneously on the same port.

## Modules

1. Dashboard and MongoDB aggregation inspector
2. Customers and vehicles
3. Service booking and status workflow
4. Service history and predictive maintenance
5. Mechanics
6. Spare-parts inventory
7. Billing and payments

## Folder structure

```text
src/
  App.tsx                         Application shell and data loading
  components/                     Seven modules and shared dashboard UI
  services/apiClient.ts           Typed browser-to-API client
  types/index.ts                  Shared domain types
server.ts                         Express entry point and static hosting
server/
  api.ts                          REST routes
  db.ts                           MongoDB connection, seed data, and safe fallback
  aggregations.ts                 Nine MongoDB aggregation definitions
  healthScore.ts                  Predictive health and service alerts
scripts/seed.ts                   Idempotent demo-data seed command
.env.example                      Local environment template
```

## API endpoints

All endpoints are relative to `http://localhost:3000/api`.

| Area | Endpoints |
|---|---|
| Health/data status | `GET /db-status`, `POST /db-reset` |
| Customers | `GET/POST /customers`, `PUT/DELETE /customers/:id` |
| Cars | `GET/POST /cars`, `PUT/DELETE /cars/:id` |
| Services | `GET/POST /services`, `PUT/DELETE /services/:id`, `PATCH /services/:id/status` |
| Mechanics | `GET/POST /mechanics`, `PUT/DELETE /mechanics/:id` |
| Inventory | `GET/POST /spare-parts`, `PUT/DELETE /spare-parts/:id`, `PATCH /spare-parts/:id/stock` |
| Billing | `GET/POST /bills`, `PATCH /bills/:id/pay`, `DELETE /bills/:id` |
| History/predictions | `GET /service-history`, `POST /service-history`, `GET /predictions/all`, `GET /predictions/car/:carId` |
| Analytics | `GET /analytics/aggregations`, `POST /analytics/custom-pipeline` |

Useful query filters include `search`, `tier`, `customerId`, `brand`, `status`, `priority`, `carId`, `category`, `lowStock=true`, and `paymentStatus`.

## Analytics

The dashboard requests nine server-side aggregation pipelines. They include completed-service revenue, frequently serviced brands, service categories, monthly billing, average cost, parts demand, mechanic performance, customer frequency, and service status. When native MongoDB is connected, `server/db.ts` executes these pipelines with MongoDB's `aggregate()` API. The Mingo engine is only a local compatibility fallback when MongoDB is unavailable.

## Verification and tests

Run static validation and the production build:

```powershell
npm run lint
npm run build
```

Verify the live backend and native MongoDB connection:

```powershell
Invoke-RestMethod http://127.0.0.1:3000/api/db-status | ConvertTo-Json -Depth 5
Invoke-RestMethod http://127.0.0.1:3000/api/analytics/aggregations | ConvertTo-Json -Depth 6
```

The status response should report `"connected": true` and `"engine": "Native MongoDB Server"`. The analytics response should contain nine pipeline records with non-empty `data` arrays after seeding.

## Troubleshooting

- **`ECONNREFUSED 127.0.0.1:27017`:** Start the MongoDB Windows service, check `MONGODB_URI`, and run `npm run seed` again.
- **Status reports the embedded engine:** The API is still usable for local UI work, but it is not using MongoDB. Fix MongoDB availability before validating persistence or MongoDB aggregation behavior.
- **Port 3000 is busy:** Set another `PORT` in `.env` for the backend and change the Vite `--port` value in `package.json`, or stop the process using port 3000.
- **Frontend shows stale/empty cards:** Confirm the backend is running at the same port, refresh the browser, and inspect `/api/db-status` and `/api/analytics/aggregations`.
- **Seed appears to do nothing:** That is expected when all known demo IDs already exist. Use `npm run seed:force` only when replacing the demo dataset is intentional.
- **`npm install` peer-dependency errors:** Remove `node_modules` and `package-lock.json` only if they were generated from a failed install, then rerun `npm install`. The manifest pins an esbuild version compatible with Vite 8.
