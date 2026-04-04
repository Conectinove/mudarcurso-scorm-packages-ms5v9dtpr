import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Package } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('ronaldoconectinove@gmail.com')
  const [password, setPassword] = useState('Skip@Pass')
  const [isLoading, setIsLoading] = useState(false)

  const { signIn } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const { error } = await signIn(email, password)
    setIsLoading(false)

    if (error) {
      toast({
        title: 'Erro ao acessar',
        description: 'Credenciais inválidas. Verifique seu e-mail e senha.',
        variant: 'destructive',
      })
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="flex justify-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/20">
            <Package className="h-7 w-7 text-white" />
          </div>
        </div>

        <Card className="border-0 shadow-xl shadow-gray-200/50">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold">Acesse sua conta</CardTitle>
            <CardDescription className="text-base">
              Plataforma de Gestão de Pacotes SCORM
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-50/50 h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-50/50 h-11"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar na plataforma'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
