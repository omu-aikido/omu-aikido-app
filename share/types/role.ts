import { ArkErrors, type } from 'arktype';

export class Role {
  constructor(
    public role: string,
    public ja: string
  ) {}

  static readonly ADMIN = new Role('admin', '管理者');
  static readonly CAPTAIN = new Role('captain', '主将');
  static readonly VICE_CAPTAIN = new Role('vice-captain', '副主将');
  static readonly TREASURER = new Role('treasurer', '会計');
  static readonly MEMBER = new Role('member', '部員');

  static readonly ALL = [Role.ADMIN, Role.CAPTAIN, Role.VICE_CAPTAIN, Role.TREASURER, Role.MEMBER];

  static readonly roleEnum = type("'admin'|'captain'|'vice-captain'|'treasurer'|'member'");

  static parse(data: unknown): Role | undefined {
    const out = this.roleEnum(data);
    if (out instanceof ArkErrors) {
      return undefined;
    }
    const role = this.fromString(out);
    return role ?? undefined;
  }

  static fromString(role: string): Role | null {
    switch (role) {
      case 'admin':
        return Role.ADMIN;
      case 'captain':
        return Role.CAPTAIN;
      case 'vice-captain':
        return Role.VICE_CAPTAIN;
      case 'treasurer':
        return Role.TREASURER;
      case 'member':
        return Role.MEMBER;
      default:
        return null;
    }
  }

  toString(): string {
    return this.role;
  }

  isManagement(): boolean {
    return this !== Role.MEMBER;
  }

  static get type() {
    return this.roleEnum;
  }

  static compare(a: string, b: string): number {
    const roleA = Role.fromString(a) ?? Role.MEMBER;
    const roleB = Role.fromString(b) ?? Role.MEMBER;
    return Role.ALL.indexOf(roleA) - Role.ALL.indexOf(roleB);
  }
}
