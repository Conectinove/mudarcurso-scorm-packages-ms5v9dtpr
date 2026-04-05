import { useState, useEffect } from 'react'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import {
  getLearningTracks,
  createLearningTrack,
  updateLearningTrack,
  deleteLearningTrack,
} from '@/services/learning_tracks'
import { useRealtime } from '@/hooks/use-realtime'
import type { RecordModel } from 'pocketbase'
import { cn } from '@/lib/utils'

export function LabConfigTracks({ activities }: { activities: RecordModel[] }) {
  const [tracks, setTracks] = useState<RecordModel[]>([])
  const [editing, setEditing] = useState<Partial<RecordModel> | null>(null)
  const [deleting, setDeleting] = useState<RecordModel | null>(null)
  const [saving, setSaving] = useState(false)

  const loadTracks = async () => {
    try {
      setTracks(await getLearningTracks())
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadTracks()
  }, [])
  useRealtime('learning_tracks', loadTracks)

  const handleSave = async () => {
    if (!editing || !editing.name?.trim()) return
    setSaving(true)
    try {
      if (editing.id) {
        await updateLearningTrack(editing.id, editing)
        toast.success('Trilha atualizada com sucesso.')
      } else {
        await createLearningTrack(editing)
        toast.success('Trilha criada com sucesso.')
      }
      setEditing(null)
    } catch (e) {
      toast.error('Erro ao salvar a trilha.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await deleteLearningTrack(deleting.id)
      toast.success('Trilha removida com sucesso.')
      setDeleting(null)
    } catch (e) {
      toast.error('Erro ao remover a trilha.')
    }
  }

  const toggleActivity = (actId: string) => {
    if (!editing) return
    const current = (editing.activities as string[]) || []
    const updated = current.includes(actId)
      ? current.filter((id) => id !== actId)
      : [...current, actId]
    setEditing({ ...editing, activities: updated })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in-up">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="font-bold text-gray-800">Trilhas de Aprendizado</h3>
        <Button
          onClick={() => setEditing({ name: '', description: '', is_active: true, activities: [] })}
          size="sm"
          className="gap-2"
        >
          <Plus className="w-4 h-4" /> Nova Trilha
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome da Trilha</TableHead>
              <TableHead>Atividades</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tracks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  Nenhuma trilha cadastrada.
                </TableCell>
              </TableRow>
            ) : (
              tracks.map((track) => (
                <TableRow key={track.id} className="group">
                  <TableCell className="font-semibold text-gray-900">{track.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                      {(track.activities || []).length} selecionadas
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {track.is_active ? (
                      <Badge
                        variant="outline"
                        className="border-green-200 text-green-700 bg-green-50"
                      >
                        Ativa
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">
                        Inativa
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                        onClick={() => setEditing(track)}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:bg-red-50"
                        onClick={() => setDeleting(track)}
                        title="Remover"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'Editar Trilha' : 'Nova Trilha'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={editing?.name || ''}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={editing?.description || ''}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-3 pt-2">
              <Label>Atividades da Trilha</Label>
              <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100 max-h-[250px] overflow-y-auto">
                {activities.map((act) => {
                  const isSelected = (editing?.activities as string[])?.includes(act.id)
                  return (
                    <div
                      key={act.id}
                      onClick={() => toggleActivity(act.id)}
                      className={cn(
                        'p-2 text-sm border rounded-md cursor-pointer transition-colors flex items-center justify-between',
                        isSelected
                          ? 'bg-blue-50 border-blue-200 text-blue-800 font-medium'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50',
                      )}
                    >
                      <span className="truncate mr-2">{act.title}</span>
                      {isSelected && (
                        <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                      )}
                    </div>
                  )
                })}
                {activities.length === 0 && (
                  <p className="col-span-2 text-center text-sm text-gray-500 py-4">
                    Nenhuma atividade disponível.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <Switch
                checked={editing?.is_active ?? true}
                onCheckedChange={(c) => setEditing({ ...editing, is_active: c })}
              />
              <Label
                className="font-medium cursor-pointer"
                onClick={() => setEditing({ ...editing, is_active: !(editing?.is_active ?? true) })}
              >
                Trilha ativa
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving || !editing?.name?.trim()}>
              {saving ? 'Salvando...' : 'Salvar Trilha'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              A exclusão da trilha não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Sim, Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
