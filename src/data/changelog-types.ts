export interface ChangelogCommit {
  hash: string
  date: string // YYYY-MM-DD
  subject: string
}

export interface ChangelogEntry {
  version: string // semver "1.0.0" o "unreleased"
  date: string // YYYY-MM-DD
  tag: string | null
  commits: ChangelogCommit[]
}

export interface ChangelogEntryDecorated extends ChangelogEntry {
  title?: string
  highlights?: string[]
}
