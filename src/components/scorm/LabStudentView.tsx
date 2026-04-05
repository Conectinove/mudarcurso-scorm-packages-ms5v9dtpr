import { useState, useEffect } from 'react'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { getMySubmissions, submitActivity } from '@/services/activity_submissions'
import { getLearningTracks } from '@/services/learning_tracks'
import { useRealtime } from '@/hooks/use-realtime'
import { cn } from '@/lib/utils'
import type { RecordModel } from 'pocketbase'

export function LabStudentView({ activities }: { activities: RecordModel[] }) {
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState<RecordModel[]>([])
  const [tracks, setTracks] = useState<RecordModel[]>([])
  const [selectedTrack, setSelectedTrack] = useState<string>('all')
  const [selected, setSelected] = useState<RecordModel | null>(null)
  const [content, setContent] = useState('')
  const [studentComment, setStudentComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadData = async () => {
    if (!user) return
    try {
      const [subs, trks] = await Promise.all([getMySubmissions(user.id), getLearningTracks()])
      setSubmissions(subs)
      setTracks(trks.filter((t) => t.is_active))
    } catch (e) {
      console.error('Failed to load data', e)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])
  useRealtime('activity_submissions', loadData)
  useRealtime('learning_tracks', loadData)

  const trackObj = selectedTrack !== 'all' ? tracks.find((t) => t.id === selectedTrack) : null
  const activeActivities = activities.filter((a) => {
    if (!a.is_active) return false
    if (trackObj && !trackObj.activities?.includes(a.id)) return false
    return true
  })

  const completedCount = activeActivities.filter((a) =>
    submissions.some((s) => s.activity === a.id),
  ).length
  const progress = activeActivities.length
    ? Math.round((completedCount / activeActivities.length) * 100)
    : 0

  const handleOpen = (act: RecordModel) => {
    const existing = submissions.find((s) => s.activity === act.id)
    setContent(existing?.content || '')
    setStudentComment(existing?.student_comment || '')
    setSelected(act)
  }

  const handleSubmit = async () => {
    if (!user || !selected || !content.trim()) return
    setSubmitting(true)
    try {
      const existing = submissions.find((s) => s.activity === selected.id)
      await submitActivity(selected.id, user.id, content, studentComment, existing?.id)
      toast.success('Atividade enviada com sucesso!')
      setSelected(null)
      loadData()
    } catch (e) {
      toast.error('Erro ao enviar atividade.')
    } finally {
      setSubmitting(false)
    }
  }

  const currentSubmission = selected ? submissions.find((s) => s.activity === selected.id) : null

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="font-bold text-gray-700 text-sm whitespace-nowrap">Filtrar Trilha:</span>
          <Select value={selectedTrack} onValueChange={setSelectedTrack}>
            <SelectTrigger className="w-full sm:w-[250px]">
              <SelectValue placeholder="Todas as Atividades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Atividades</SelectItem>
              {tracks.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Progresso da Trilha
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
          Nenhuma atividade disponível para esta seleção.
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
                  const sub = submissions.find((s) => s.activity === act.id)
                  return (
                    <div
                      key={act.id}
                      onClick={() => handleOpen(act)}
                      className="p-5 cursor-pointer rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 hover:shadow-md transition-all flex flex-col gap-3 group relative overflow-hidden"
                    >
                      {sub?.status === 'reviewed' && (
                        <div
                          className="absolute top-0 right-0 w-12 h-12 bg-purple-500 transform translate-x-6 -translate-y-6 rotate-45"
                          title="Revisado"
                        ></div>
                      )}
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-wider bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">
                          #{act.order_number}
                        </span>
                        <div className="flex gap-2 z-10">
                          {sub && (
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
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                        {act.description || 'Sem descrição'}
                      </p>
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
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{selected?.type}</Badge>
              <Badge variant="outline">{selected?.difficulty || 'Média'}</Badge>
            </div>
            <DialogTitle className="text-2xl">{selected?.title}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
            {selected?.description && (
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 text-sm text-blue-900 leading-relaxed">
                <strong className="block text-blue-800 mb-1 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Instruções
                </strong>
                {selected.description}
              </div>
            )}

            {currentSubmission?.status === 'reviewed' && currentSubmission?.instructor_feedback && (
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                <Label className="text-purple-800 font-bold flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4" /> Feedback do Instrutor
                </Label>
                <p className="text-sm text-purple-900 bg-white p-3 rounded-lg border border-purple-50">
                  {currentSubmission.instructor_feedback}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label className="font-bold text-gray-700">Sua Resolução / Código</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Cole seu código ou escreva sua resposta aqui..."
                className={cn(
                  'min-h-[200px] resize-none border-gray-200 focus-visible:ring-blue-500',
                  ['Código', 'Sandbox'].includes(selected?.type || '') &&
                    'font-mono text-sm bg-gray-950 text-gray-50 p-4 rounded-xl focus-visible:ring-offset-0 focus-visible:ring-0',
                )}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-gray-700">Comentário (Opcional)</Label>
              <Textarea
                value={studentComment}
                onChange={(e) => setStudentComment(e.target.value)}
                placeholder="Deixe um comentário sobre a sua resolução, dúvidas ou dificuldades..."
                className="min-h-[80px] text-sm resize-none"
              />
            </div>
          </div>

          <DialogFooter className="p-4 border-t border-gray-100 bg-white shrink-0">
            <Button variant="outline" onClick={() => setSelected(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {submitting ? 'Enviando...' : 'Enviar Atividade'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
