'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { FAQ_ITEMS } from '@/lib/landing-content'

export function FaqAccordion() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="max-w-3xl mx-auto space-y-3">
      {FAQ_ITEMS.map((item, i) => (
        <div
          key={i}
          className={`bg-white rounded-xl border border-gray-200 overflow-hidden animate-on-scroll stagger-${i + 1}`}
        >
          <button
            onClick={() => setOpenFaq(openFaq === i ? null : i)}
            className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
            aria-expanded={openFaq === i}
          >
            <span className="font-medium text-gray-900 pr-4">{item.question}</span>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
            />
          </button>
          <div
            className={`grid transition-all duration-200 ease-in-out ${openFaq === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
          >
            <div className="overflow-hidden">
              <p className="px-5 pb-5 text-gray-600 text-sm">{item.answer}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
