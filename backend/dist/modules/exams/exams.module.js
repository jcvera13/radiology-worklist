"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const exams_controller_1 = require("./exams.controller");
const exams_service_1 = require("./exams.service");
const exams_gateway_1 = require("./exams.gateway");
const exam_entity_1 = require("./exam.entity");
const assignment_entity_1 = require("./assignment.entity");
const radiologist_entity_1 = require("../radiologists/radiologist.entity");
const locks_module_1 = require("../locks/locks.module");
const audit_module_1 = require("../audit/audit.module");
let ExamsModule = class ExamsModule {
};
exports.ExamsModule = ExamsModule;
exports.ExamsModule = ExamsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([exam_entity_1.Exam, assignment_entity_1.Assignment, radiologist_entity_1.Radiologist]),
            locks_module_1.LocksModule,
            audit_module_1.AuditModule,
        ],
        controllers: [exams_controller_1.ExamsController],
        providers: [exams_service_1.ExamsService, exams_gateway_1.ExamsGateway],
        exports: [exams_service_1.ExamsService],
    })
], ExamsModule);
//# sourceMappingURL=exams.module.js.map