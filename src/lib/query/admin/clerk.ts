import { profile, clerkUserSchema, clerkUsers } from "@/src/zod";
import type { Account, Profile, Accounts } from "@/src/type";
import { getRole } from "@/src/lib/query/profile";

export async function searchAccounts(input: {
  query: string;
  applicateBy: string;
}): Promise<Accounts | null> {
  const applicated = await getRole({ userId: input.applicateBy });
  if (!applicated || applicated.isManagement()) {
    return null;
  }

  // Build Clerk API URL with query parameters.
  const url = new URL("https://api.clerk.com/v1/users");
  url.searchParams.append("offset", "0");
  url.searchParams.append("order_by", "created_at");
  url.searchParams.append("query", input.query);

  // Construct headers with secret key from environment.
  const headers = {
    Authorization: `Bearer ${import.meta.env.CLERK_SECRET_KEY}`,
  };

  // Execute the GET request.
  const response = await fetch(url.toString(), {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch accounts. Status: " + response.status);
  }

  const users = clerkUsers.parse(await response.json());
  return users;
}

// list user
export async function listUser(): Promise<Accounts> {
  // Build Clerk API URL with query parameters.
  const url = new URL("https://api.clerk.com/v1/users");

  // Construct headers with secret key from environment.
  const headers = {
    Authorization: `Bearer ${import.meta.env.CLERK_SECRET_KEY}`,
  };

  // Execute the GET request.
  const response = await fetch(url.toString(), {
    method: "GET",
    headers,
  });

  // responseをclerkUsersにパースして返す
  return clerkUsers.parse(await response.json());
}

export async function getUser(userId: string): Promise<Account | null> {
  // Build Clerk API URL with query parameters.
  const url = new URL(`https://api.clerk.com/v1/users/${userId}`);

  // Construct headers with secret key from environment.
  const headers = {
    Authorization: `Bearer ${import.meta.env.CLERK_SECRET_KEY}`,
  };

  // Execute the GET request.
  const response = await fetch(url.toString(), {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user. Status: " + response.status);
  }

  const user = clerkUserSchema.parse(await response.json());
  return user;
}
