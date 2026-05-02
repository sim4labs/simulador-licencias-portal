'use client'

import { ChangelogList } from '@/components/changelog/ChangelogList'

export default function AdminChangelogPage() {
  return (
    <>
      <ChangelogList showCommits />
      <p className="mt-6 text-xs text-gray-500">
        Cada release se marca con un tag <code className="px-1 bg-gray-100 rounded">vX.Y.Z</code> en
        git; el CI/CD detecta el tag y deploya. Los commits posteriores al último tag aparecen como
        <em> Próxima versión</em>.
      </p>
    </>
  )
}
