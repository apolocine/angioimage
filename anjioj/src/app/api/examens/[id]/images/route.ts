import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import dbConnect from '@/lib/db/mongodb'
import Image from '@/lib/db/models/Image'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }

    await dbConnect()

    const { id } = await params
    console.log(`🔍 Recherche d'images pour l'examen ID: ${id}`)

    // Recherche avec les deux formats possibles (string et ObjectId)
    const mongoose = require('mongoose')
    const query = {
      $or: [
        { examenId: id },
        { examenId: new mongoose.Types.ObjectId(id) }
      ]
    }
    const images = await Image.find(query)
      .sort({ createdAt: -1 })
      .lean()

    console.log(`📷 Trouvé ${images.length} images pour l'examen ${id}`)
    
    if (images.length > 0) {
      console.log('Images trouvées:', images.map(img => ({
        id: img._id,
        name: img.originalName,
        type: img.imageType
      })))
    }

    return NextResponse.json({
      data: images
    })
  } catch (error) {
    console.error('Erreur GET /api/examens/[id]/images:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}