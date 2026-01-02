"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RadWhereModule = void 0;
const common_1 = require("@nestjs/common");
const radwhere_gateway_1 = require("./radwhere.gateway");
const radwhere_service_1 = require("./radwhere.service");
const radwhere_controller_1 = require("./radwhere.controller");
const exams_module_1 = require("../exams/exams.module");
const locks_module_1 = require("../locks/locks.module");
const audit_module_1 = require("../audit/audit.module");
let RadWhereModule = class RadWhereModule {
};
exports.RadWhereModule = RadWhereModule;
exports.RadWhereModule = RadWhereModule = __decorate([
    (0, common_1.Module)({
        imports: [exams_module_1.ExamsModule, locks_module_1.LocksModule, audit_module_1.AuditModule],
        providers: [radwhere_gateway_1.RadWhereGateway, radwhere_service_1.RadWhereService],
        controllers: [radwhere_controller_1.RadWhereController],
        exports: [radwhere_service_1.RadWhereService],
    })
], RadWhereModule);
//# sourceMappingURL=radwhere.module.js.map