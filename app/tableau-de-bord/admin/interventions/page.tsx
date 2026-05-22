import { AdminInterventionsView } from "./interventions-client"

export default function AdminInterventionsPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-semibold">Suivi des interventions</h1>
      <AdminInterventionsView />
    </div>
  )
}
