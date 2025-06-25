import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import dbConnect from '@/lib/db/mongodb'
import { Patient } from '@/lib/db/models'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '10')

    await dbConnect()

    let searchQuery = {}
    
    if (query.trim()) {
      // Recherche sur nom, prénom ou combinaison des deux
      const searchTerms = query.trim().split(/\s+/)
      
      if (searchTerms.length === 1) {
        // Un seul terme de recherche
        const term = searchTerms[0]
        searchQuery = {
          $or: [
            { nom: { $regex: term, $options: 'i' } },
            { prenom: { $regex: term, $options: 'i' } }
          ]
        }
      } else {
        // Plusieurs termes - recherche combinée nom + prénom
        const [firstTerm, ...restTerms] = searchTerms
        const secondTerm = restTerms.join(' ')
        
        searchQuery = {
          $or: [
            // Première variante: premier terme = nom, reste = prénom
            {
              $and: [
                { nom: { $regex: firstTerm, $options: 'i' } },
                { prenom: { $regex: secondTerm, $options: 'i' } }
              ]
            },
            // Deuxième variante: premier terme = prénom, reste = nom
            {
              $and: [
                { prenom: { $regex: firstTerm, $options: 'i' } },
                { nom: { $regex: secondTerm, $options: 'i' } }
              ]
            },
            // Variante simple: recherche dans nom ou prénom
            { nom: { $regex: query, $options: 'i' } },
            { prenom: { $regex: query, $options: 'i' } }
          ]
        }
      }
    }

    const patients = await Patient.find(searchQuery)
      .select('nom prenom dateNaissance email')
      .limit(Math.min(limit, 50)) // Maximum 50 résultats
      .sort({ nom: 1, prenom: 1 })
      .lean()

    return NextResponse.json({
      data: patients,
      count: patients.length,
      query: query
    })
  } catch (error) {
    console.error('Erreur recherche patients:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}