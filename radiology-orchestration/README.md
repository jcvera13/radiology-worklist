# 🏥 Radiology Orchestration System

A comprehensive radiology workflow orchestration system with RVU-based load balancing and PowerScribe One integration.

## Features

- ✅ **RVU-Based Auto-Assignment** - Fair workload distribution using RVU values
- ✅ **Real-Time Lock Management** - Sub-500ms lock propagation across all clients
- ✅ **PowerScribe One Integration** - Seamless RadWhere ActiveX integration
- ✅ **Full Audit Trail** - Complete logging of all actions and decisions
- ✅ **HL7 Integration** - ORM/ORU message parsing and exam ingestion
- ✅ **Multi-User Support** - Concurrent radiologist workflows with conflict prevention
- ✅ **WebSocket Real-Time Updates** - Instant synchronization across all connected clients

## Architecture

- **Frontend**: React + TypeScript + TailwindCSS + Socket.IO
- **Backend**: NestJS + TypeScript + PostgreSQL + Redis
- **Desktop Agent**: C# .NET Windows Forms + RadWhere ActiveX
- **Infrastructure**: Docker + Docker Compose

## Quick Start

### Prerequisites

- Docker Desktop
- Node.js 18+
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/radiology-orchestration.git
cd radiology-orchestration

# Start all services
cd docker
docker-compose up -d

# Access application
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
```

### Desktop Agent (Windows only)

1. Open `desktop-agent/RadiologyOrchestrationAgent.sln` in Visual Studio 2022
2. Build solution
3. Run application
4. System tray icon indicates connection status

## Documentation

- [📖 Complete Setup Guide](docs/QUICK_START.md)
- [🔌 RadWhere Integration Guide](docs/RADWHERE_INTEGRATION.md)
- [📋 Setup Verification Checklist](docs/SETUP_CHECKLIST.md)
- [🔧 Quick Reference](docs/RADWHERE_QUICK_REFERENCE.md)

## Project Structure

```
radiology-orchestration/
├── backend/              # NestJS backend API
├── frontend/            # React frontend
├── desktop-agent/       # C# Windows desktop agent
├── docker/              # Docker configuration
├── scripts/             # Utility scripts
└── docs/                # Documentation
```

## Testing

```bash
# Run verification script
./scripts/verify-setup.sh

# Check API health
curl http://localhost:3001/api/radiologists

# View logs
docker-compose logs -f backend
```

## Security

- OAuth2/SAML authentication ready
- Encryption at rest and in transit
- HIPAA-compliant audit logging
- Minimum PHI exposure
- Role-based access control

## Contributing

This is a healthcare system for internal use. Please contact IT department for access.

## License

Proprietary - Healthcare System Internal Use Only

## Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Review documentation in `docs/`
- Run verification: `./scripts/verify-setup.sh`
