import { getUsers, updateUser, deleteUser } from "@/lib/actions/admin"
import { AdminUsersTable } from "./users-client"

export default async function AdminUsersPage() {
  const users = await getUsers()

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <h1 className="text-2xl font-semibold">Gestion des utilisateurs</h1>
      <AdminUsersTable
        initialUsers={users}
        onUpdate={updateUser}
        onDelete={deleteUser}
      />
    </div>
  )
}
