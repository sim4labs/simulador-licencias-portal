'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProgressStepper } from '@/components/ProgressStepper'
import {
  getCurrentTramite,
  updateTramite,
  canProceedToStep,
  type Tramite,
} from '@/lib/tramite'
import {
  ChevronLeft,
  ChevronRight,
  Bike,
  Car,
  Bus,
  Truck,
  Check,
  X,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from 'lucide-react'
import {
  getQuestionsByLicenseType,
  calculateExamResult,
  Question,
} from '@/lib/examQuestions'

const LICENSE_TYPE_INFO: Record<string, { name: string; icon: typeof Bike }> = {
  motocicleta: { name: 'Motocicleta', icon: Bike },
  particular: { name: 'Vehículo Particular', icon: Car },
  publico: { name: 'Transporte Público', icon: Bus },
  carga: { name: 'Carga Pesada', icon: Truck },
}

const EXAM_CONFIG = {
  questionsCount: 20,
  timeLimit: 30 * 60,
  passingScore: 80,
}

function formatExamTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export default function ExamenPage() {
  const router = useRouter()
  const [tramite, setTramite] = useState<Tramite | null>(null)
  const [loading, setLoading] = useState(true)

  const [step, setStep] = useState<'instructions' | 'exam' | 'results'>('instructions')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<{ questionId: string; selectedAnswer: number }[]>([])
  const [timeRemaining, setTimeRemaining] = useState(EXAM_CONFIG.timeLimit)
  const [examResult, setExamResult] = useState<ReturnType<typeof calculateExamResult> | null>(null)
  const [showExplanation, setShowExplanation] = useState<string | null>(null)

  useEffect(() => {
    const t = getCurrentTramite()
    if (!t || !canProceedToStep(t, 3)) {
      router.replace('/solicitud')
      return
    }
    setTramite(t)
    setLoading(false)
  }, [router])

  const typeInfo = tramite?.licenseType ? LICENSE_TYPE_INFO[tramite.licenseType] : null
  const currentQuestion = questions[currentQuestionIndex]

  // Timer
  useEffect(() => {
    if (step !== 'exam' || timeRemaining <= 0) return
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [step, timeRemaining])

  // Auto-submit on time expiry
  useEffect(() => {
    if (step === 'exam' && timeRemaining === 0 && !examResult) {
      const result = calculateExamResult(answers, questions)
      setExamResult(result)
      setStep('results')
    }
  }, [timeRemaining, step, examResult, answers, questions])

  const handleStartExam = () => {
    if (!tramite?.licenseType) return
    const examQuestions = getQuestionsByLicenseType(tramite.licenseType, EXAM_CONFIG.questionsCount)
    setQuestions(examQuestions)
    setCurrentQuestionIndex(0)
    setAnswers([])
    setTimeRemaining(EXAM_CONFIG.timeLimit)
    setStep('exam')
  }

  const handleSelectAnswer = (answerIndex: number) => {
    const existingIdx = answers.findIndex((a) => a.questionId === currentQuestion.id)
    if (existingIdx >= 0) {
      const newAnswers = [...answers]
      newAnswers[existingIdx].selectedAnswer = answerIndex
      setAnswers(newAnswers)
    } else {
      setAnswers([...answers, { questionId: currentQuestion.id, selectedAnswer: answerIndex }])
    }
  }

  const handleFinishExam = () => {
    const result = calculateExamResult(answers, questions)
    setExamResult(result)
    setStep('results')

    if (tramite && result.passed) {
      updateTramite(tramite.id, {
        examResult: {
          passed: true,
          score: result.score,
          completedAt: new Date().toISOString(),
        },
        currentStep: 4,
        status: 'examen-aprobado',
      })
    }
  }

  const handleRetryExam = () => {
    setStep('instructions')
    setExamResult(null)
    setShowExplanation(null)
  }

  const handleContinue = () => {
    router.push('/agendar')
  }

  const currentAnswer = answers.find((a) => a.questionId === currentQuestion?.id)
  const answeredCount = answers.length
  const progress = (answeredCount / EXAM_CONFIG.questionsCount) * 100

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-500">Cargando...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/Flower-logo.svg"
              alt="Gobierno del Estado de Tlaxcala"
              width={50}
              height={50}
              className="h-12 w-auto"
              priority
            />
          </Link>
          {step === 'exam' ? (
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                timeRemaining < 300 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span className="font-mono font-medium">{formatExamTime(timeRemaining)}</span>
            </div>
          ) : (
            <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium">
              Volver al inicio
            </Link>
          )}
        </div>
      </header>

      <div className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {step !== 'exam' && <ProgressStepper currentStep={3} className="mb-8" />}

          {/* Instructions */}
          {step === 'instructions' && (
            <div>
              {tramite && (
                <div className="bg-primary-50 rounded-lg p-3 mb-6 text-center">
                  <p className="text-sm text-primary-700">
                    Trámite <span className="font-semibold">{tramite.id}</span> — {tramite.personalData.nombre} {tramite.personalData.apellidoPaterno}
                  </p>
                </div>
              )}

              <Card padding="lg" className="max-w-2xl mx-auto">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    {typeInfo && <typeInfo.icon className="w-8 h-8 text-primary-600" />}
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Examen para Licencia de {typeInfo?.name}
                  </h1>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-amber-800 mb-2">Instrucciones del Examen</h3>
                      <ul className="text-sm text-amber-700 space-y-1.5">
                        <li>
                          El examen consta de <strong>{EXAM_CONFIG.questionsCount} preguntas</strong> de opción múltiple.
                        </li>
                        <li>
                          Tienes <strong>{EXAM_CONFIG.timeLimit / 60} minutos</strong> para completarlo.
                        </li>
                        <li>
                          Necesitas <strong>{EXAM_CONFIG.passingScore}% de aciertos</strong> para aprobar.
                        </li>
                        <li>
                          Las preguntas incluyen temas generales y específicos para {typeInfo?.name.toLowerCase()}.
                        </li>
                        <li>Puedes navegar entre preguntas y cambiar tus respuestas antes de finalizar.</li>
                        <li>
                          El examen se basa en la <strong>Ley de Movilidad y Seguridad Vial del Estado de Tlaxcala</strong>.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-primary-600">{EXAM_CONFIG.questionsCount}</div>
                    <div className="text-sm text-gray-600">Preguntas</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-primary-600">{EXAM_CONFIG.timeLimit / 60}</div>
                    <div className="text-sm text-gray-600">Minutos</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-primary-600">{EXAM_CONFIG.passingScore}%</div>
                    <div className="text-sm text-gray-600">Para aprobar</div>
                  </div>
                </div>

                <Button onClick={handleStartExam} className="w-full" size="lg">
                  Iniciar Examen
                </Button>
              </Card>
            </div>
          )}

          {/* Exam */}
          {step === 'exam' && currentQuestion && (
            <div>
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>
                    Pregunta {currentQuestionIndex + 1} de {questions.length}
                  </span>
                  <span>{answeredCount} respondidas</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6 justify-center">
                {questions.map((q, index) => {
                  const isAnswered = answers.some((a) => a.questionId === q.id)
                  const isCurrent = index === currentQuestionIndex
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        isCurrent
                          ? 'bg-primary-600 text-white'
                          : isAnswered
                            ? 'bg-primary-100 text-primary-700 border border-primary-300'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {index + 1}
                    </button>
                  )
                })}
              </div>

              <Card padding="lg">
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      currentQuestion.difficulty === 'avanzado'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {currentQuestion.difficulty === 'avanzado' ? 'Avanzado' : 'Medio'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {currentQuestion.category === 'general' ? 'General' : typeInfo?.name}
                  </span>
                </div>

                <h2 className="text-lg font-semibold text-gray-900 mb-6">{currentQuestion.question}</h2>

                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = currentAnswer?.selectedAnswer === index
                    return (
                      <button
                        key={index}
                        onClick={() => handleSelectAnswer(index)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start">
                          <span
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 ${
                              isSelected ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-300'
                            }`}
                          >
                            {isSelected && <Check className="w-4 h-4" />}
                          </span>
                          <span className={isSelected ? 'text-primary-900' : 'text-gray-700'}>{option}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </Card>

              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                </Button>

                {currentQuestionIndex === questions.length - 1 ? (
                  <Button onClick={handleFinishExam} disabled={answeredCount < questions.length}>
                    Finalizar Examen
                  </Button>
                ) : (
                  <Button onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}>
                    Siguiente <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>

              {answeredCount < questions.length && currentQuestionIndex === questions.length - 1 && (
                <p className="text-center text-sm text-amber-600 mt-4">
                  Debes responder todas las preguntas para finalizar el examen
                </p>
              )}
            </div>
          )}

          {/* Results */}
          {step === 'results' && examResult && (
            <div>
              <Card padding="lg" className="max-w-2xl mx-auto mb-6">
                <div className="text-center mb-6">
                  <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      examResult.passed ? 'bg-green-100' : 'bg-red-100'
                    }`}
                  >
                    {examResult.passed ? (
                      <CheckCircle2 className="w-10 h-10 text-green-600" />
                    ) : (
                      <XCircle className="w-10 h-10 text-red-600" />
                    )}
                  </div>
                  <h1 className={`text-3xl font-bold mb-2 ${examResult.passed ? 'text-green-700' : 'text-red-700'}`}>
                    {examResult.passed ? 'Aprobado' : 'No Aprobado'}
                  </h1>
                  <p className="text-gray-600">Examen de Licencia para {typeInfo?.name}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold text-primary-600">{examResult.score}%</div>
                    <div className="text-sm text-gray-600">Calificación</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">{examResult.correctAnswers}</div>
                    <div className="text-sm text-gray-600">Correctas</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-3xl font-bold text-red-600">{examResult.incorrectAnswers}</div>
                    <div className="text-sm text-gray-600">Incorrectas</div>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-lg mb-6 ${
                    examResult.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <p className={`text-sm ${examResult.passed ? 'text-green-700' : 'text-red-700'}`}>
                    {examResult.passed
                      ? 'Has demostrado conocimiento suficiente de las leyes de tránsito. Puedes proceder a agendar tu cita para la prueba práctica en el simulador.'
                      : `Necesitas ${EXAM_CONFIG.passingScore}% para aprobar. Te recomendamos estudiar más sobre la Ley de Movilidad y Seguridad Vial antes de volver a intentar.`}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleRetryExam} className="flex-1">
                    <RotateCcw className="w-4 h-4 mr-2" /> Intentar de nuevo
                  </Button>
                  {examResult.passed && (
                    <Button onClick={handleContinue} className="flex-1">
                      Agendar Cita en Simulador
                    </Button>
                  )}
                </div>
              </Card>

              {/* Answer review */}
              <Card padding="lg">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Revisión de Respuestas</h2>
                <div className="space-y-4">
                  {examResult.details.map((detail, index) => (
                    <div
                      key={detail.question.id}
                      className={`p-4 rounded-lg border ${
                        detail.isCorrect ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-medium text-gray-500">Pregunta {index + 1}</span>
                        {detail.isCorrect ? (
                          <span className="flex items-center text-sm text-green-600">
                            <Check className="w-4 h-4 mr-1" /> Correcta
                          </span>
                        ) : (
                          <span className="flex items-center text-sm text-red-600">
                            <X className="w-4 h-4 mr-1" /> Incorrecta
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-gray-900 mb-2">{detail.question.question}</p>

                      <div className="text-sm space-y-1 mb-2">
                        <p className={detail.isCorrect ? 'text-green-700' : 'text-red-700'}>
                          <strong>Tu respuesta:</strong> {detail.question.options[detail.selectedAnswer]}
                        </p>
                        {!detail.isCorrect && (
                          <p className="text-green-700">
                            <strong>Respuesta correcta:</strong> {detail.question.options[detail.question.correctAnswer]}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() =>
                          setShowExplanation(showExplanation === detail.question.id ? null : detail.question.id)
                        }
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        {showExplanation === detail.question.id ? 'Ocultar explicación' : 'Ver explicación'}
                      </button>

                      {showExplanation === detail.question.id && (
                        <div className="mt-2 p-3 bg-white rounded border border-gray-200">
                          <p className="text-sm text-gray-700">{detail.question.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
