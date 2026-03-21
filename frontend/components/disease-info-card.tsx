import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type DiseaseInfoCardProps = {
  disease: string
  probability: number
  description: string
  precautions: string[]
}

const capitalizeFirst = (text: string) => {
  const trimmed = text.trim()
  if (!trimmed) {
    return ""
  }
  return `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}`
}

export function DiseaseInfoCard({ disease, probability, description, precautions }: DiseaseInfoCardProps) {
  const cleanPrecautions = precautions
    .map((item) => item?.trim() ?? "")
    .filter((item) => item.length > 0)
    .slice(0, 4)

  const probabilityBadgeClass = probability > 40
    ? "bg-green-100 text-green-700"
    : probability > 20
      ? "bg-amber-100 text-amber-700"
      : "bg-slate-100 text-slate-600"

  return (
    <Card className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-none dark:border-border dark:bg-(--bg-card)">
      <CardContent className="p-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium tracking-wide text-slate-500 uppercase">About This Diagnosis</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-slate-900 dark:text-(--text-1)">{disease}</p>
            <Badge className={probabilityBadgeClass}>{probability.toFixed(2)}%</Badge>
          </div>
        </div>

        <div className="my-3 border-t border-slate-100" />

        <section>
          <h4 className="mb-2 text-sm font-semibold text-slate-700 dark:text-(--text-2)">What is {disease}?</h4>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-(--text-2)">{description}</p>
        </section>

        <div className="my-3 border-t border-slate-100" />

        <section>
          <h4 className="mb-3 text-sm font-semibold text-slate-700 dark:text-(--text-2)">Recommended Precautions</h4>
          <div>
            {cleanPrecautions.map((item, index) => (
              <div key={`${item}-${index}`} className="mb-2 flex items-start gap-2">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                  {index + 1}
                </div>
                <p className="text-sm text-slate-600 dark:text-(--text-2)">{capitalizeFirst(item)}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-3 border-t border-slate-100 pt-3 text-center text-xs italic text-slate-400">
          Source: clinical dataset · For educational reference only · Always consult a qualified medical professional
        </div>
      </CardContent>
    </Card>
  )
}
