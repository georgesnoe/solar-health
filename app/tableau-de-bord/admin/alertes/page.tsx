import { AdminAlertsView } from "./alerts-client"

export default function AdminAlertsPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-semibold">Suivi des alertes</h1>
      <AdminAlertsView />
    </div>
  )
}
