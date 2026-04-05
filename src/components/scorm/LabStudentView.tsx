import { useState, useEffect } from 'react'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Activity, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { getMySubmissions, submitActivity } from '@/services/activity_submissions'
import { useRealtime } from '@/hooks/use-realtime'
import { cn } from '@/lib/utils'
import type { RecordModel } from 'pocketbase'

export function LabStudentView({ activities }: { activities: RecordModel[] }) {
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState<RecordModel[]>([])
  const [selected, setSelected] = useState<RecordModel | null>(null)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadSubmissions = async () => {
    if (!user) return
    try {
      const data = await getMySubmissions(user.id)
      setSubmissions(data)
    } catch (e) {
      console.error('Failed to load submissions', e)
    }
  }

  useEffect(() => {
    loadSubmissions()
  }, [user])

  useRealtime('activity_submissions', loadSubmissions)

  const activeActivities = activities.filter((a) => a.is_active)
  const completedCount = submissions.length
  const progress = activeActivities.length
    ? Math.round((completedCount / activeActivities.length) * 100)
    : 0

  const handleOpen = (act: RecordModel) => {
    const existing = submissions.find((s) => s.activity === act.id)
    setContent(existing?.content || '')
    setSelected(act)
  }

  const handleSubmit = async () => {
    if (!user || !selected || !content.trim()) return
    setSubmitting(true)
    try {
      const existing = submissions.find((s) => s.activity === selected.id)
      await submitActivity(selected.id, user.id, content, existing?.id)
      toast.success('Atividade enviada com sucesso!')
      setSelected(null)
      loadSubmissions()
    } catch (e) {
      toast.error('Erro ao enviar atividade.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Seu Progresso
            </h3>
            <p className="text-2xl font-black text-gray-900">{progress}% Concluído</p>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 font-bold border-0">
            {completedCount} de {activeActivities.length} Atividades
          </Badge>
        </div>
        <Progress value={progress} className="h-3 bg-gray-100" />
      </div>

      {activeActivities.length === 0 ? (
        <div className="text-center py-12 text-gray-500 font-medium bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          Nenhuma atividade ativa no laboratório no momento.
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(
            activeActivities.reduce(
              (acc, act) => {
                const type = act.type || 'Outros'
                if (!acc[type]) acc[type] = []
                acc[type].push(act)
                return acc
              },
              {} as Record<string, RecordModel[]>,
            ),
          ).map(([type, typeActivities]) => (
            <div key={type} className="space-y-4">
              <h4 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                {type}
              </h4>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {typeActivities.map((act) => {
                  const isCompleted = submissions.some((s) => s.activity === act.id)
                  return (
                    <div
                      key={act.id}
                      onClick={() => handleOpen(act)}
                      className="p-5 cursor-pointer rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 hover:shadow-md transition-all flex flex-col gap-3 group"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-wider bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">
                          #{act.order_number}
                        </span>
                        <div className="flex gap-2">
                          {isCompleted && (
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-700 font-bold border-0 shadow-sm"
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" /> OK
                            </Badge>
                          )}
                        </div>
                      </div>
                      <h4 className="font-bold text-gray-900 leading-tight mt-1 group-hover:text-blue-700 transition-colors">
                        {act.title}
                      </h4>
                      <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100/60">
                        <span className="text-sm font-medium text-gray-500">Dificuldade</span>
                        <Badge
                          variant="outline"
                          className="text-gray-600 font-bold border-gray-200 bg-white"
                        >
                          {act.difficulty || 'Média'}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{selected?.type}</Badge>
              <Badge variant="outline">{selected?.difficulty || 'Média'}</Badge>
            </div>
            <DialogTitle className="text-2xl">{selected?.title}</DialogTitle>
            <DialogDescription>
              Escreva ou cole o código da sua solução abaixo para enviar esta atividade.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Digite sua resposta aqui..."
              className={cn(
                'min-h-[250px] resize-none',
                ['Código', 'Sandbox'].includes(selected?.type || '') &&
                  'font-mono text-sm bg-gray-950 text-gray-50 p-4 rounded-xl',
              )}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!content.trim() || submitting}>
              {submitting ? 'Enviando...' : 'Enviar Atividade'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
