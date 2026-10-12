"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvSchema = void 0;
exports.validateEnv = validateEnv;
var zod_1 = require("zod");
exports.EnvSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    PORT: zod_1.z.coerce.number().default(4000),
    SERVICE_NAME: zod_1.z.string().default('template-service'),
    SERVICE_VERSION: zod_1.z.string().default('0.1.0'),
    CORS_ORIGIN: zod_1.z.string().default('*'),
});
function validateEnv(env) {
    var result = exports.EnvSchema.safeParse(env);
    if (!result.success) {
        var formattedErrors = JSON.stringify(result.error.format(), null, 2);
        throw new Error("Invalid environment configuration:\n".concat(formattedErrors));
    }
    return result.data;
}
