'use client'

import { useState } from 'react'
import { User, Phone, MapPin, Mail, Send, CheckCircle } from 'lucide-react'

const LeadForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório'
    } else if (!/^\(?([0-9]{2})\)?[-. ]?([0-9]{4,5})[-. ]?([0-9]{4})$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Formato de telefone inválido'
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Cidade é obrigatória'
    } else if (formData.city.trim().length < 2) {
      newErrors.city = 'Cidade deve ter pelo menos 2 caracteres'
    }

    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const formErrors = validateForm()
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors)
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      // Aqui seria feita a chamada para a API
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsSubmitted(true)
        setFormData({ name: '', phone: '', city: '' })
      } else {
        throw new Error('Erro ao enviar formulário')
      }
    } catch (error) {
      console.error('Erro ao enviar lead:', error)
      setErrors({ submit: 'Erro ao enviar formulário. Tente novamente.' })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <section className="py-16 bg-gradient-to-br from-primary-900 to-secondary-600">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-xl p-8 shadow-2xl animate-fadeInUp">
              <CheckCircle className="mx-auto text-secondary-600 mb-6" size={64} />
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">
                Obrigado pelo seu interesse!
              </h2>
              <p className="text-lg text-neutral-600 mb-6">
                Seus dados foram cadastrados com sucesso. Em breve você receberá nossas principais notícias diretamente no seu WhatsApp.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="btn-outline"
                >
                  Cadastrar outro contato
                </button>
                <button 
                  onClick={() => window.location.href = '/'}
                  className="btn-primary"
                >
                  Voltar ao início
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gradient-to-br from-primary-900 to-secondary-600">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white">
              <div className="mb-8">
                <Mail className="text-secondary-400 mb-4" size={48} />
                <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                  Receba as principais notícias no seu WhatsApp
                </h2>
                <p className="text-xl text-white/90 leading-relaxed">
                  Cadastre-se gratuitamente e seja o primeiro a saber das notícias mais importantes do dia.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-secondary-500 rounded-full flex items-center justify-center">
                    <CheckCircle size={16} className="text-white" />
                  </div>
                  <span className="text-white/90">Notícias em tempo real</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-secondary-500 rounded-full flex items-center justify-center">
                    <CheckCircle size={16} className="text-white" />
                  </div>
                  <span className="text-white/90">Resumo das principais manchetes</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-secondary-500 rounded-full flex items-center justify-center">
                    <CheckCircle size={16} className="text-white" />
                  </div>
                  <span className="text-white/90">Sem spam, apenas conteúdo relevante</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-secondary-500 rounded-full flex items-center justify-center">
                    <CheckCircle size={16} className="text-white" />
                  </div>
                  <span className="text-white/90">Cancele quando quiser</span>
                </div>
              </div>
            </div>

            {/* Right Form */}
            <div className="bg-white rounded-xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6 text-center">
                Cadastre-se Gratuitamente
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nome */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-neutral-700 mb-2">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Seu nome completo"
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-colors duration-200 ${
                        errors.name 
                          ? 'border-red-500 focus:border-red-600' 
                          : 'border-neutral-300 focus:border-primary-500'
                      }`}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Telefone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-neutral-700 mb-2">
                    Telefone/WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="(11) 99999-9999"
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-colors duration-200 ${
                        errors.phone 
                          ? 'border-red-500 focus:border-red-600' 
                          : 'border-neutral-300 focus:border-primary-500'
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                {/* Cidade */}
                <div>
                  <label htmlFor="city" className="block text-sm font-semibold text-neutral-700 mb-2">
                    Cidade
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Sua cidade"
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-colors duration-200 ${
                        errors.city 
                          ? 'border-red-500 focus:border-red-600' 
                          : 'border-neutral-300 focus:border-primary-500'
                      }`}
                    />
                  </div>
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                  )}
                </div>

                {/* Submit Error */}
                {errors.submit && (
                  <div className="text-center">
                    <p className="text-sm text-red-600">{errors.submit}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-secondary-600 hover:bg-secondary-700 disabled:bg-secondary-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Cadastrando...</span>
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      <span>Cadastrar Agora</span>
                    </>
                  )}
                </button>
              </form>

              <p className="text-xs text-neutral-500 text-center mt-4">
                Ao se cadastrar, você concorda com nossa política de privacidade e termos de uso.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LeadForm
