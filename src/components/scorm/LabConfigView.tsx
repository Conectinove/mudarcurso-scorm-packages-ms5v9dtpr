import { useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, Copy } from 'lucide-react'
import { toast } from 'sonner'
import {
  updateAdvancedActivity,
  deleteAdvancedActivity,
  createAdvancedActivity,
} from '@/services/advanced_activities'
import type { RecordModel } from 'pocketbase'

export function LabConfigView({ activities }: { activities: RecordModel[] }) {
  const [editing, setEditing] = useState<RecordModel | null>(null)
  const [deleting, setDeleting] = useState<RecordModel | null>(null)
  const [formData, setFormData] = useState({ title: '', type: '', difficulty: '', is_active: true })
  const [saving, setSaving] = useState(false)

  const handleEdit = (act: RecordModel) => {
    setFormData({
      title: act.title,
      type: act.type,
      difficulty: act.difficulty || '',
      is_active: act.is_active !== false, // defaults true if undefined
    })
    setEditing(act)
  }

  const handleSave = async () => {
    if (!editing || !formData.title.trim()) return
    setSaving(true)
    try {
      await updateAdvancedActivity(editing.id, formData)
      toast.success('Atividade atualizada com sucesso.')
      setEditing(null)
    } catch (e) {
      toast.error('Erro ao atualizar a atividade.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await deleteAdvancedActivity(deleting.id)
      toast.success('Atividade removida com sucesso.')
      setDeleting(null)
    } catch (e) {
      toast.error('Erro ao remover a atividade.')
    }
  }

  const handleClone = async (act: RecordModel) => {
    try {
      const maxOrder = activities.reduce(
        (max, a) => Math.max(max, typeof a.order_number === 'number' ? a.order_number : 0),
        0,
      )
      await createAdvancedActivity({
        title: `${act.title} (Cópia)`,
        type: act.type,
        difficulty: act.difficulty,
        order_number: maxOrder + 1,
        is_active: false,
      })
      toast.success('Atividade clonada com sucesso.')
    } catch (e) {
      toast.error('Erro ao clonar a atividade.')
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in-up">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="w-16 text-center">Ord</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Dificuldade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Nenhuma atividade cadastrada.
                </TableCell>
              </TableRow>
            ) : (
              activities.map((act) => (
                <TableRow key={act.id} className="group">
                  <TableCell className="text-center font-mono text-gray-400 font-bold">
                    {act.order_number}
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900">{act.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                      {act.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{act.difficulty || '-'}</span>
                  </TableCell>
                  <TableCell>
                    {act.is_active ? (
                      <Badge
                        variant="outline"
                        className="border-green-200 text-green-700 bg-green-50"
                      >
                        Ativo
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">
                        Inativo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-green-600 hover:bg-green-50"
                        onClick={() => handleClone(act)}
                        title="Clonar"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                        onClick={() => handleEdit(act)}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:bg-red-50"
                        onClick={() => setDeleting(act)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Atividade</DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="space-y-2">
              <Label>Título da Atividade</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['Código', 'Sandbox', 'Exercício', 'Projeto', 'Desafio'].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Dificuldade</Label>
                <Input
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(c) => setFormData({ ...formData, is_active: c })}
              />
              <Label
                className="font-medium cursor-pointer"
                onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
              >
                Atividade visível para alunos
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving || !formData.title.trim()}>
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              A exclusão da atividade <strong>{deleting?.title}</strong> não pode ser desfeita. Os
              envios associados a esta atividade também serão perdidos se a exclusão for em cascata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Sim, Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
