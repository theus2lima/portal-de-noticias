import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import { fileTypeFromBuffer } from 'file-type'
import { requireAuth } from '@/lib/auth'

// Tipos permitidos — validados por magic bytes, não por extensão
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: NextRequest) {
  // 🔐 Verificar autenticação
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  try {
    const formData = await request.formData()

    const singleFile = formData.get('image') as File | null
    const multipleFiles = formData.getAll('images') as File[]
    const files = singleFile ? [singleFile] : multipleFiles.filter(f => f instanceof File)

    if (files.length === 0) {
      return NextResponse.json({ error: 'Nenhum arquivo foi enviado' }, { status: 400 })
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const uploadedFiles = []

    for (const file of files) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // ✅ Verificar tamanho
      if (buffer.length > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `Arquivo ${file.name} muito grande. Máximo: 10MB` },
          { status: 400 }
        )
      }

      // ✅ Verificar tipo pelos magic bytes (não pode ser burlado renomeando)
      const detectedType = await fileTypeFromBuffer(buffer)
      if (!detectedType || !ALLOWED_MIME_TYPES.includes(detectedType.mime)) {
        return NextResponse.json(
          { error: `Arquivo ${file.name} não é uma imagem válida. Tipo detectado: ${detectedType?.mime ?? 'desconhecido'}` },
          { status: 400 }
        )
      }

      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
      const ext = detectedType.ext // usar extensão real detectada
      const filename = `image-${uniqueSuffix}.${ext}`
      const filePath = path.join(uploadDir, filename)

      await fs.promises.writeFile(filePath, buffer)

      uploadedFiles.push({
        url: `/uploads/${filename}`,
        filename,
        originalName: file.name,
        size: buffer.length,
        type: detectedType.mime,
      })
    }

    if (singleFile) {
      return NextResponse.json({ success: true, message: 'Upload realizado com sucesso!', data: uploadedFiles[0] })
    } else {
      return NextResponse.json({ success: true, message: `${uploadedFiles.length} arquivo(s) enviado(s) com sucesso!`, data: uploadedFiles })
    }
  } catch (error) {
    console.error('Erro no upload:', error)
    return NextResponse.json({ error: 'Erro interno do servidor durante upload' }, { status: 500 })
  }
}

// Permitir apenas POST
export async function GET() {
  return NextResponse.json(
    { error: 'Método não permitido' },
    { status: 405 }
  )
}
