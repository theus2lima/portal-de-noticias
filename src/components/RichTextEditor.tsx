'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TipTapLink from '@tiptap/extension-link'
import TipTapImage from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Color from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import Youtube from '@tiptap/extension-youtube'
import { Node, mergeAttributes } from '@tiptap/core'
import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link as LinkIcon, Image as ImageIcon, Youtube as YoutubeIcon,
  Highlighter, Minus, Quote, Undo, Redo, Type,
  Video, Music, LayoutGrid, X, ExternalLink
} from 'lucide-react'

// ─── Custom Node: MediaEmbed (Vimeo, Instagram, Flickr, generic iframe) ───────
const MediaEmbed = Node.create({
  name: 'mediaEmbed',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      embedType: { default: 'video' }, // video | flickr
      height: { default: 400 },
      title: { default: '' },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-media-embed]' }]
  },

  renderHTML({ node }) {
    const { src, embedType, height, title } = node.attrs
    return [
      'div',
      { 'data-media-embed': embedType, class: 'my-6 rounded-lg overflow-hidden' },
      [
        'iframe',
        {
          src,
          width: '100%',
          height: String(height),
          frameborder: '0',
          allowfullscreen: 'true',
          title: title || embedType,
          class: 'w-full rounded-lg',
        },
      ],
    ]
  },

  addNodeView() {
    return ({ node }) => {
      const wrapper = document.createElement('div')
      wrapper.setAttribute('data-media-embed', node.attrs.embedType)
      wrapper.className = 'my-6 rounded-lg overflow-hidden bg-gray-100 border border-gray-200'
      wrapper.style.position = 'relative'
      wrapper.style.paddingBottom = '56.25%'
      wrapper.style.height = '0'

      const iframe = document.createElement('iframe')
      iframe.src = node.attrs.src || ''
      iframe.width = '100%'
      iframe.style.position = 'absolute'
      iframe.style.top = '0'
      iframe.style.left = '0'
      iframe.style.width = '100%'
      iframe.style.height = '100%'
      iframe.frameBorder = '0'
      iframe.allowFullscreen = true
      iframe.title = node.attrs.title || ''

      wrapper.appendChild(iframe)

      return { dom: wrapper }
    }
  },
})

// ─── Custom Node: AudioEmbed ──────────────────────────────────────────────────
const AudioEmbed = Node.create({
  name: 'audioEmbed',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      title: { default: 'Áudio' },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-audio-embed]' }]
  },

  renderHTML({ node }) {
    return [
      'div',
      { 'data-audio-embed': 'true', class: 'my-6 p-4 bg-neutral-100 rounded-lg border border-neutral-200' },
      ['p', { class: 'text-sm font-medium text-neutral-600 mb-2' }, node.attrs.title],
      ['audio', { src: node.attrs.src, controls: 'true', class: 'w-full' }],
    ]
  },

  addNodeView() {
    return ({ node }) => {
      const wrapper = document.createElement('div')
      wrapper.setAttribute('data-audio-embed', 'true')
      wrapper.className = 'my-6 p-4 bg-neutral-100 rounded-lg border border-neutral-200'

      const label = document.createElement('p')
      label.className = 'text-sm font-medium text-neutral-600 mb-2'
      label.textContent = node.attrs.title || 'Áudio'

      const audio = document.createElement('audio')
      audio.src = node.attrs.src || ''
      audio.controls = true
      audio.className = 'w-full'

      wrapper.appendChild(label)
      wrapper.appendChild(audio)

      return { dom: wrapper }
    }
  },
})

// ─── Helper: parse media URL ──────────────────────────────────────────────────
function parseMediaUrl(url: string): { embedUrl: string; type: string; title: string } | null {
  try {
    const u = new URL(url.trim())

    // YouTube
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
      let id = u.searchParams.get('v') || u.pathname.split('/').pop() || ''
      return { embedUrl: `https://www.youtube.com/embed/${id}`, type: 'video', title: 'YouTube' }
    }

    // Vimeo
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean).pop() || ''
      return { embedUrl: `https://player.vimeo.com/video/${id}`, type: 'video', title: 'Vimeo' }
    }

    // Flickr album
    if (u.hostname.includes('flickr.com')) {
      const parts = u.pathname.split('/').filter(Boolean)
      // /photos/user/albums/albumId
      const albumsIndex = parts.indexOf('albums')
      if (albumsIndex !== -1 && parts[albumsIndex + 1]) {
        const albumId = parts[albumsIndex + 1]
        return {
          embedUrl: `https://embedr.flickr.com/photosets/${albumId}`,
          type: 'flickr',
          title: 'Galeria Flickr',
        }
      }
      // /photos/user/sets/albumId
      const setsIndex = parts.indexOf('sets')
      if (setsIndex !== -1 && parts[setsIndex + 1]) {
        const albumId = parts[setsIndex + 1]
        return {
          embedUrl: `https://embedr.flickr.com/photosets/${albumId}`,
          type: 'flickr',
          title: 'Galeria Flickr',
        }
      }
    }

    // Instagram
    if (u.hostname.includes('instagram.com')) {
      // Instagram blocks iframes; use their official embed
      const postPath = u.pathname.replace(/\/$/, '')
      return {
        embedUrl: `https://www.instagram.com${postPath}/embed/`,
        type: 'video',
        title: 'Instagram',
      }
    }

    return null
  } catch {
    return null
  }
}

// ─── Toolbar Button ───────────────────────────────────────────────────────────
function ToolbarBtn({
  onClick, active, disabled, title, children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? 'bg-primary-100 text-primary-700'
          : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
      } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-5 bg-neutral-200 mx-0.5" />
}

// ─── Modal genérico ───────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-neutral-900">{title}</h3>
          <button type="button" onClick={onClose} className="p-1 rounded hover:bg-neutral-100">
            <X size={18} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
}

// ─── Main Editor Component ────────────────────────────────────────────────────
export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Escreva o conteúdo do artigo aqui...',
  minHeight = 400,
}: RichTextEditorProps) {
  // Dialogs
  const [linkDialog, setLinkDialog] = useState(false)
  const [imageDialog, setImageDialog] = useState(false)
  const [videoDialog, setVideoDialog] = useState(false)
  const [audioDialog, setAudioDialog] = useState(false)
  const [flickrDialog, setFlickrDialog] = useState(false)

  // Dialog inputs
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [audioUrl, setAudioUrl] = useState('')
  const [audioTitle, setAudioTitle] = useState('')
  const [flickrUrl, setFlickrUrl] = useState('')
  const [colorValue, setColorValue] = useState('#000000')

  const colorInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TipTapLink.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-primary-600 underline hover:text-primary-700', target: '_blank' },
      }),
      TipTapImage.configure({
        HTMLAttributes: { class: 'rounded-lg max-w-full my-4' },
        allowBase64: true,
      }),
      Youtube.configure({
        width: 720,
        height: 405,
        HTMLAttributes: { class: 'rounded-lg overflow-hidden my-4 w-full' },
      }),
      MediaEmbed,
      AudioEmbed,
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-neutral max-w-none focus:outline-none p-4',
        style: `min-height: ${minHeight}px`,
      },
    },
  })

  // Sync external value changes (e.g., loading existing article in edit page)
  const isFirstLoad = useRef(true)
  useEffect(() => {
    if (editor && value && isFirstLoad.current && editor.isEmpty) {
      editor.commands.setContent(value, false)
      isFirstLoad.current = false
    }
  }, [editor, value])

  // ── Actions ──────────────────────────────────────────────────────────────────

  const insertLink = useCallback(() => {
    if (!editor || !linkUrl) return
    const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`
    if (linkText) {
      editor.chain().focus().insertContent(`<a href="${url}">${linkText}</a>`).run()
    } else {
      editor.chain().focus().setLink({ href: url }).run()
    }
    setLinkDialog(false)
    setLinkUrl('')
    setLinkText('')
  }, [editor, linkUrl, linkText])

  const insertImage = useCallback(() => {
    if (!editor || !imageUrl) return
    editor.chain().focus().setImage({ src: imageUrl, alt: imageAlt }).run()
    setImageDialog(false)
    setImageUrl('')
    setImageAlt('')
  }, [editor, imageUrl, imageAlt])

  const insertVideo = useCallback(() => {
    if (!editor || !videoUrl) return

    // Try YouTube first (native TipTap extension)
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      editor.chain().focus().setYoutubeVideo({ src: videoUrl }).run()
      setVideoDialog(false)
      setVideoUrl('')
      return
    }

    const parsed = parseMediaUrl(videoUrl)
    if (!parsed) {
      alert('URL não reconhecida. Suporte: YouTube, Vimeo, Instagram.')
      return
    }

    editor.chain().focus().insertContent({
      type: 'mediaEmbed',
      attrs: { src: parsed.embedUrl, embedType: parsed.type, height: 400, title: parsed.title },
    }).run()

    setVideoDialog(false)
    setVideoUrl('')
  }, [editor, videoUrl])

  const insertAudio = useCallback(() => {
    if (!editor || !audioUrl) return
    editor.chain().focus().insertContent({
      type: 'audioEmbed',
      attrs: { src: audioUrl, title: audioTitle || 'Áudio' },
    }).run()
    setAudioDialog(false)
    setAudioUrl('')
    setAudioTitle('')
  }, [editor, audioUrl, audioTitle])

  const insertFlickr = useCallback(() => {
    if (!editor || !flickrUrl) return
    const parsed = parseMediaUrl(flickrUrl)
    if (!parsed || parsed.type !== 'flickr') {
      alert('Cole a URL do álbum Flickr. Formato: flickr.com/photos/.../albums/...')
      return
    }
    editor.chain().focus().insertContent({
      type: 'mediaEmbed',
      attrs: { src: parsed.embedUrl, embedType: 'flickr', height: 500, title: 'Galeria Flickr' },
    }).run()
    setFlickrDialog(false)
    setFlickrUrl('')
  }, [editor, flickrUrl])

  if (!editor) return null

  return (
    <div className="border border-neutral-300 rounded-xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500">
      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-neutral-200 bg-neutral-50">
        {/* History */}
        <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Desfazer">
          <Undo size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Refazer">
          <Redo size={15} />
        </ToolbarBtn>

        <Divider />

        {/* Headings */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Título H1">
          <Heading1 size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Título H2">
          <Heading2 size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Título H3">
          <Heading3 size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive('paragraph')} title="Parágrafo">
          <Type size={15} />
        </ToolbarBtn>

        <Divider />

        {/* Format */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Negrito (Ctrl+B)">
          <Bold size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Itálico (Ctrl+I)">
          <Italic size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Sublinhado (Ctrl+U)">
          <UnderlineIcon size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Tachado">
          <Strikethrough size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="Destacar texto">
          <Highlighter size={15} />
        </ToolbarBtn>

        <Divider />

        {/* Color */}
        <div className="relative" title="Cor do texto">
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); colorInputRef.current?.click() }}
            className="p-1.5 rounded hover:bg-neutral-100 transition-colors flex flex-col items-center"
          >
            <span style={{ fontSize: 13, fontWeight: 'bold', color: colorValue }}>A</span>
            <span className="w-4 h-1 rounded-sm mt-0.5" style={{ backgroundColor: colorValue }} />
          </button>
          <input
            ref={colorInputRef}
            type="color"
            value={colorValue}
            onChange={(e) => {
              setColorValue(e.target.value)
              editor.chain().focus().setColor(e.target.value).run()
            }}
            className="absolute opacity-0 w-0 h-0"
          />
        </div>

        <Divider />

        {/* Lists */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Lista com marcadores">
          <List size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Lista numerada">
          <ListOrdered size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Citação">
          <Quote size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Linha horizontal">
          <Minus size={15} />
        </ToolbarBtn>

        <Divider />

        {/* Alignment */}
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Alinhar à esquerda">
          <AlignLeft size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Centralizar">
          <AlignCenter size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Alinhar à direita">
          <AlignRight size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justificar">
          <AlignJustify size={15} />
        </ToolbarBtn>

        <Divider />

        {/* Insert media */}
        <ToolbarBtn onClick={() => { setLinkUrl(editor.getAttributes('link').href || ''); setLinkDialog(true) }} active={editor.isActive('link')} title="Inserir link">
          <LinkIcon size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => setImageDialog(true)} title="Inserir imagem">
          <ImageIcon size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => setVideoDialog(true)} title="Inserir vídeo (YouTube, Vimeo, Instagram)">
          <YoutubeIcon size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => setFlickrDialog(true)} title="Inserir galeria Flickr">
          <LayoutGrid size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => setAudioDialog(true)} title="Inserir áudio">
          <Music size={15} />
        </ToolbarBtn>
      </div>

      {/* ── Editor Area ─────────────────────────────────────────────────────── */}
      <EditorContent editor={editor} />

      {/* ── Char / word count ───────────────────────────────────────────────── */}
      <div className="px-4 py-2 border-t border-neutral-100 text-xs text-neutral-400 flex gap-4">
        <span>{editor.storage.characterCount?.characters?.() ?? editor.getText().length} caracteres</span>
        <span>{editor.getText().trim().split(/\s+/).filter(Boolean).length} palavras</span>
      </div>

      {/* ═══════════════════════════════ MODALS ════════════════════════════════ */}

      {/* Link */}
      {linkDialog && (
        <Modal title="Inserir Link" onClose={() => setLinkDialog(false)}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">URL *</label>
              <input
                autoFocus
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://exemplo.com"
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Texto (opcional)</label>
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Texto do link (se selecionado, ignora)"
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              {editor.isActive('link') && (
                <button type="button" onClick={() => { editor.chain().focus().unsetLink().run(); setLinkDialog(false) }}
                  className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                  Remover link
                </button>
              )}
              <button type="button" onClick={() => setLinkDialog(false)} className="px-3 py-2 text-sm border border-neutral-300 rounded-lg">Cancelar</button>
              <button type="button" onClick={insertLink} className="px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">Inserir</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Image */}
      {imageDialog && (
        <Modal title="Inserir Imagem" onClose={() => setImageDialog(false)}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">URL da imagem *</label>
              <input
                autoFocus
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Descrição (alt)</label>
              <input
                type="text"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Descrição da imagem para acessibilidade"
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            {imageUrl && (
              <img src={imageUrl} alt="preview" className="max-h-32 rounded-lg object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
            )}
            <div className="flex gap-2 justify-end pt-2">
              <button type="button" onClick={() => setImageDialog(false)} className="px-3 py-2 text-sm border border-neutral-300 rounded-lg">Cancelar</button>
              <button type="button" onClick={insertImage} className="px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">Inserir</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Video */}
      {videoDialog && (
        <Modal title="Inserir Vídeo" onClose={() => setVideoDialog(false)}>
          <div className="space-y-3">
            <p className="text-sm text-neutral-500">Suporte: YouTube, Vimeo e Instagram Reels</p>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">URL do vídeo *</label>
              <input
                autoFocus
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=... ou vimeo.com/..."
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button type="button" onClick={() => setVideoDialog(false)} className="px-3 py-2 text-sm border border-neutral-300 rounded-lg">Cancelar</button>
              <button type="button" onClick={insertVideo} className="px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">Inserir</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Flickr */}
      {flickrDialog && (
        <Modal title="Inserir Galeria Flickr" onClose={() => setFlickrDialog(false)}>
          <div className="space-y-3">
            <p className="text-sm text-neutral-500">
              Cole a URL do álbum do Flickr.<br />
              Ex: <code className="bg-neutral-100 px-1 rounded text-xs">flickr.com/photos/usuario/albums/12345</code>
            </p>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">URL do álbum *</label>
              <input
                autoFocus
                type="url"
                value={flickrUrl}
                onChange={(e) => setFlickrUrl(e.target.value)}
                placeholder="https://www.flickr.com/photos/.../albums/..."
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button type="button" onClick={() => setFlickrDialog(false)} className="px-3 py-2 text-sm border border-neutral-300 rounded-lg">Cancelar</button>
              <button type="button" onClick={insertFlickr} className="px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">Inserir Galeria</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Audio */}
      {audioDialog && (
        <Modal title="Inserir Áudio" onClose={() => setAudioDialog(false)}>
          <div className="space-y-3">
            <p className="text-sm text-neutral-500">Cole a URL direta do arquivo de áudio (MP3, OGG, WAV, etc.)</p>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">URL do áudio *</label>
              <input
                autoFocus
                type="url"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="https://exemplo.com/audio.mp3"
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Título</label>
              <input
                type="text"
                value={audioTitle}
                onChange={(e) => setAudioTitle(e.target.value)}
                placeholder="Ex: Entrevista com o prefeito"
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button type="button" onClick={() => setAudioDialog(false)} className="px-3 py-2 text-sm border border-neutral-300 rounded-lg">Cancelar</button>
              <button type="button" onClick={insertAudio} className="px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">Inserir</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
