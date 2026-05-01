'use client'

import { useState, useEffect } from 'react'
import { Shield, Smartphone, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Image from 'next/image'

export default function MfaConfigPage() {
  const { user } = useAuth()
  const [mfaStatus, setMfaStatus] = useState<'loading' | 'active' | 'inactive'>('loading')
  const [step, setStep] = useState<'idle' | 'setup' | 'disable'>('idle')
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkMfaStatus()
  }, [])

  const checkMfaStatus = async () => {
    try {
      const res = await fetch('/api/admin/mfa/setup', { credentials: 'include' })
      // Se retornou 400 "já ativo", MFA está ativo
      if (res.status === 400) {
        setMfaStatus('active')
      } else if (res.ok) {
        const data = await res.json()
        // Retornou QR code — MFA não está ativo, mas já buscamos o setup
        setQrCode(data.qrCode)
        setSecret(data.secret)
        setMfaStatus('inactive')
      }
    } catch {
      setMfaStatus('inactive')
    }
  }

  const startSetup = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/mfa/setup', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setQrCode(data.qrCode)
        setSecret(data.secret)
        setStep('setup')
      } else {
        const data = await res.json()
        setError(data.error)
      }
    } catch {
      setError('Erro ao gerar QR code.')
    } finally {
      setLoading(false)
    }
  }

  const handleEnable = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/mfa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code, secret }),
      })

      const data = await res.json()
      if (res.ok) {
        setSuccess('MFA ativado com sucesso! No próximo login você precisará do código.')
        setMfaStatus('active')
        setStep('idle')
        setCode('')
      } else {
        setError(data.error)
      }
    } catch {
      setError('Erro ao ativar MFA.')
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/mfa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code }),
      })

      const data = await res.json()
      if (res.ok) {
        setSuccess('MFA desativado.')
        setMfaStatus('inactive')
        setStep('idle')
        setCode('')
      } else {
        setError(data.error)
      }
    } catch {
      setError('Erro ao desativar MFA.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="text-primary-600" size={24} />
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Autenticação de Dois Fatores</h1>
          <p className="text-sm text-neutral-500">Proteja sua conta com MFA/TOTP</p>
        </div>
      </div>

      {/* Status atual */}
      <div className={`rounded-xl border p-5 mb-6 flex items-center gap-4 ${
        mfaStatus === 'active'
          ? 'bg-green-50 border-green-200'
          : 'bg-neutral-50 border-neutral-200'
      }`}>
        {mfaStatus === 'active'
          ? <CheckCircle className="text-green-500 shrink-0" size={28} />
          : <XCircle className="text-neutral-400 shrink-0" size={28} />}
        <div>
          <p className="font-semibold text-neutral-900">
            MFA {mfaStatus === 'active' ? 'Ativo' : 'Inativo'}
          </p>
          <p className="text-sm text-neutral-600">
            {mfaStatus === 'active'
              ? 'Sua conta está protegida com autenticação de dois fatores.'
              : 'Recomendamos ativar o MFA para maior segurança.'}
          </p>
        </div>
      </div>

      {/* Mensagens */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4 flex items-center gap-2">
          <CheckCircle size={16} /> {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4 flex items-center gap-2">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Idle — botões de ação */}
      {step === 'idle' && (
        <div>
          {mfaStatus === 'inactive' && (
            <button
              onClick={startSetup}
              disabled={loading}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <Smartphone size={18} />
              Ativar MFA com Autenticador
            </button>
          )}
          {mfaStatus === 'active' && (
            <button
              onClick={() => { setStep('disable'); setError('') }}
              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-6 py-3 rounded-lg font-medium flex items-center gap-2"
            >
              <XCircle size={18} />
              Desativar MFA
            </button>
          )}
        </div>
      )}

      {/* Setup — QR Code */}
      {step === 'setup' && (
        <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-6">
          <h2 className="font-semibold text-neutral-900 text-lg">Configure o autenticador</h2>

          <div className="space-y-3 text-sm text-neutral-700">
            <p><strong>1.</strong> Instale o <strong>Google Authenticator</strong> ou <strong>Authy</strong> no seu celular.</p>
            <p><strong>2.</strong> Escaneie o QR code abaixo com o app:</p>
          </div>

          {qrCode && (
            <div className="flex justify-center">
              <div className="border-4 border-white shadow-lg rounded-xl overflow-hidden">
                <img src={qrCode} alt="QR Code MFA" width={200} height={200} />
              </div>
            </div>
          )}

          <div className="bg-neutral-50 rounded-lg p-3 text-center">
            <p className="text-xs text-neutral-500 mb-1">Ou insira o código manualmente:</p>
            <code className="text-sm font-mono font-bold text-neutral-800 tracking-widest break-all">
              {secret}
            </code>
          </div>

          <div className="space-y-2 text-sm text-neutral-700">
            <p><strong>3.</strong> Digite o código de 6 dígitos gerado pelo app para confirmar:</p>
          </div>

          <form onSubmit={handleEnable} className="flex gap-3">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="flex-1 px-4 py-3 border border-neutral-300 rounded-lg text-center text-xl font-mono tracking-widest focus:ring-2 focus:ring-primary-500"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-400 text-white px-6 py-3 rounded-lg font-medium"
            >
              {loading ? '...' : 'Ativar'}
            </button>
          </form>

          <button
            onClick={() => { setStep('idle'); setError(''); setCode('') }}
            className="text-sm text-neutral-500 hover:text-neutral-700"
          >
            ← Cancelar
          </button>
        </div>
      )}

      {/* Disable — confirmar com código */}
      {step === 'disable' && (
        <div className="bg-white border border-red-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-neutral-900">Desativar MFA</h2>
          <p className="text-sm text-neutral-600">
            Digite o código atual do seu autenticador para confirmar a desativação.
          </p>
          <form onSubmit={handleDisable} className="flex gap-3">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="flex-1 px-4 py-3 border border-neutral-300 rounded-lg text-center text-xl font-mono tracking-widest focus:ring-2 focus:ring-red-500"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="bg-red-600 hover:bg-red-700 disabled:bg-neutral-400 text-white px-6 py-3 rounded-lg font-medium"
            >
              {loading ? '...' : 'Desativar'}
            </button>
          </form>
          <button
            onClick={() => { setStep('idle'); setError(''); setCode('') }}
            className="text-sm text-neutral-500 hover:text-neutral-700"
          >
            ← Cancelar
          </button>
        </div>
      )}
    </div>
  )
}
