# File Mapping Guide

This document maps Claude artifacts to actual file locations in the repository.

## How to Use This Guide

1. Find the artifact name in Claude's conversation
2. Look up the corresponding file path below
3. Copy the artifact content into that file

## Backend Files

| Artifact Name | File Path |
|--------------|-----------|
| backend/src/main.ts | `backend/src/main.ts` |
| backend/src/app.module.ts | `backend/src/app.module.ts` |
| backend/package.json | `backend/package.json` |
| backend/tsconfig.json | `backend/tsconfig.json` |
| Backend Dockerfile | `backend/Dockerfile` |
| backend/.env.example | `backend/.env.example` |

### Exams Module

| Artifact Name | File Path |
|--------------|-----------|
| exam.entity.ts | `backend/src/modules/exams/exam.entity.ts` |
| assignment.entity.ts | `backend/src/modules/exams/assignment.entity.ts` |
| exams.service.ts | `backend/src/modules/exams/exams.service.ts` |
| exams.controller.ts | `backend/src/modules/exams/exams.controller.ts` |
| exams.gateway.ts | `backend/src/modules/exams/exams.gateway.ts` |
| exams.module.ts | `backend/src/modules/exams/exams.module.ts` |

### Radiologists Module

| Artifact Name | File Path |
|--------------|-----------|
| radiologist.entity.ts | `backend/src/modules/radiologists/radiologist.entity.ts` |
| radiologists.service.ts | `backend/src/modules/radiologists/radiologists.service.ts` |
| radiologists.controller.ts | `backend/src/modules/radiologists/radiologists.controller.ts` |
| radiologists.module.ts | `backend/src/modules/radiologists/radiologists.module.ts` |

### Locks Module

| Artifact Name | File Path |
|--------------|-----------|
| locks.service.ts | `backend/src/modules/locks/locks.service.ts` |
| locks.module.ts | `backend/src/modules/locks/locks.module.ts` |

### Audit Module

| Artifact Name | File Path |
|--------------|-----------|
| audit-log.entity.ts | `backend/src/modules/audit/audit-log.entity.ts` |
| audit.service.ts | `backend/src/modules/audit/audit.service.ts` |
| audit.controller.ts | `backend/src/modules/audit/audit.controller.ts` |
| audit.module.ts | `backend/src/modules/audit/audit.module.ts` |

### HL7 Module

| Artifact Name | File Path |
|--------------|-----------|
| hl7.service.ts | `backend/src/modules/hl7/hl7.service.ts` |
| hl7.controller.ts | `backend/src/modules/hl7/hl7.controller.ts` |
| hl7.module.ts | `backend/src/modules/hl7/hl7.module.ts` |

### RadWhere Module

| Artifact Name | File Path |
|--------------|-----------|
| radwhere.gateway.ts | `backend/src/modules/radwhere/radwhere.gateway.ts` |
| radwhere.service.ts | `backend/src/modules/radwhere/radwhere.service.ts` |
| radwhere.controller.ts | `backend/src/modules/radwhere/radwhere.controller.ts` |
| radwhere.module.ts | `backend/src/modules/radwhere/radwhere.module.ts` |

## Frontend Files

| Artifact Name | File Path |
|--------------|-----------|
| Radiology Orchestration System (React prototype) | `frontend/src/App.tsx` |
| Frontend Dockerfile | `frontend/Dockerfile` |

## Desktop Agent Files

| Artifact Name | File Path |
|--------------|-----------|
| RadWhereAgent.cs | `desktop-agent/RadWhereAgentForm.cs` |
| RadiologyOrchestrationAgent.csproj | `desktop-agent/RadiologyOrchestrationAgent.csproj` |
| appsettings.json | `desktop-agent/appsettings.json` |

## Docker Files

| Artifact Name | File Path |
|--------------|-----------|
| docker-compose.yml | `docker/docker-compose.yml` |
| init-db.sql | `docker/init-db.sql` |

## Documentation Files

| Artifact Name | File Path |
|--------------|-----------|
| Complete Setup Guide | `docs/QUICK_START.md` |
| SETUP_CHECKLIST.md | `docs/SETUP_CHECKLIST.md` |
| RADWHERE_INTEGRATION.md | `docs/RADWHERE_INTEGRATION.md` |
| RADWHERE_QUICK_REFERENCE.md | `docs/RADWHERE_QUICK_REFERENCE.md` |

## Scripts

| Artifact Name | File Path |
|--------------|-----------|
| verify-setup.sh | `scripts/verify-setup.sh` |
| verify-setup.bat | `scripts/verify-setup.bat` |

## Next Steps

1. Copy each artifact content to its corresponding file
2. Ensure all files are in the correct directories
3. Run `git status` to see which files are ready
4. Commit and push to GitHub
