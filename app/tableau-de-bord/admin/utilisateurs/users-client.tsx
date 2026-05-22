"use client"

import { useState } from "react"
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  createColumnHelper,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  IconEdit,
  IconTrash,
} from "@tabler/icons-react"
import type { AdminUser } from "@/lib/actions/admin"

type Role = "admin" | "client" | "technician"

const roleLabels: Record<string, string> = {
  client: "Client",
  technician: "Technicien",
  admin: "Administrateur",
}

const roleColors: Record<string, string> = {
  client: "bg-blue-100 text-blue-800",
  technician: "bg-amber-100 text-amber-800",
  admin: "bg-green-100 text-green-800",
}

function RoleBadge({ role }: { role: string | null }) {
  const color = role ? roleColors[role] : ""
  const label = role ? roleLabels[role] ?? role : "—"
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${color ?? ""}`}>
      {label}
    </span>
  )
}

export function AdminUsersTable({
  initialUsers,
  onUpdate,
  onDelete,
}: {
  initialUsers: AdminUser[]
  onUpdate: (id: string, data: { name?: string; email?: string; role?: Role; phone?: string }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [users, setUsers] = useState(initialUsers)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "client" as Role, phone: "" })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const columnHelper = createColumnHelper<AdminUser>()

  const columns = [
    columnHelper.accessor("name", {
      header: "Nom",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("email", {
      header: "Email",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("role", {
      header: "Rôle",
      cell: (info) => <RoleBadge role={info.getValue()} />,
    }),
    columnHelper.accessor("phone", {
      header: "Téléphone",
      cell: (info) => info.getValue() ?? "—",
    }),
    columnHelper.accessor("createdAt", {
      header: "Inscrit le",
      cell: (info) => new Date(info.getValue()).toLocaleDateString("fr-FR"),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const u = info.row.original
        const isEditing = editingId === u.id
        if (isEditing) {
          return (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleSave(u.id)} disabled={saving}>
                {saving ? "..." : "Ok"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                Annuler
              </Button>
            </div>
          )
        }
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => startEdit(u)}>
              <IconEdit size={14} />
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleDelete(u.id)} disabled={deleting === u.id}>
              <IconTrash size={14} />
            </Button>
          </div>
        )
      },
    }),
  ]

  const table = useReactTable({
    data: users,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  function startEdit(u: AdminUser) {
    setEditingId(u.id)
    setEditForm({
      name: u.name,
      email: u.email,
      role: (u.role as Role) ?? "client",
      phone: u.phone ?? "",
    })
  }

  async function handleSave(id: string) {
    setSaving(true)
    await onUpdate(id, {
      name: editForm.name,
      email: editForm.email,
      role: editForm.role,
      phone: editForm.phone || undefined,
    })
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, name: editForm.name, email: editForm.email, role: editForm.role, phone: editForm.phone || null }
          : u
      )
    )
    setEditingId(null)
    setSaving(false)
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    try {
      await onDelete(id)
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch {
      /* error handled by the action */
    }
    setDeleting(null)
  }

  const filteredRole = columnFilters.find((f) => f.id === "role")?.value as string | undefined

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Rechercher un utilisateur..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-xs"
        />
        <select
          value={filteredRole ?? ""}
          onChange={(e) =>
            setColumnFilters(e.target.value ? [{ id: "role", value: e.target.value }] : [])
          }
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Tous les rôles</option>
          <option value="client">Clients</option>
          <option value="technician">Techniciens</option>
          <option value="admin">Administrateurs</option>
        </select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => {
                const isEditing = editingId === row.original.id
                return (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => {
                      if (cell.column.id === "name" && isEditing) {
                        return (
                          <TableCell key={cell.id}>
                            <Input
                              value={editForm.name}
                              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                              className="h-8"
                            />
                          </TableCell>
                        )
                      }
                      if (cell.column.id === "email" && isEditing) {
                        return (
                          <TableCell key={cell.id}>
                            <Input
                              value={editForm.email}
                              onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                              className="h-8"
                            />
                          </TableCell>
                        )
                      }
                      if (cell.column.id === "role" && isEditing) {
                        return (
                          <TableCell key={cell.id}>
                            <select
                              value={editForm.role}
                              onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value as Role }))}
                              className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                            >
                              <option value="client">Client</option>
                              <option value="technician">Technicien</option>
                              <option value="admin">Administrateur</option>
                            </select>
                          </TableCell>
                        )
                      }
                      if (cell.column.id === "phone" && isEditing) {
                        return (
                          <TableCell key={cell.id}>
                            <Input
                              value={editForm.phone}
                              onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                              className="h-8"
                            />
                          </TableCell>
                        )
                      }
                      return (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  Aucun utilisateur trouvé
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
