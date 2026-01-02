"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const exams_module_1 = require("./modules/exams/exams.module");
const radiologists_module_1 = require("./modules/radiologists/radiologists.module");
const locks_module_1 = require("./modules/locks/locks.module");
const audit_module_1 = require("./modules/audit/audit.module");
const hl7_module_1 = require("./modules/hl7/hl7.module");
const radwhere_module_1 = require("./modules/radwhere/radwhere.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DATABASE_HOST || 'localhost',
                port: parseInt(process.env.DATABASE_PORT) || 5432,
                username: process.env.DATABASE_USER || 'postgres',
                password: process.env.DATABASE_PASSWORD || 'postgres',
                database: process.env.DATABASE_NAME || 'radiology_db',
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                synchronize: false,
                logging: process.env.NODE_ENV === 'development',
            }),
            exams_module_1.ExamsModule,
            radiologists_module_1.RadiologistsModule,
            locks_module_1.LocksModule,
            audit_module_1.AuditModule,
            hl7_module_1.HL7Module,
            radwhere_module_1.RadWhereModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map