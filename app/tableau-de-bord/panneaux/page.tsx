import { getPanels } from "@/lib/actions/panel"
import { PanelList } from "./panel-list"
import { CreatePanelForm } from "./create-form"

export default async function PanneauxPage() {
  const panels = await getPanels()

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Mes panneaux</h1>
        <p className="text-muted-foreground">Gérez vos panneaux solaires</p>
      </div>

      <CreatePanelForm />

      <PanelList panels={panels} />
    </div>
  )
}
