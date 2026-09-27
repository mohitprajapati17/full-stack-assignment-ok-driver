import { AuditLog } from '../../models/index.js';

/**
 * Records an audit entry for the current request. Failures are logged but never
 * surface to the caller, so auditing can't break the action being audited.
 */
export async function recordAudit(req, { action, resourceType, resourceId, details, userId }) {
  try {
    await AuditLog.create({
      userId: userId ?? req.user?.id,
      action,
      resourceType,
      resourceId: resourceId?.toString(),
      details,
      ipAddress: req.ip,
    });
  } catch (err) {
    console.error('[audit] Failed to record audit log:', err.message);
  }
}
