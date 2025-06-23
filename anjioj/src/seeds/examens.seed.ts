export const examensSeed = [
  {
    type: 'angiographie',
    date: new Date('2024-06-20'),
    oeil: 'OD',
    indication: 'Suspicion de DMLA',
    diagnostic: 'Angiographie normale',
    status: 'termine',
    angiographie: {
      fluoresceine: {
        injected: true,
        injectionTime: new Date('2024-06-20T10:30:00'),
        phases: []
      },
      protocole: 'Protocole standard DMLA',
      complications: []
    }
  },
  {
    type: 'retinographie',
    date: new Date('2024-06-18'),
    oeil: 'OS',
    indication: 'Suivi diabète',
    diagnostic: 'Rétinopathie diabétique légère',
    status: 'termine'
  },
  {
    type: 'oct',
    date: new Date('2024-06-15'),
    oeil: 'OU',
    indication: 'Contrôle post-injection',
    diagnostic: 'Amélioration des signes œdémateux',
    status: 'termine'
  }
]