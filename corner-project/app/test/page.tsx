// app/test/page.tsx

import prisma from "@/lib/prisma";

export default async function TestPage() {
  const users = await prisma.user.findMany();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Test - Users</h1>

      <ul className="space-y-2">
        {users.map((user) => (
          <li key={user.id} className="p-4 bg-gray-100 rounded">
            <div className="font-bold">{user.username}</div>
            <div className="text-gray-600">{user.email}</div>
            <div className="text-sm text-gray-500">{user.role}</div>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-green-600 font-bold">
        ✅ Total users: {users.length}
      </p>
    </div>
  );
}
