export const examensSeed = [
  {
    type: 'angiographie',
    date: new Date('2024-06-23T14:30:00'),
    oeil: 'OD',
    indication: 'Suspicion de DMLA',
    diagnostic: '',
    status: 'planifie',
    angiographie: {
      protocole: 'Protocole standard DMLA',
      fluoresceine: {
        injected: false
      }
    }
  },
  {
    type: 'angiographie',
    date: new Date('2024-06-23T16:00:00'),
    oeil: 'OS',
    indication: 'Contrôle évolution néovaisseaux',
    diagnostic: '',
    status: 'planifie',
    angiographie: {
      protocole: 'Protocole rétinopathie diabétique',
      fluoresceine: {
        injected: false
      }
    }
  },
  {
    type: 'angiographie',
    date: new Date('2024-06-20T10:30:00'),
    oeil: 'OD',
    indication: 'Suspicion de DMLA',
    diagnostic: 'Angiographie normale',
    status: 'termine',
    angiographie: {
      fluoresceine: {
        injected: true,
        injectionTime: new Date('2024-06-20T10:35:00')
      },
      protocole: 'Protocole standard DMLA'
    }
  },
  {
    type: 'angiographie',
    date: new Date('2024-06-21T09:15:00'),
    oeil: 'OS',
    indication: 'Rétinopathie diabétique',
    diagnostic: 'Proliférante modérée',
    status: 'termine',
    angiographie: {
      fluoresceine: {
        injected: true,
        injectionTime: new Date('2024-06-21T09:20:00')
      },
      protocole: 'Protocole diabète'
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