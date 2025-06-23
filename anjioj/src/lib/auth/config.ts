import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import dbConnect from '@/lib/db/mongodb'
import User from '@/lib/db/models/User'
import Role from '@/lib/db/models/Role'
import { comparePassword } from '@/lib/utils/crypto'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('Credentials manquantes')
            return null
          }

          await dbConnect()
          
          const user = await User.findOne({ 
            email: credentials.email.toLowerCase(),
            isActive: true
          })

          if (!user) {
            console.log('Utilisateur non trouvé:', credentials.email)
            return null
          }

          const isValidPassword = await comparePassword(
            credentials.password,
            user.password
          )

          if (!isValidPassword) {
            console.log('Mot de passe incorrect pour:', credentials.email)
            return null
          }

          console.log('Connexion réussie pour:', credentials.email)

          await User.findByIdAndUpdate(user._id, {
            lastLogin: new Date()
          })

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role
          }
        } catch (error) {
          console.error('Erreur lors de l\'authentification:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 heures
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/auth/error'
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development'
}