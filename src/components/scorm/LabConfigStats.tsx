import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { getAllSubmissions } from '@/services/activity_submissions'
import { useRealtime } from '@/hooks/use-realtime'
import type { RecordModel } from 'pocketbase'
import { Activity, CheckCircle, Clock } from 'lucide-react'

export function LabConfigStats({ activities }: { activities: RecordModel[] }) {
  const [submissions, setSubmissions] = useState<RecordModel[]>([])

  const loadStats = async () => {
    try {
      setSubmissions(await getAllSubmissions())
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])
  useRealtime('activity_submissions', loadStats)

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activities.map((act) => {
          const actSubs = submissions.filter((s) => s.activity === act.id)
          const total = actSubs.length
          const completed = actSubs.filter(
            (s) => s.status === 'completed' || s.status === 'reviewed',
          ).length
          const pending = actSubs.filter((s) => s.status === 'pending').length
          const pct = total ? Math.round((completed / total) * 100) : 0

          return (
            <Card
              key={act.id}
              className="border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-1">
                  <Badge
                    variant="secondary"
                    className="bg-gray-100 text-gray-600 font-mono text-xs"
                  >
                    #{act.order_number}
                  </Badge>
                  <Badge variant="outline" className="border-blue-100 text-blue-700 bg-blue-50">
                    {act.type}
                  </Badge>
                </div>
                <CardTitle
                  className="text-base font-bold text-gray-800 line-clamp-1"
                  title={act.title}
                >
                  {act.title}
                </CardTitle>
                <CardDescription className="text-xs">Engajamento de Alunos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between text-sm mb-2">
                  <div className="flex items-center gap-1.5 text-gray-500 font-medium">
                    <Activity className="w-4 h-4" /> {total} envios
                  </div>
                  <span className="font-black text-lg text-gray-900">{pct}%</span>
                </div>
                <Progress value={pct} className="h-2.5 mb-4 bg-gray-100" />
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex flex-col p-2 bg-green-50/50 rounded-lg border border-green-100">
                    <span className="text-green-800 flex items-center gap-1 font-semibold">
                      <CheckCircle className="w-3 h-3" /> Concluídos
                    </span>
                    <span className="text-lg font-black text-green-700">{completed}</span>
                  </div>
                  <div className="flex flex-col p-2 bg-yellow-50/50 rounded-lg border border-yellow-100">
                    <span className="text-yellow-800 flex items-center gap-1 font-semibold">
                      <Clock className="w-3 h-3" /> Pendentes
                    </span>
                    <span className="text-lg font-black text-yellow-700">{pending}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {activities.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 font-medium bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            Nenhuma atividade cadastrada. As estatísticas aparecerão aqui.
          </div>
        )}
      </div>
    </div>
  )
}
