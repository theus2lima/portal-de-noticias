import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createClient } from '@/utils/supabase/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    console.log('📧 Login attempt:', { email, password: '***' })

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Criar cliente Supabase
    const supabase = await createClient()

    // Buscar usuário no banco de dados
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single()
    
    console.log('🔍 User query result:', { user: user ? 'found' : 'not found', error: error?.message })

    if (error || !user) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // Verificar se o usuário tem permissão de admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem fazer login.' },
        { status: 403 }
      )
    }

    // Verificar senha - USO TEMPORÁRIO APENAS PARA DESENVOLVIMENTO
    console.log('🔐 Password verification:', { 
      providedPassword: password, 
      expectedEmail: 'admin@portalnoticias.com.br',
      expectedPassword: 'admin123'
    })
    
    // Verificação simples apenas para usuário temporário
    let isValidPassword = false;
    if (user.email === 'admin@portalnoticias.com.br' && password === 'admin123') {
      isValidPassword = true;
    } else {
      // Para outros casos (quando Supabase estiver configurado), usar bcrypt
      isValidPassword = await bcrypt.compare(password, user.password_hash)
    }
    
    console.log('🔍 Password valid:', isValidPassword)
    
    if (!isValidPassword) {
      console.log('❌ Password verification failed')
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }
    
    console.log('✅ Login successful!')

    // Gerar JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Retornar dados do usuário (sem senha) e token
    const { password_hash, ...userWithoutPassword } = user

    return NextResponse.json({
      user: userWithoutPassword,
      token
    })

  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
