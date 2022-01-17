import { AllowedOrigins } from "./allowedOrigins";
import { Authorization } from "./authorization";
import { Settings } from "./settings";


export const getConnectionStrings = Settings.connectionStrings
export const getAllowedOrigins = Settings.allowedOrigins
export const allowedOrigins = new AllowedOrigins();
export const authorizationService = new Authorization();