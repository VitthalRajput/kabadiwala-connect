// utils/auditLogger.js
import { Audit } from "../models/audit.model.js";

export const auditLogger = async (data) => {
    try {
        const audit = await Audit.create({
            userId: data.userId,
            userRole: data.userRole || "system",
            action: data.action,
            resourceType: data.resourceType,
            resourceId: data.resourceId,
            changes: data.changes || {},
            status: data.status || "success",
            errorMessage: data.errorMessage || "",
            metadata: {
                ipAddress: data.ipAddress || "",
                userAgent: data.userAgent || "",
                ...data.metadata,
            },
            timestamp: new Date(),
        });
        return audit;
    } catch (error) {
        console.error("❌ Audit logging failed:", error);
        return null;
    }
};