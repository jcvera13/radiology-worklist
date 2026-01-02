"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HL7Service = void 0;
const common_1 = require("@nestjs/common");
const exams_service_1 = require("../exams/exams.service");
const CPT_SUBSPECIALTY_MAP = {
    '71045': { subspecialty: 'Chest', rvu: 0.78 },
    '71046': { subspecialty: 'Chest', rvu: 0.89 },
    '74177': { subspecialty: 'Body', rvu: 2.15 },
    '70450': { subspecialty: 'Neuro', rvu: 1.89 },
    '72148': { subspecialty: 'MSK', rvu: 2.44 },
    '73721': { subspecialty: 'MSK', rvu: 1.67 },
    '74183': { subspecialty: 'Body', rvu: 2.89 },
    '70553': { subspecialty: 'Neuro', rvu: 3.12 },
    '73218': { subspecialty: 'MSK', rvu: 2.21 },
    '71250': { subspecialty: 'Chest', rvu: 2.01 },
};
let HL7Service = class HL7Service {
    constructor(examsService) {
        this.examsService = examsService;
    }
    async parseAndIngest(hl7Message) {
        try {
            const segments = hl7Message.split('\n');
            const msh = segments.find((s) => s.startsWith('MSH'));
            const pid = segments.find((s) => s.startsWith('PID'));
            const obr = segments.find((s) => s.startsWith('OBR'));
            if (!obr) {
                throw new Error('Missing OBR segment');
            }
            const obrFields = obr.split('|');
            const accessionNumber = obrFields[3] || this.generateAccessionNumber();
            const cptCode = obrFields[4]?.split('^')[0] || '71045';
            const priority = this.parsePriority(obrFields[5]);
            const cptInfo = CPT_SUBSPECIALTY_MAP[cptCode] || {
                subspecialty: 'General',
                rvu: 1.0,
            };
            const pidFields = pid?.split('|') || [];
            const patientMRN = pidFields[3] || `MRN${Math.floor(Math.random() * 1000000)}`;
            const patientName = pidFields[5] || 'Unknown Patient';
            const exam = await this.examsService.create({
                accessionNumber,
                cptCode,
                rvuValue: cptInfo.rvu,
                priority,
                subspecialty: cptInfo.subspecialty,
                patientMRN,
                patientName,
                status: 'pending',
            });
            return {
                success: true,
                exam,
                message: 'HL7 message processed successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }
    generateMockHL7Message() {
        const accessionNumber = this.generateAccessionNumber();
        const cptCodes = Object.keys(CPT_SUBSPECIALTY_MAP);
        const cptCode = cptCodes[Math.floor(Math.random() * cptCodes.length)];
        const priorities = ['R', 'S', 'A'];
        const priority = priorities[Math.floor(Math.random() * priorities.length)];
        const mrn = `MRN${Math.floor(Math.random() * 1000000)}`;
        return `MSH|^~\\&|SENDING_APP|SENDING_FAC|RECEIVING_APP|RECEIVING_FAC|20240101120000||ORM^O01|MSG${Date.now()}|P|2.5
PID|||${mrn}||DOE^JOHN||19800101|M
ORC|NW|${accessionNumber}||||${priority}
OBR|||${accessionNumber}|${cptCode}^CHEST XRAY||20240101120000`;
    }
    async generateMockExam() {
        const cptCodes = Object.keys(CPT_SUBSPECIALTY_MAP);
        const cptCode = cptCodes[Math.floor(Math.random() * cptCodes.length)];
        const cptInfo = CPT_SUBSPECIALTY_MAP[cptCode];
        const priorities = ['routine', 'urgent', 'stat'];
        const priority = priorities[Math.floor(Math.random() * priorities.length)];
        const exam = await this.examsService.create({
            accessionNumber: this.generateAccessionNumber(),
            cptCode,
            rvuValue: cptInfo.rvu,
            priority,
            subspecialty: cptInfo.subspecialty,
            patientMRN: `MRN${Math.floor(Math.random() * 1000000)}`,
            patientName: this.generatePatientName(),
            status: 'pending',
        });
        return {
            success: true,
            exam,
        };
    }
    generateAccessionNumber() {
        const prefix = 'ACC';
        const random = Math.random().toString(36).substring(2, 11).toUpperCase();
        return `${prefix}${random}`;
    }
    parsePriority(priorityCode) {
        const map = {
            S: 'stat',
            A: 'urgent',
            R: 'routine',
        };
        return map[priorityCode] || 'routine';
    }
    generatePatientName() {
        const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia'];
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        return `${lastName}^${firstName}`;
    }
};
exports.HL7Service = HL7Service;
exports.HL7Service = HL7Service = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [exams_service_1.ExamsService])
], HL7Service);
//# sourceMappingURL=hl7.service.js.map