import { useState, useRef, useEffect } from 'react'
import { Package, Upload, Trash2, PlayCircle, LogOut } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import {
  getScormPackages,
  createScormPackage,
  deleteScormPackage,
  getStudentProgress,
  getOrCreateProgress,
  updateProgress,
} from '@/services/scorm'
import { useRealtime } from '@/hooks/use-realtime'
import type { RecordModel } from 'pocketbase'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

export default function Index() {
  const { toast } = useToast()
  const { user, signOut } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [scormVersion, setScormVersion] = useState<string>('SCORM 1.2')
  const [completionCriteria, setCompletionCriteria] = useState<string>('Marcado como completo')
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)

  const [packages, setPackages] = useState<RecordModel[]>([])
  const [progresses, setProgresses] = useState<RecordModel[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // SCORM Player Modal State
  const [playerOpen, setPlayerOpen] = useState(false)
  const [currentPkg, setCurrentPkg] = useState<RecordModel | null>(null)
  const [currentProgress, setCurrentProgress] = useState<RecordModel | null>(null)

  const scormVersions = ['SCORM 1.2', 'SCORM 2004', 'xAPI', 'cmi5']
  const criteriaOptions = [
    'Marcado como completo',
    'Aprovação no quiz',
    'Nota mínima',
    'Interação completa',
  ]

  const loadData = async () => {
    try {
      const [pkgs, progs] = await Promise.all([getScormPackages(), getStudentProgress()])
      setPackages(pkgs)
      setProgresses(progs)
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao carregar os dados.', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('scorm_packages', () => {
    loadData()
  })

  useRealtime('student_progress', () => {
    loadData()
  })

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.zip')) {
      toast({
        title: 'Formato inválido',
        description: 'Por favor, selecione um arquivo .zip',
        variant: 'destructive',
      })
      return
    }

    if (!user) return

    setUploadProgress(10)

    try {
      // Simulate visual upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => Math.min((prev || 0) + 20, 90))
      }, 200)

      await createScormPackage({
        name: file.name,
        file,
        version: scormVersion,
        completion_criteria: completionCriteria,
        owner: user.id,
      })

      clearInterval(interval)
      setUploadProgress(100)

      setTimeout(() => {
        setUploadProgress(null)
        toast({ title: 'Sucesso!', description: 'Pacote carregado com sucesso.' })
      }, 600)
    } catch (error: any) {
      setUploadProgress(null)
      toast({
        title: 'Erro ao enviar',
        description: error.message || 'Ocorreu um problema ao enviar o arquivo.',
        variant: 'destructive',
      })
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0])
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este pacote?')) return
    try {
      await deleteScormPackage(id)
      toast({ title: 'Pacote excluído com sucesso.' })
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível excluir.', variant: 'destructive' })
    }
  }

  const openPlayer = async (pkg: RecordModel) => {
    if (!user) return
    setCurrentPkg(pkg)
    try {
      const prog = await getOrCreateProgress(user.id, pkg.id)
      setCurrentProgress(prog)
      setPlayerOpen(true)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o progresso.',
        variant: 'destructive',
      })
    }
  }

  const simulateScormEvent = async (action: 'progress' | 'complete' | 'score') => {
    if (!currentProgress) return
    try {
      let data = {}
      if (action === 'progress') {
        const newPct = Math.min((currentProgress.progress_percentage || 0) + 25, 100)
        data = { progress_percentage: newPct, status: newPct === 100 ? 'completed' : 'in_progress' }
      } else if (action === 'complete') {
        data = { status: 'completed', progress_percentage: 100 }
      } else if (action === 'score') {
        data = { score: Math.min((currentProgress.score || 0) + 10, 100) }
      }

      const updated = await updateProgress(currentProgress.id, data)
      setCurrentProgress(updated)
      toast({ title: 'Progresso sincronizado (Simulação SCORM)' })
    } catch (error) {
      toast({ title: 'Erro na sincronização', variant: 'destructive' })
    }
  }

  const getPackageProgress = (pkgId: string) => {
    return progresses.find((p) => p.package === pkgId)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Portal SCORM</h1>
          <p className="text-gray-500 mt-1">Gerencie seus pacotes e acompanhe o progresso</p>
        </div>
        <div className="flex items-center gap-4 animate-fade-in">
          <span className="text-sm text-gray-600 font-medium hidden sm:inline-block">
            Olá, {user?.name || user?.email}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={signOut}
            className="gap-2 rounded-lg hover:bg-gray-100"
          >
            <LogOut className="w-4 h-4" /> Sair
          </Button>
        </div>
      </div>

      <Card
        className="border-0 shadow-sm overflow-hidden bg-white rounded-2xl animate-fade-in-up"
        style={{ animationDelay: '100ms' }}
      >
        <CardContent className="p-6 sm:p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                Upload de Pacote SCORM
              </h2>
            </div>
            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-full px-4 py-1.5 font-semibold transition-colors">
              {packages.length} pacote(s)
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-gray-600 font-medium">Versão SCORM</Label>
              <Select value={scormVersion} onValueChange={setScormVersion}>
                <SelectTrigger className="w-full bg-gray-50 border-gray-200 focus:ring-purple-500/20 focus:border-purple-500 h-11 rounded-xl">
                  <SelectValue placeholder="Selecione a versão" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                  {scormVersions.map((version) => (
                    <SelectItem
                      key={version}
                      value={version}
                      className="rounded-lg my-1 cursor-pointer"
                    >
                      {version}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-600 font-medium">Critério de Conclusão</Label>
              <Select value={completionCriteria} onValueChange={setCompletionCriteria}>
                <SelectTrigger className="w-full bg-gray-50 border-gray-200 focus:ring-purple-500/20 focus:border-purple-500 h-11 rounded-xl">
                  <SelectValue placeholder="Selecione o critério" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                  {criteriaOptions.map((criteria) => (
                    <SelectItem
                      key={criteria}
                      value={criteria}
                      className="rounded-lg my-1 cursor-pointer"
                    >
                      {criteria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div
            className={cn(
              'relative group flex flex-col items-center justify-center p-12 text-center rounded-2xl border-2 border-dashed transition-all duration-300 ease-apple cursor-pointer',
              isDragging
                ? 'border-purple-500 bg-purple-50 scale-[1.01]'
                : 'border-purple-200 bg-gray-50/50 hover:bg-purple-50/50 hover:border-purple-400',
              uploadProgress !== null && 'pointer-events-none opacity-80',
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !uploadProgress && fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".zip,application/zip,application/x-zip-compressed"
              className="hidden"
            />

            {uploadProgress === null ? (
              <>
                <div className="h-14 w-14 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                  <Upload className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Arraste o pacote SCORM (.zip) ou clique para selecionar
                </h3>
                <p className="text-sm text-gray-500 font-medium">
                  Max 100MB. Suporta SCORM 1.2, 2004, xAPI e cmi5
                </p>
              </>
            ) : (
              <div className="w-full max-w-sm space-y-4 animate-fade-in">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-purple-700">Enviando e processando pacote...</span>
                  <span className="text-purple-900">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-3 bg-purple-100" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {!isLoading && packages.length > 0 && (
        <Card
          className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden animate-slide-up"
          style={{ animationDelay: '200ms' }}
        >
          <Table>
            <TableHeader className="bg-gray-50/80">
              <TableRow className="border-b border-gray-100 hover:bg-transparent">
                <TableHead className="font-bold text-gray-700 h-14">Pacote & Progresso</TableHead>
                <TableHead className="font-bold text-gray-700 hidden md:table-cell">
                  Versão
                </TableHead>
                <TableHead className="font-bold text-gray-700 hidden lg:table-cell">
                  Status
                </TableHead>
                <TableHead className="font-bold text-gray-700 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map((pkg) => {
                const prog = getPackageProgress(pkg.id)
                return (
                  <TableRow
                    key={pkg.id}
                    className="border-b border-gray-50 hover:bg-purple-50/30 transition-colors group"
                  >
                    <TableCell className="font-medium text-gray-900 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center shrink-0 border border-orange-100">
                          <Package className="h-6 w-6 text-orange-600" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span
                            className="truncate max-w-[200px] sm:max-w-xs font-semibold text-gray-800"
                            title={pkg.name}
                          >
                            {pkg.name}
                          </span>
                          <div className="flex items-center gap-3 w-40">
                            <Progress
                              value={prog?.progress_percentage || 0}
                              className="h-2 w-full"
                            />
                            <span className="text-xs font-medium text-gray-500 w-8">
                              {prog?.progress_percentage || 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 font-medium hidden md:table-cell">
                      {pkg.version}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge
                        variant="secondary"
                        className={cn(
                          'font-medium rounded-lg px-3 py-1',
                          prog?.status === 'completed' || prog?.status === 'passed'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                            : prog?.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-100',
                        )}
                      >
                        {prog?.status || 'not_started'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-purple-100 text-purple-700 hover:bg-purple-200 gap-2 font-semibold shadow-sm"
                          onClick={() => openPlayer(pkg)}
                        >
                          <PlayCircle className="h-4 w-4" /> Iniciar
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          onClick={() => handleDelete(pkg.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={playerOpen} onOpenChange={setPlayerOpen}>
        <DialogContent className="sm:max-w-[600px] border-0 rounded-3xl shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>SCORM Player Simulation</DialogTitle>
            <DialogDescription>Mock player interface to emit SCORM API events.</DialogDescription>
          </DialogHeader>

          <div className="bg-gray-950 text-white p-8 pb-10 text-center relative">
            <h3 className="text-2xl font-bold mb-2 tracking-tight">{currentPkg?.name}</h3>
            <p className="text-gray-400 text-sm font-medium">
              Versão: {currentPkg?.version} • Critério: {currentPkg?.completion_criteria}
            </p>

            <div className="mt-10 mb-6">
              <div className="text-6xl font-black text-purple-400 mb-2 drop-shadow-lg">
                {currentProgress?.progress_percentage || 0}%
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-[0.2em] font-bold">
                Progresso Atual
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mt-8">
              <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-3 text-left min-w-[140px]">
                <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">
                  Status
                </div>
                <div className="font-bold text-lg text-gray-100">
                  {currentProgress?.status || 'not_started'}
                </div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-3 text-left min-w-[140px]">
                <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">
                  Nota (Score)
                </div>
                <div className="font-bold text-lg text-gray-100">{currentProgress?.score || 0}</div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-white space-y-5">
            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider text-center">
              Simular Eventos SCORM (LMS API)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                onClick={() => simulateScormEvent('progress')}
                variant="outline"
                className="h-14 text-blue-700 border-blue-200 hover:bg-blue-50 font-semibold rounded-xl"
              >
                Avançar 25%
              </Button>
              <Button
                onClick={() => simulateScormEvent('score')}
                variant="outline"
                className="h-14 text-orange-700 border-orange-200 hover:bg-orange-50 font-semibold rounded-xl"
              >
                +10 Pontos
              </Button>
              <Button
                onClick={() => simulateScormEvent('complete')}
                variant="outline"
                className="h-14 text-emerald-700 border-emerald-200 hover:bg-emerald-50 font-semibold rounded-xl"
              >
                Concluir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
