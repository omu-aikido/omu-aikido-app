import type { RoleType } from "./type";

export class Role {
    constructor(
        public role: RoleType,
        public roleJa: string,
        public roleEn: string
    ) {}

    static readonly ADMIN = new Role("admin", "管理者", "Admin");
    static readonly CAPTAIN = new Role("captain", "主将", "Captain");
    static readonly VICE_CAPTAIN = new Role(
        "vice-captain",
        "副主将",
        "Vice Captain"
    );
    static readonly TREASURER = new Role("treasurer", "会計", "Treasurer");
    static readonly MEMBER = new Role("member", "部員", "Member");

    static readonly ALL = [
        Role.ADMIN,
        Role.CAPTAIN,
        Role.VICE_CAPTAIN,
        Role.TREASURER,
        Role.MEMBER,
    ];

    static fromString(role: string): Role | null {
        switch (role) {
            case "admin":
                return Role.ADMIN;
            case "captain":
                return Role.CAPTAIN;
            case "vice-captain":
                return Role.VICE_CAPTAIN;
            case "treasurer":
                return Role.TREASURER;
            case "member":
                return Role.MEMBER;
            default:
                return null;
        }
    }

    toString(): string {
        return this.role;
    }

    isManagement(): boolean {
        return (
            this.role === "admin" ||
            this.role === "captain" ||
            this.role === "vice-captain"
        );
    }
}
