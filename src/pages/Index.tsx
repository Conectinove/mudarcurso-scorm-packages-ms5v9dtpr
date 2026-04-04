import { useState, useRef } from 'react'
import { Package, Upload, Check, Trash2, Edit2, PlayCircle, MoreHorizontal } from 'lucide-react'
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

interface SCORMPackage {
  id: string
  name: string
  version: string
  criteria: string
  status: 'Processando' | 'Pronto'
  date: string
}

export default function Index() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [scormVersion, setScormVersion] = useState<string>('SCORM 1.2')
  const [completionCriteria, setCompletionCriteria] = useState<string>('Marcado como completo')
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)

  const [packages, setPackages] = useState<SCORMPackage[]>([
    {
      id: '1',
      name: 'Introdução_a_Liderança.zip',
      version: 'SCORM 1.2',
      criteria: 'Marcado como completo',
      status: 'Pronto',
      date: '04 Abr 2026',
    },
  ])

  const scormVersions = ['SCORM 1.2', 'SCORM 2004', 'xAPI (Tin Can)', 'cmi5']

  const criteriaOptions = [
    'Marcado como completo',
    'Aprovação no quiz',
    'Nota mínima',
    'Interação completa',
  ]

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const processFile = (file: File) => {
    if (!file.name.endsWith('.zip')) {
      toast({
        title: 'Formato inválido',
        description: 'Por favor, selecione um arquivo .zip',
        variant: 'destructive',
      })
      return
    }

    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null || prev >= 100) {
          clearInterval(interval)
          return null
        }
        return prev + 10
      })
    }, 200)

    // Finish upload
    setTimeout(() => {
      const newPackage: SCORMPackage = {
        id: Math.random().toString(36).substring(7),
        name: file.name,
        version: scormVersion,
        criteria: completionCriteria,
        status: 'Processando',
        date: new Date().toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
      }

      setPackages((prev) => [newPackage, ...prev])
      setUploadProgress(null)

      toast({
        title: 'Sucesso!',
        description: 'Pacote carregado com sucesso.',
      })

      // Simulate processing complete
      setTimeout(() => {
        setPackages((prev) =>
          prev.map((p) => (p.id === newPackage.id ? { ...p, status: 'Pronto' } : p)),
        )
      }, 3000)
    }, 2200)
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

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm overflow-hidden bg-white rounded-xl">
        <CardContent className="p-6 sm:p-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-amber-500" />
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Pacotes SCORM</h2>
            </div>
            <Badge className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-3 py-1 font-medium">
              {packages.length} pacote(s)
            </Badge>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Versão SCORM</label>
              <Select value={scormVersion} onValueChange={setScormVersion}>
                <SelectTrigger className="w-full bg-gray-50/50 border-gray-200 focus:ring-purple-500/20 focus:border-purple-500 h-11">
                  <SelectValue placeholder="Selecione a versão" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-100 shadow-lg">
                  {scormVersions.map((version) => (
                    <SelectItem
                      key={version}
                      value={version}
                      className="rounded-lg my-1 data-[state=checked]:bg-purple-300 data-[state=checked]:text-purple-900 focus:bg-purple-50 focus:text-purple-900 cursor-pointer"
                    >
                      {version}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Critério de Conclusão</label>
              <Select value={completionCriteria} onValueChange={setCompletionCriteria}>
                <SelectTrigger className="w-full bg-gray-50/50 border-gray-200 focus:ring-purple-500/20 focus:border-purple-500 h-11">
                  <SelectValue placeholder="Selecione o critério" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-100 shadow-lg">
                  {criteriaOptions.map((criteria) => (
                    <SelectItem
                      key={criteria}
                      value={criteria}
                      className="rounded-lg my-1 data-[state=checked]:bg-purple-300 data-[state=checked]:text-purple-900 focus:bg-purple-50 focus:text-purple-900 cursor-pointer"
                    >
                      {criteria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Upload Zone */}
          <div
            className={cn(
              'relative group flex flex-col items-center justify-center p-12 text-center rounded-2xl border-2 border-dashed transition-all duration-200 ease-apple cursor-pointer',
              isDragging
                ? 'border-purple-500 bg-purple-50/80 scale-[1.01]'
                : 'border-purple-300/60 bg-gray-50 hover:bg-purple-50/30 hover:border-purple-400',
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
              accept=".zip"
              className="hidden"
            />

            {uploadProgress === null ? (
              <>
                <div className="h-12 w-12 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Upload className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  Arraste o pacote SCORM (.zip) ou clique para selecionar
                </h3>
                <p className="text-sm text-gray-500">Suporta SCORM 1.2, 2004, xAPI e cmi5</p>
              </>
            ) : (
              <div className="w-full max-w-sm space-y-4 animate-fade-in">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-purple-700">Enviando pacote...</span>
                  <span className="text-gray-500">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2.5 bg-purple-100" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Package List */}
      {packages.length > 0 && (
        <Card className="border-0 shadow-sm bg-white rounded-xl overflow-hidden animate-slide-up">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="border-b border-gray-100 hover:bg-transparent">
                <TableHead className="font-semibold text-gray-600 h-12">Nome do Pacote</TableHead>
                <TableHead className="font-semibold text-gray-600 hidden md:table-cell">
                  Versão
                </TableHead>
                <TableHead className="font-semibold text-gray-600 hidden lg:table-cell">
                  Critério
                </TableHead>
                <TableHead className="font-semibold text-gray-600">Status</TableHead>
                <TableHead className="font-semibold text-gray-600 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map((pkg) => (
                <TableRow
                  key={pkg.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
                >
                  <TableCell className="font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded bg-orange-50 flex items-center justify-center shrink-0">
                        <Package className="h-4 w-4 text-orange-500" />
                      </div>
                      <span className="truncate max-w-[150px] sm:max-w-xs" title={pkg.name}>
                        {pkg.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-500 hidden md:table-cell">
                    {pkg.version}
                  </TableCell>
                  <TableCell className="text-gray-500 hidden lg:table-cell">
                    {pkg.criteria}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn(
                        'font-medium rounded-md',
                        pkg.status === 'Pronto'
                          ? 'bg-green-100 text-green-700 hover:bg-green-100'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-100 animate-pulse',
                      )}
                    >
                      {pkg.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-primary hover:bg-purple-50"
                      >
                        <PlayCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => setPackages(packages.filter((p) => p.id !== pkg.id))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="group-hover:hidden flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-300 pointer-events-none"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
