"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RadiologistsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const radiologists_controller_1 = require("./radiologists.controller");
const radiologists_service_1 = require("./radiologists.service");
const radiologist_entity_1 = require("./radiologist.entity");
const exam_entity_1 = require("../exams/exam.entity");
const locks_module_1 = require("../locks/locks.module");
let RadiologistsModule = class RadiologistsModule {
};
exports.RadiologistsModule = RadiologistsModule;
exports.RadiologistsModule = RadiologistsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([radiologist_entity_1.Radiologist, exam_entity_1.Exam]),
            locks_module_1.LocksModule,
        ],
        controllers: [radiologists_controller_1.RadiologistsController],
        providers: [radiologists_service_1.RadiologistsService],
        exports: [radiologists_service_1.RadiologistsService],
    })
], RadiologistsModule);
//# sourceMappingURL=radiologists.module.js.map