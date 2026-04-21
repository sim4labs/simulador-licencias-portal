import { redirect } from 'next/navigation'

export default function VerificarRedirect({
  searchParams,
}: {
  searchParams: { session?: string }
}) {
  const session = searchParams.session || ''
  redirect(`/portal/verificacion${session ? `?session=${session}` : ''}`)
}
