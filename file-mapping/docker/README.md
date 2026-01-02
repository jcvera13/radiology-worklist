# Docker Setup

## Files to Add

Copy these files from the artifacts:

- `docker-compose.yml` - Orchestrates all services
- `init-db.sql` - Database schema and seed data

## Usage

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Clean restart
docker-compose down -v
docker-compose up -d
```

## Services

- **postgres**: PostgreSQL database (port 5432)
- **redis**: Redis cache (port 6379)
- **backend**: NestJS API (port 3001)
- **frontend**: React app (port 3000)
