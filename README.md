# Sabah Disaster Intelligence Portal — Next.js Starter

Production-oriented starter for SDIP. All visible risk data is simulated and labelled.

## Included
- Next.js App Router + TypeScript
- Real OpenStreetMap base map through Leaflet
- Geographic hazard markers and risk zones
- Responsive command-centre dashboard
- Versioned deterministic risk helper
- Mock risk and weather API routes
- PostgreSQL/PostGIS-ready Prisma schema
- Docker Compose for PostGIS and Redis
- Environment placeholders for MetMalaysia and Qwen

## Run
```bash
cp .env.example .env
npm install
docker compose up -d
npm run db:generate
npm run db:migrate
npm run dev
```
Open http://localhost:3000.

## Important
1. Validate MetMalaysia endpoint contracts and usage rights before implementation.
2. Replace mock arrays with database-backed records.
3. Obtain authoritative Sabah district GeoJSON before displaying official boundaries.
4. Keep official alerts separate from AI-assisted notices.
5. Never expose Qwen or MetMalaysia credentials in `NEXT_PUBLIC_*` variables.
6. OSM public tiles are suitable for development; use an approved tile provider or self-hosted tiles for production traffic.

## Next implementation order
1. Data-source registry and ingestion logs.
2. MetMalaysia adapter with cache, retry and freshness rules.
3. PostGIS event and boundary import.
4. Auditable hazard-specific scoring.
5. Qwen JSON-schema explanation service.
6. Admin verification workflow and audit trail.
