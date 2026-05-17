import { Role } from 'share';

export function isAdminRole(roleValue: unknown): boolean {
  const role = Role.fromString(`${roleValue}`);
  return role ? role.isManagement() : false;
}
