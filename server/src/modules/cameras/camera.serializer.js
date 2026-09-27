import { USER_ROLES } from '../../constants/enums.js';

/** Replaces `user:password@` in a URL with `***@` so credentials aren't exposed. */
export function redactUrlCredentials(url) {
  return url?.replace(/^([a-z][a-z0-9+.-]*:\/\/)[^/@\s]+@/i, '$1***@');
}

/** Stream URLs often embed device credentials, which only admins may see. */
export function serializeCamera(camera, viewer) {
  const json = camera.toJSON();
  if (viewer?.role !== USER_ROLES.ADMIN) {
    json.streamUrl = redactUrlCredentials(json.streamUrl);
  }
  return json;
}
