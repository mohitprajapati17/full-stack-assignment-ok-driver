import { AUDIT_ACTIONS, AUDIT_RESOURCE_TYPES } from '../../constants/enums.js';
import { recordAudit } from '../audit-logs/auditLog.service.js';
import * as authService from './auth.service.js';

export async function login(req, res) {
  const { email } = req.validated.body;

  try {
    const result = await authService.login(req.validated.body);
    await recordAudit(req, {
      userId: result.user.id,
      action: AUDIT_ACTIONS.LOGIN,
      resourceType: AUDIT_RESOURCE_TYPES.AUTH,
      resourceId: result.user.id,
    });
    res.json({ data: result });
  } catch (err) {
    if (err.statusCode === 401) {
      await recordAudit(req, {
        action: AUDIT_ACTIONS.LOGIN_FAILED,
        resourceType: AUDIT_RESOURCE_TYPES.AUTH,
        details: { email },
      });
    }
    throw err;
  }
}

export async function me(req, res) {
  res.json({ data: await authService.getUserById(req.user.id) });
}
