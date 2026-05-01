'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, LogIn, Shield, Smartphone, AlertTriangle, Clock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Tentativas restantes (null = Upstash não configurado / desconhecido)
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null)

  // Bloqueio por rate limit
  const [blockedSeconds, setBlockedSeconds] = useState(0)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Segundo passo — MFA
  const [mfaStep, setMfaStep] = useState(false)
  const [mfaTempToken, setMfaTempToken] = useState('')
  const [totpCode, setTotpCode] = useState('')

  const { login, verifyMfa, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/admin/dashboard'
    }
  }, [isAuthenticated, router])

  // Countdown do bloqueio
  useEffect(() => {
    if (blockedSeconds <= 0) {
      if (countdownRef.current) clearInterval(countdownRef.current)
      return
    }
    countdownRef.current = setInterval(() => {
      setBlockedSeconds((s) => {
        if (s <= 1) {
          clearInterval(countdownRef.current!)
          setError('')
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => { if (countdownRef.current) clearInterval(countdownRef.current) }
  }, [blockedSeconds])

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    if (m > 0) return `${m}m ${s.toString().padStart(2, '0')}s`
    return `${s}s`
  }

  const isBlocked = blockedSeconds > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isBlocked) return
    setLoading(true)
    setError('')

    try {
      const result = await login(email, password)

      if (result.rateLimited) {
        setBlockedSeconds(result.retryAfter ?? 900)
        setRemainingAttempts(0)
        return
      }

      if (result.mfaRequired && result.mfaTempToken) {
        setMfaTempToken(result.mfaTempToken)
        setMfaStep(true)
        setRemainingAttempts(null)
      } else if (result.success) {
        window.location.href = '/admin/dashboard'
      } else {
        const remaining = result.remaining ?? null
        setRemainingAttempts(remaining)
        setError('Credenciais inválidas. Verifique seu email e senha.')
      }
    } catch {
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const success = await verifyMfa(totpCode, mfaTempToken)
      if (success) {
        window.location.href = '/admin/dashboard'
      } else {
        setError('Código inválido ou expirado. Tente novamente.')
        setTotpCode('')
      }
    } catch {
      setError('Erro ao verificar código. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-secondary-600 to-accent-500 rounded-full flex items-center justify-center mb-6">
            {mfaStep ? <Smartphone className="h-8 w-8 text-white" /> : <Shield className="h-8 w-8 text-white" />}
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Portal de Notícias</h2>
          <p className="text-primary-200">
            {mfaStep ? 'Verificação em dois fatores' : 'Acesso ao painel administrativo'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">

          {/* ── Passo 1 — Email e senha ─────────────────────────────── */}
          {!mfaStep && (
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Bloqueado por rate limit */}
              {isBlocked && (
                <div className="bg-red-50 border border-red-300 rounded-md px-4 py-3 flex items-start gap-3">
                  <Clock className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                  <div className="text-sm text-red-700">
                    <p className="font-semibold">Acesso temporariamente bloqueado</p>
                    <p>Muitas tentativas incorretas. Tente novamente em{' '}
                      <span className="font-mono font-bold">{formatCountdown(blockedSeconds)}</span>.
                    </p>
                  </div>
                </div>
              )}

              {/* Erro de credencial + aviso de tentativas restantes */}
              {!isBlocked && error && (
                <div className="space-y-2">
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                  {remainingAttempts !== null && remainingAttempts <= 3 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-md px-4 py-2 flex items-center gap-2 text-sm text-amber-700">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      {remainingAttempts === 0
                        ? 'Esta foi sua última tentativa. O acesso será bloqueado na próxima.'
                        : `Atenção: ${remainingAttempts} tentativa${remainingAttempts > 1 ? 's' : ''} restante${remainingAttempts > 1 ? 's' : ''} antes do bloqueio.`}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="admin@exemplo.com"
                  disabled={loading || isBlocked}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">Senha</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="Digite sua senha"
                    disabled={loading || isBlocked}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600"
                    disabled={loading || isBlocked}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || isBlocked || !email || !password}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-400 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
              >
                {loading
                  ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  : isBlocked
                  ? <><Clock className="h-5 w-5" />Bloqueado — {formatCountdown(blockedSeconds)}</>
                  : <><LogIn className="h-5 w-5" />Entrar</>}
              </button>
            </form>
          )}

          {/* ── Passo 2 — Código TOTP ───────────────────────────────── */}
          {mfaStep && (
            <form onSubmit={handleMfaSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              <div className="text-center text-sm text-neutral-600 bg-neutral-50 rounded-lg p-4">
                <Smartphone className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                Abra o <strong>Google Authenticator</strong> ou <strong>Authy</strong> e digite o código de 6 dígitos.
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Código de verificação
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 text-center text-2xl font-mono tracking-widest"
                  placeholder="000000"
                  autoFocus
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading || totpCode.length !== 6}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-400 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
              >
                {loading
                  ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  : <><Shield className="h-5 w-5" />Verificar</>}
              </button>
              <button
                type="button"
                onClick={() => { setMfaStep(false); setError(''); setTotpCode('') }}
                className="w-full text-sm text-neutral-500 hover:text-neutral-700 py-2"
              >
                ← Voltar ao login
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-neutral-200">
            <p className="text-xs text-neutral-500 text-center">
              Área restrita para administradores.<br />
              Em caso de problemas, entre em contato com o suporte técnico.
            </p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-primary-200">
            © 2024 Portal de Notícias. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}
