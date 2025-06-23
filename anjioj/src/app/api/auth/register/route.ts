import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongodb'
import User from '@/lib/db/models/User'
import Role from '@/lib/db/models/Role'
import { hashPassword } from '@/lib/utils/crypto'
import { registerSchema } from '@/lib/utils/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation
    const validatedData = await registerSchema.validate(body)
    
    await dbConnect()
    
    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ 
      email: validatedData.email.toLowerCase() 
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      )
    }
    
    // Récupérer le rôle
    const role = await Role.findOne({ name: validatedData.role })
    if (!role) {
      return NextResponse.json(
        { error: 'Rôle invalide' },
        { status: 400 }
      )
    }
    
    // Hasher le mot de passe
    const hashedPassword = await hashPassword(validatedData.password)
    
    // Créer l'utilisateur
    const user = await User.create({
      email: validatedData.email.toLowerCase(),
      password: hashedPassword,
      name: validatedData.name,
      role: validatedData.role,
      roleRef: role._id,
      settings: {
        theme: 'light',
        language: 'fr',
        notifications: true
      }
    })
    
    // Retourner l'utilisateur sans le mot de passe
    const { password, ...userWithoutPassword } = user.toJSON()
    
    return NextResponse.json(
      { 
        message: 'Utilisateur créé avec succès',
        user: userWithoutPassword
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Erreur lors de l\'inscription:', error)
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}