'use client'

import { useState } from 'react'
import { Modal } from './Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Textarea } from './Textarea'
import { Label } from '@/components/ui/Label'
import { useCreateBug } from '@/lib/bugs-queries'
import { uploadBugImage, type BugOrigin } from '@/lib/bugs-api'
import { Image as ImageIcon, X, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

const ORIGINS: Array<{ value: BugOrigin; label: string }> = [
  { value: 'portal-admin', label: 'Portal administrativo' },
  { value: 'portal-ciudadano', label: 'Portal ciudadano' },
  { value: 'simulador-manejo', label: 'Simulador (Manejo)' },
]

interface PendingImage {
  id: string
  file: File
  previewUrl: string
  status: 'uploading' | 'done' | 'error'
  publicUrl?: string
  error?: string
}

export function CreateBugDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter()
  const [origin, setOrigin] = useState<BugOrigin>('portal-admin')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<PendingImage[]>([])
  const [submitError, setSubmitError] = useState<string | null>(null)
  const createBug = useCreateBug()

  const reset = () => {
    setOrigin('portal-admin')
    setTitle('')
    setDescription('')
    setImages([])
    setSubmitError(null)
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files) return
    const newPending: PendingImage[] = []
    for (const file of Array.from(files)) {
      const id = `${Date.now()}-${file.name}`
      newPending.push({
        id,
        file,
        previewUrl: URL.createObjectURL(file),
        status: 'uploading',
      })
    }
    setImages((prev) => [...prev, ...newPending])
    for (const pending of newPending) {
      try {
        const publicUrl = await uploadBugImage(pending.file)
        setImages((prev) =>
          prev.map((p) => (p.id === pending.id ? { ...p, status: 'done', publicUrl } : p)),
        )
      } catch (err: any) {
        setImages((prev) =>
          prev.map((p) => (p.id === pending.id ? { ...p, status: 'error', error: err?.message ?? 'falló' } : p)),
        )
      }
    }
  }

  const removeImage = (id: string) => {
    setImages((prev) => {
      const found = prev.find((p) => p.id === id)
      if (found) URL.revokeObjectURL(found.previewUrl)
      return prev.filter((p) => p.id !== id)
    })
  }

  const stillUploading = images.some((i) => i.status === 'uploading')
  const canSubmit = !!title.trim() && !!description.trim() && !stillUploading && !createBug.isPending

  const handleSubmit = async () => {
    setSubmitError(null)
    const imageUrls = images.filter((i) => i.status === 'done' && i.publicUrl).map((i) => i.publicUrl!)
    try {
      const created = await createBug.mutateAsync({
        origin,
        title: title.trim(),
        description: description.trim(),
        imageUrls,
      })
      reset()
      onClose()
      router.push(`/admin/bugs/${created.owner}/${created.repo}/${created.number}`)
    } catch (err: any) {
      setSubmitError(err?.message ?? 'No se pudo crear el bug')
    }
  }

  return (
    <Modal open={open} onClose={() => { if (!createBug.isPending) { reset(); onClose() } }} title="Reportar nuevo bug" className="max-w-2xl">
      <div className="space-y-4">
        <div>
          <Label className="mb-2 block">Origen <span className="text-red-500">*</span></Label>
          <div className="grid grid-cols-3 gap-2">
            {ORIGINS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setOrigin(o.value)}
                className={`px-3 py-2 rounded-md border text-sm transition-colors ${
                  origin === o.value
                    ? 'border-primary bg-primary/10 text-primary-700 font-medium'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Título"
          required
          placeholder="Resumen corto del bug"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
        />

        <Textarea
          label="Descripción"
          required
          placeholder="Qué pasó, qué esperabas que pasara, pasos para reproducir..."
          rows={6}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div>
          <Label className="mb-2 block">Imágenes (opcional)</Label>
          <label className="flex items-center gap-2 cursor-pointer text-sm px-3 py-2 border border-dashed border-gray-300 rounded-md hover:bg-gray-50 w-fit">
            <ImageIcon className="h-4 w-4" />
            Agregar capturas
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
          {images.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {images.map((img) => (
                <div key={img.id} className="relative aspect-video bg-gray-100 rounded-md overflow-hidden group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.previewUrl} alt="" className="w-full h-full object-cover" />
                  {img.status === 'uploading' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Loader2 className="h-5 w-5 text-white animate-spin" />
                    </div>
                  )}
                  {img.status === 'error' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-500/70 text-white text-xs px-2 text-center">
                      {img.error}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Quitar imagen"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {submitError && <p className="text-sm text-red-600">{submitError}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => { reset(); onClose() }} disabled={createBug.isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit} isLoading={createBug.isPending}>
            Reportar bug
          </Button>
        </div>
      </div>
    </Modal>
  )
}
