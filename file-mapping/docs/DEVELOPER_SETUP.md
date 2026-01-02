# Developer Setup Guide

## For New Developers Cloning This Repository

### Prerequisites

Install these before starting:

1. **Docker Desktop** - https://www.docker.com/products/docker-desktop/
2. **Node.js 18+** - https://nodejs.org/
3. **Git** - https://git-scm.com/
4. **Visual Studio 2022** (for desktop agent) - https://visualstudio.microsoft.com/

### Step 1: Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/radiology-worklist.git
cd radiology-worklist
```

### Step 2: Copy Artifact Files

**Important:** The repository structure is created, but you need to copy the actual code from Claude's artifacts.


1. Use read in file mapping folders to map files to specified locations. 
2. Copy folder content into the corresponding file

**Automated Option:**
If all artifacts are saved locally, run:
```bash
./scripts/populate-files.sh /path/to/artifacts/folder
```

### Step 3: Start Development Environment

```bash
# Start all services
cd docker
docker-compose up -d

# Wait 30 seconds for services to start

# Verify everything is running
../scripts/verify-setup.sh
```

### Step 4: Access Applications

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **PostgreSQL**: localhost:5432 (postgres/postgres)
- **Redis**: localhost:6379

### Step 5: Desktop Agent (Optional)

If you need PowerScribe integration:

1. Open `desktop-agent/RadiologyOrchestrationAgent.sln` in Visual Studio
2. Restore NuGet packages
3. Build solution (Ctrl+Shift+B)
4. Run (F5)

## Development Workflow

### Backend Development

```bash
cd backend

# Install dependencies
npm install

# Run in watch mode
npm run start:dev

# Run tests
npm test
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm start

# Build for production
npm run build
```

### Database Changes

```bash
# Create migration
cd backend
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

## Common Tasks

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres
```

### Reset Database

```bash
docker-compose down -v
docker-compose up -d
```

### Run Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test

# Verification script
./scripts/verify-setup.sh
```

## Troubleshooting

### Ports Already in Use

```bash
# Check what's using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Docker Issues

```bash
# Remove all containers and volumes
docker-compose down -v

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
```

### Backend Won't Start

```bash
# Clear node_modules
cd backend
rm -rf node_modules package-lock.json
npm install
npm run start:dev
```

## Project Structure

```
radiology-orchestration/
├── backend/              # NestJS API
│   ├── src/
│   │   ├── modules/     # Feature modules
│   │   ├── main.ts      # Entry point
│   │   └── app.module.ts
│   ├── Dockerfile
│   └── package.json
│
├── frontend/            # React app
│   ├── src/
│   │   └── App.tsx
│   ├── Dockerfile
│   └── package.json
│
├── desktop-agent/       # C# Windows app
│   ├── RadWhereAgentForm.cs
│   └── *.csproj
│
├── docker/              # Docker config
│   ├── docker-compose.yml
│   └── init-db.sql
│
├── scripts/             # Utility scripts
│   ├── verify-setup.sh
│   └── populate-files.sh
│
└── docs/                # Documentation
    ├── QUICK_START.md
    ├── FILE_MAPPING.md
    └── this file
```

## Getting Help

1. Check logs: `docker-compose logs -f`
2. Run verification: `./scripts/verify-setup.sh`
3. Review documentation in `docs/`
4. Check GitHub issues

## Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes
3. Test locally
4. Commit: `git commit -am "Description"`
5. Push: `git push origin feature/my-feature`
6. Create Pull Request

## Security Notes

- Never commit `.env` files
- Use environment variables for secrets
- Keep dependencies updated
- Review audit logs regularly
- Follow HIPAA guidelines
