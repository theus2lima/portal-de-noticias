import { NextRequest, NextResponse } from 'next/server'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { promisify } from 'util'

// Configurar multer para armazenamento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    
    // Criar diretório se não existir
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    // Gerar nome único para evitar conflitos
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    cb(null, `image-${uniqueSuffix}${ext}`)
  }
})

// Filtro de arquivos para aceitar apenas imagens
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Aceitar apenas imagens
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('Apenas arquivos de imagem são permitidos!'))
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  }
})

// Promisificar o upload para usar com async/await
const uploadSingle = promisify(upload.single('image'))

export async function POST(request: NextRequest) {
  try {
    // Verificar se é multipart/form-data
    const contentType = request.headers.get('content-type')
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content-Type deve ser multipart/form-data' },
        { status: 400 }
      )
    }

    // Obter FormData
    const formData = await request.formData()
    
    // Verificar se é upload único ou múltiplo
    const singleFile = formData.get('image') as File | null
    const multipleFiles = formData.getAll('images') as File[]
    
    const files = singleFile ? [singleFile] : multipleFiles.filter(f => f instanceof File)
    
    if (files.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum arquivo foi enviado' },
        { status: 400 }
      )
    }

    // Criar diretório de upload se não existir
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const uploadedFiles = []
    
    for (const file of files) {
      // Validações de arquivo
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { error: `Arquivo ${file.name} não é uma imagem válida` },
          { status: 400 }
        )
      }

      if (file.size > 2 * 1024 * 1024) { // 2MB
        return NextResponse.json(
          { error: `Arquivo ${file.name} deve ter no máximo 2MB` },
          { status: 400 }
        )
      }

      // Gerar nome único para o arquivo
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      const ext = path.extname(file.name)
      const filename = `image-${uniqueSuffix}${ext}`

      // Salvar arquivo no disco
      const filePath = path.join(uploadDir, filename)
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      await fs.promises.writeFile(filePath, buffer)

      // Adicionar à lista de arquivos enviados
      uploadedFiles.push({
        url: `/uploads/${filename}`,
        filename: filename,
        originalName: file.name,
        size: file.size,
        type: file.type
      })
    }

    // Retornar resultado
    if (singleFile) {
      // Upload único - manter compatibilidade com código existente
      return NextResponse.json({
        success: true,
        message: 'Upload realizado com sucesso!',
        data: uploadedFiles[0]
      })
    } else {
      // Upload múltiplo
      return NextResponse.json({
        success: true,
        message: `${uploadedFiles.length} arquivo(s) enviado(s) com sucesso!`,
        data: uploadedFiles
      })
    }

  } catch (error) {
    console.error('Erro no upload:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('File too large')) {
        return NextResponse.json(
          { error: 'Arquivo muito grande. Máximo permitido: 2MB' },
          { status: 400 }
        )
      }
      
      if (error.message.includes('Apenas arquivos de imagem')) {
        return NextResponse.json(
          { error: 'Apenas arquivos de imagem são permitidos' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor durante upload' },
      { status: 500 }
    )
  }
}

// Permitir apenas POST
export async function GET() {
  return NextResponse.json(
    { error: 'Método não permitido' },
    { status: 405 }
  )
}
