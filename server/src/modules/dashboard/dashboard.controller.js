import { USER_ROLES } from '../../constants/enums.js';
import * as dashboardService from './dashboard.service.js';

export async function getSummary(req, res) {
  res.json({ data: await dashboardService.getSummary(req.validated.query) });
}

export async function listActiveAlerts(req, res) {
  res.json({ data: await dashboardService.listActiveAlerts(req.validated.query) });
}

export async function listRecentDetections(req, res) {
  res.json({ data: await dashboardService.listRecentDetections(req.validated.query) });
}

// Sign-in events (including failed attempts with the submitted email) are admin-only.
export async function listRecentActivity(req, res) {
  const data = await dashboardService.listRecentActivity({
    ...req.validated.query,
    includeAuthEvents: req.user.role === USER_ROLES.ADMIN,
  });
  res.json({ data });
}
