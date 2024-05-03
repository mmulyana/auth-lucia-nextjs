'use server'

import { lucia } from '_/lib/lucia'
import { db } from '_/lib/prisma'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Argon2id } from 'oslo/password'

export const signIn = async (formData: FormData) => {
  const formDataRaw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  try {
    const user = await db.user.findUnique({
      where: { email: formDataRaw.email },
    })

    if (!user) throw new Error('Incorrect email or password')

    const validPassword = await new Argon2id().verify(
      user.hashedPassword,
      formDataRaw.password
    )

    if (!validPassword) throw new Error('Incorrect email or password')

    const session = await lucia.createSession(user.id, {})
    const sessionCookie = lucia.createSessionCookie(session.id)

    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    )
  } catch (error) {}

  redirect('/dashboard')
}
