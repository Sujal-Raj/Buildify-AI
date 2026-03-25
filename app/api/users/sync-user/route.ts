import { prisma } from '@/lib/prisma'
import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST() {

  
  const user = await currentUser();
  console.log(user)
  const userId = user?.id;

  if (!user) {
    return NextResponse.json({ error: 'No user found' }, { status: 404 })
  }
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (existingUser) {
    return NextResponse.json(existingUser)
  }

  // create new user in DB
  const newUser = await prisma.user.create({
    data: {
      clerkId: userId,
      email: user.emailAddresses[0].emailAddress,
      name: user.firstName,
    },
  })

  return NextResponse.json(newUser)
}