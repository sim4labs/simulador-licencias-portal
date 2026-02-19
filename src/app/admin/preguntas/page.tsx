'use client'

import { useState, useEffect, useMemo } from 'react'
import { adminApi } from '@/lib/admin-api'
import type { QuestionResponse } from '@/lib/adapters'
import { DataTable } from '@/components/admin/DataTable'
import { Badge, categoryVariant, difficultyVariant } from '@/components/admin/Badge'
import { Tabs } from '@/components/admin/Tabs'
import { Modal } from '@/components/admin/Modal'
import { StatCard } from '@/components/admin/StatCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/admin/Textarea'
import { Plus, Pencil, Trash2, HelpCircle } from 'lucide-react'

const CATEGORIES = [
  { id: 'todas', label: 'Todas' },
  { id: 'general', label: 'General' },
  { id: 'motocicleta', label: 'Motocicleta' },
  { id: 'particular', label: 'Particular' },
  { id: 'publico', label: 'Público' },
  { id: 'carga', label: 'Carga' },
]

const DIFFICULTY_OPTIONS = [
  { id: 'all', label: 'Todas' },
  { id: 'medio', label: 'Medio' },
  { id: 'avanzado', label: 'Avanzado' },
]

const emptyQuestion: QuestionResponse = {
  questionId: '',
  question: '',
  options: ['', '', '', ''],
  correctAnswer: 0,
  explanation: '',
  category: 'general',
  difficulty: 'medio',
}

export default function PreguntasPage() {
  const [questions, setQuestions] = useState<QuestionResponse[]>([])
  const [categoryTab, setCategoryTab] = useState('todas')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [editModal, setEditModal] = useState(false)
  const [editQuestion, setEditQuestion] = useState<QuestionResponse>(emptyQuestion)
  const [isNew, setIsNew] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<QuestionResponse | null>(null)
  const [stats, setStats] = useState<{ total: number; byCategory: Record<string, number>; byDifficulty: Record<string, number> }>({ total: 0, byCategory: {}, byDifficulty: {} })

  const reload = async () => {
    const { data } = await adminApi.listarPreguntas()
    if (data) {
      setQuestions(data)
      const byCategory: Record<string, number> = {}
      const byDifficulty: Record<string, number> = {}
      for (const q of data) {
        byCategory[q.category] = (byCategory[q.category] || 0) + 1
        byDifficulty[q.difficulty] = (byDifficulty[q.difficulty] || 0) + 1
      }
      setStats({ total: data.length, byCategory, byDifficulty })
    }
  }

  useEffect(() => { reload() }, [])

  const filtered = useMemo(() => {
    return questions.filter(q => {
      if (categoryTab !== 'todas' && q.category !== categoryTab) return false
      if (difficultyFilter !== 'all' && q.difficulty !== difficultyFilter) return false
      return true
    })
  }, [questions, categoryTab, difficultyFilter])

  const openNew = () => {
    setEditQuestion({ ...emptyQuestion })
    setIsNew(true)
    setEditModal(true)
  }

  const openEdit = (q: QuestionResponse) => {
    setEditQuestion({ ...q, options: [...q.options] })
    setIsNew(false)
    setEditModal(true)
  }

  const handleSave = async () => {
    if (!editQuestion.question.trim() || editQuestion.options.some((o: string) => !o.trim())) return
    if (isNew) {
      await adminApi.crearPregunta({
        question: editQuestion.question,
        options: editQuestion.options,
        correctAnswer: editQuestion.correctAnswer,
        explanation: editQuestion.explanation,
        category: editQuestion.category,
        difficulty: editQuestion.difficulty,
      })
    } else {
      await adminApi.actualizarPregunta(editQuestion.questionId, editQuestion)
    }
    setEditModal(false)
    reload()
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    await adminApi.eliminarPregunta(deleteConfirm.questionId)
    setDeleteConfirm(null)
    reload()
  }

  const columns = [
    { key: 'id', header: 'ID', render: (q: QuestionResponse) => <span className="font-mono text-xs">{q.questionId}</span>, className: 'w-28' },
    {
      key: 'question', header: 'Pregunta', render: (q: QuestionResponse) => (
        <span className="text-sm line-clamp-2">{q.question}</span>
      ),
    },
    {
      key: 'category', header: 'Categoría', render: (q: QuestionResponse) => (
        <Badge variant={categoryVariant[q.category]}>{q.category}</Badge>
      ),
      className: 'w-28',
    },
    {
      key: 'difficulty', header: 'Dificultad', render: (q: QuestionResponse) => (
        <Badge variant={difficultyVariant[q.difficulty]}>{q.difficulty}</Badge>
      ),
      className: 'w-24',
    },
    {
      key: 'actions', header: 'Acciones', render: (q: QuestionResponse) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => openEdit(q)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(q)}>
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
      ),
      className: 'w-24',
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Banco de Preguntas</h1>
        <div className="flex gap-2">
          <Button size="sm" onClick={openNew}>
            <Plus className="h-4 w-4 mr-1" /> Nueva Pregunta
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <StatCard label="Total" value={stats.total} icon={HelpCircle} />
        {Object.entries(stats.byCategory).map(([cat, count]) => (
          <div key={cat} className="bg-white rounded-lg shadow p-3">
            <p className="text-xs text-gray-500 capitalize">{cat}</p>
            <p className="text-lg font-bold">{count}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <Tabs tabs={CATEGORIES} activeTab={categoryTab} onChange={setCategoryTab} />
        <select
          className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white"
          value={difficultyFilter}
          onChange={e => setDifficultyFilter(e.target.value)}
        >
          {DIFFICULTY_OPTIONS.map(d => (
            <option key={d.id} value={d.id}>{d.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow">
        <DataTable columns={columns} data={filtered} keyExtractor={q => q.questionId} emptyMessage="No hay preguntas en esta categoría" />
      </div>

      {/* Edit/Add Modal */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title={isNew ? 'Nueva Pregunta' : 'Editar Pregunta'} className="max-w-2xl">
        <div className="space-y-4">
          <Textarea
            label="Pregunta"
            value={editQuestion.question}
            onChange={e => setEditQuestion({ ...editQuestion, question: e.target.value })}
            rows={2}
          />
          {editQuestion.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name="correct"
                checked={editQuestion.correctAnswer === i}
                onChange={() => setEditQuestion({ ...editQuestion, correctAnswer: i })}
                className="text-primary focus:ring-primary"
              />
              <Input
                placeholder={`Opción ${i + 1}`}
                value={opt}
                onChange={e => {
                  const opts = [...editQuestion.options]
                  opts[i] = e.target.value
                  setEditQuestion({ ...editQuestion, options: opts })
                }}
              />
            </div>
          ))}
          <Textarea
            label="Explicación"
            value={editQuestion.explanation}
            onChange={e => setEditQuestion({ ...editQuestion, explanation: e.target.value })}
            rows={2}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 bg-white"
                value={editQuestion.category}
                onChange={e => setEditQuestion({ ...editQuestion, category: e.target.value })}
              >
                <option value="general">General</option>
                <option value="motocicleta">Motocicleta</option>
                <option value="particular">Particular</option>
                <option value="publico">Público</option>
                <option value="carga">Carga</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dificultad</label>
              <select
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 bg-white"
                value={editQuestion.difficulty}
                onChange={e => setEditQuestion({ ...editQuestion, difficulty: e.target.value })}
              >
                <option value="medio">Medio</option>
                <option value="avanzado">Avanzado</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setEditModal(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar</Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Eliminar Pregunta">
        {deleteConfirm && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">¿Eliminar esta pregunta?</p>
            <p className="text-sm font-medium">{deleteConfirm.question}</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
              <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
