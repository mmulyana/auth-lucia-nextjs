'use server'

import { lucia } from '_/lib/lucia'
import { db } from '_/lib/prisma'
import { generateId } from 'lucia'
import { cookies } from 'next/headers'
import { Argon2id } from 'oslo/password'
import { redirect } from 'next/navigation'

export const signUp = async (formData: FormData) => {
  const formDataRaw = {
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
  }

  if (formDataRaw.password !== formDataRaw.confirmPassword) {
    throw new Error('Passwords do not match')
  }

  try {
    const hashedPassword = await new Argon2id().hash(formDataRaw.password)
    const userId = generateId(15)
    await db.user.create({
      data: {
        id: userId,
        firstName: formDataRaw.firstName,
        lastName: formDataRaw.lastName,
        email: formDataRaw.email,
        hashedPassword,
      },
    })

    const session = await lucia.createSession(userId, {})
    const sessionCookie = lucia.createSessionCookie(session.id)

    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    )
  } catch (error) {}

  redirect('/dashboard')
}
