export interface User {
  id: string;
  username: string;
  password: string;
  role: "admin" | "user";
}

// In-memory store — replace with DB later
const users = new Map<string, User>();

function seed() {
  const entries: Omit<User, "id">[] = [
    {
      username: process.env.ADMIN_USER!,
      password: process.env.ADMIN_PASS!,
      role: "admin",
    },
    {
      username: process.env.TEST_USER!,
      password: process.env.TEST_PASS!,
      role: "user",
    },
  ];

  entries.forEach((u, i) => {
    const id = String(i + 1);
    users.set(id, { id, ...u });
  });
}

seed();

let nextId = users.size + 1;

export function getUsers(): User[] {
  return Array.from(users.values());
}

export function getUserByUsername(username: string): User | undefined {
  return Array.from(users.values()).find((u) => u.username === username);
}

export function createUser(data: Omit<User, "id">): User {
  const id = String(nextId++);
  const user: User = { id, ...data };
  users.set(id, user);
  return user;
}

export function updateUser(id: string, data: Partial<Omit<User, "id">>): User | null {
  const user = users.get(id);
  if (!user) return null;
  const updated = { ...user, ...data };
  users.set(id, updated);
  return updated;
}

export function deleteUser(id: string): boolean {
  return users.delete(id);
}
