import { getAuth } from '_/features/auth/queries/get-auth'
import { redirect } from 'next/navigation'

export default async function Layout({ children }: React.PropsWithChildren) {
  const { user } = await getAuth()

  if (!user) redirect('/sign-in')

  return <>{children}</>
}
