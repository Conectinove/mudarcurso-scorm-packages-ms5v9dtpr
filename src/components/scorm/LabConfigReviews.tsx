import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getAllSubmissions, reviewSubmission } from '@/services/activity_submissions'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from 'sonner'
import { MessageSquare, CheckCircle, Clock } from 'lucide-react'
import type { RecordModel } from 'pocketbase'

export function LabConfigReviews() {
  const [submissions, setSubmissions] = useState<RecordModel[]>([])
  const [selectedSub, setSelectedSub] = useState<RecordModel | null>(null)
  const [feedback, setFeedback] = useState('')
  const [status, setStatus] = useState('reviewed')
  const [saving, setSaving] = useState(false)

  const loadData = async () => {
    try {
      const data = await getAllSubmissions()
      setSubmissions(data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('activity_submissions', loadData)

  const pendingSubs = submissions.filter((s) => s.status === 'pending')

  const handleReview = (sub: RecordModel) => {
    setSelectedSub(sub)
    setFeedback(sub.instructor_feedback || '')
    setStatus('reviewed')
  }

  const handleSave = async () => {
    if (!selectedSub) return
    setSaving(true)
    try {
      await reviewSubmission(selectedSub.id, feedback, status)
      toast.success('Feedback enviado com sucesso!')
      setSelectedSub(null)
      loadData()
    } catch (e) {
      toast.error('Erro ao enviar feedback.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" /> Avaliação de Submissões
          </CardTitle>
          <CardDescription>
            Revise as atividades enviadas pelos alunos e forneça feedback direto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingSubs.length === 0 ? (
            <div className="text-center py-12 text-gray-500 font-medium bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <CheckCircle className="w-8 h-8 mx-auto mb-3 text-green-500 opacity-50" />
              Nenhuma submissão pendente de avaliação.
            </div>
          ) : (
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50/80">
                  <TableRow>
                    <TableHead>Aluno</TableHead>
                    <TableHead>Atividade</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingSubs.map((sub) => (
                    <TableRow key={sub.id} className="hover:bg-gray-50/50">
                      <TableCell className="font-medium text-gray-900">
                        {sub.expand?.student?.name || sub.expand?.student?.email || 'Desconhecido'}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {sub.expand?.activity?.title || 'Atividade Excluída'}
                        <Badge variant="outline" className="ml-2 text-[10px] uppercase">
                          {sub.expand?.activity?.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">
                        {new Date(sub.created).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="bg-yellow-100 text-yellow-700 font-bold border-0"
                        >
                          <Clock className="w-3 h-3 mr-1" /> Pendente
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReview(sub)}
                          className="font-medium text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          Avaliar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedSub} onOpenChange={(o) => !o && setSelectedSub(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b border-gray-100 shrink-0 bg-gray-50/50">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                Avaliação
              </Badge>
              <span className="text-sm font-medium text-gray-500">
                Aluno: {selectedSub?.expand?.student?.name || 'Desconhecido'}
              </span>
            </div>
            <DialogTitle className="text-xl">
              {selectedSub?.expand?.activity?.title || 'Atividade'}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-2">
              <Label className="font-bold text-gray-700">Código / Resolução do Aluno</Label>
              <div className="p-4 rounded-xl bg-gray-950 text-gray-50 font-mono text-sm overflow-x-auto whitespace-pre-wrap min-h-[100px] max-h-[250px] overflow-y-auto">
                {selectedSub?.content || 'Sem conteúdo.'}
              </div>
            </div>

            {selectedSub?.student_comment && (
              <div className="space-y-2">
                <Label className="font-bold text-gray-700">Comentário do Aluno</Label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-700 italic">
                  "{selectedSub.student_comment}"
                </div>
              </div>
            )}

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="space-y-2">
                <Label className="font-bold text-gray-900">Feedback do Instrutor</Label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Escreva um feedback construtivo para o aluno..."
                  className="min-h-[120px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-gray-900">Status da Avaliação</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reviewed">Revisado (Aprovado)</SelectItem>
                    <SelectItem value="completed">Concluído (Sem revisão detalhada)</SelectItem>
                    <SelectItem value="pending">Manter Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 border-t border-gray-100 bg-white shrink-0">
            <Button variant="outline" onClick={() => setSelectedSub(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? 'Salvando...' : 'Salvar Avaliação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
