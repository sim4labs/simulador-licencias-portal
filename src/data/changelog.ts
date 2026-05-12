/**
 * Changelog del portal administrativo.
 *
 * Source of truth = git tags `vX.Y.Z`. El archivo `changelog.generated.ts` lo
 * crea `scripts/build-changelog.mjs` (corre como prebuild + predev) leyendo
 * `git tag` y `git log`.
 *
 * Para curar el título y los highlights de una versión, agregar la entrada en
 * `changelog-highlights.ts` (manual, opcional). Si no hay overlay, la versión
 * se muestra solo con su lista de commits.
 *
 * Para cortar release:
 *   1. git tag -a v1.0.1 -m "fix(admin): ..."
 *   2. git push origin v1.0.1
 *   3. CI/CD detecta el tag y deploya.
 */
import { generatedChangelog } from './changelog.generated'
import { highlights } from './changelog-highlights'
import type { ChangelogEntryDecorated } from './changelog-types'

export type { ChangelogCommit, ChangelogEntry, ChangelogEntryDecorated } from './changelog-types'

export const changelog: ChangelogEntryDecorated[] = generatedChangelog.map((entry) => {
  const overlay = highlights[entry.version]
  return overlay ? { ...entry, ...overlay } : entry
})

/** Versión actual del portal: el tag más reciente, o "unreleased" si no hay tags. */
export function currentVersion(): string {
  const firstTagged = changelog.find((e) => e.tag !== null)
  return firstTagged?.version ?? 'unreleased'
}
