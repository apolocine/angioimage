import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params
    
    // Pour les images d'exemple, on retourne un placeholder
    // En production, ces images devraient être stockées dans un répertoire public
    
    // Générer une image placeholder en SVG
    const isThumb = filename.startsWith('thumb_')
    const size = isThumb ? '150x150' : '512x512'
    const dimensions = isThumb ? { width: 150, height: 150 } : { width: 512, height: 512 }
    
    // Déterminer la couleur de base selon le type d'image
    let bgColor = '#e5e7eb' // gris par défaut
    let text = 'Image'
    
    if (filename.includes('fond_oeil_normal')) {
      bgColor = '#fef3c7' // jaune clair
      text = 'Fond d\'œil normal'
    } else if (filename.includes('fond_oeil_rouge')) {
      bgColor = '#fee2e2' // rouge clair
      text = 'Fond d\'œil rouge'
    } else if (filename.includes('angiographie')) {
      bgColor = '#dbeafe' // bleu clair
      text = 'Angiographie'
    } else if (filename.includes('oct')) {
      bgColor = '#dcfce7' // vert clair
      text = 'OCT'
    } else if (filename.includes('retinographie')) {
      bgColor = '#f3e8ff' // violet clair
      text = 'Rétinographie'
    }
    
    // Créer un SVG placeholder
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${dimensions.width}" height="${dimensions.height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${bgColor}"/>
  <circle cx="${dimensions.width/2}" cy="${dimensions.height/2 - 20}" r="${Math.min(dimensions.width, dimensions.height)/4}" 
          fill="none" stroke="#6b7280" stroke-width="2"/>
  <text x="${dimensions.width/2}" y="${dimensions.height/2 + 30}" 
        font-family="Arial, sans-serif" font-size="${isThumb ? '12' : '16'}" 
        text-anchor="middle" fill="#374151">${text}</text>
  <text x="${dimensions.width/2}" y="${dimensions.height/2 + 50}" 
        font-family="Arial, sans-serif" font-size="${isThumb ? '8' : '12'}" 
        text-anchor="middle" fill="#6b7280">${size}</text>
</svg>`

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600', // Cache 1 heure
      },
    })
  } catch (error) {
    console.error('Erreur image sample:', error)
    return NextResponse.json({ message: 'Image non trouvée' }, { status: 404 })
  }
}