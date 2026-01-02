# Backend Setup

## Files to Add

Copy these files from the folders into the following locations:

### Core Files
- `src/main.ts`
- `src/app.module.ts`
- `package.json`
- `tsconfig.json`
- `Dockerfile`
- `.env.example`

### Modules - Exams
- `src/modules/exams/exam.entity.ts`
- `src/modules/exams/assignment.entity.ts`
- `src/modules/exams/exams.service.ts`
- `src/modules/exams/exams.controller.ts`
- `src/modules/exams/exams.gateway.ts`
- `src/modules/exams/exams.module.ts`

### Modules - Radiologists
- `src/modules/radiologists/radiologist.entity.ts`
- `src/modules/radiologists/radiologists.service.ts`
- `src/modules/radiologists/radiologists.controller.ts`
- `src/modules/radiologists/radiologists.module.ts`

### Modules - Locks
- `src/modules/locks/locks.service.ts`
- `src/modules/locks/locks.module.ts`

### Modules - Audit
- `src/modules/audit/audit-log.entity.ts`
- `src/modules/audit/audit.service.ts`
- `src/modules/audit/audit.controller.ts`
- `src/modules/audit/audit.module.ts`

### Modules - HL7
- `src/modules/hl7/hl7.service.ts`
- `src/modules/hl7/hl7.controller.ts`
- `src/modules/hl7/hl7.module.ts`

### Modules - RadWhere
- `src/modules/radwhere/radwhere.gateway.ts`
- `src/modules/radwhere/radwhere.service.ts`
- `src/modules/radwhere/radwhere.controller.ts`
- `src/modules/radwhere/radwhere.module.ts`

## Setup

```bash
npm install
npm run start:dev
```
