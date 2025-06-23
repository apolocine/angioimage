import dbConnect from '@/lib/db/mongodb'
import Patient, { IPatient } from '@/lib/db/models/Patient'

export interface PaginationOptions {
  page: number
  limit: number
  search?: string
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export class PatientService {
  static async getPatients(options: PaginationOptions): Promise<PaginatedResult<IPatient>> {
    await dbConnect()
    
    const { page = 1, limit = 10, search = '' } = options
    const skip = (page - 1) * limit

    let query: any = {}
    
    if (search) {
      query = {
        $or: [
          { nom: { $regex: search, $options: 'i' } },
          { prenom: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }
    }

    const [patients, total] = await Promise.all([
      Patient.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      Patient.countDocuments(query)
    ])

    // Calculer l'âge pour chaque patient
    const patientsWithAge = patients.map(patient => {
      if (patient.dateNaissance) {
        const today = new Date()
        const birthDate = new Date(patient.dateNaissance)
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--
        }
        
        return { ...patient, age }
      }
      return patient
    })

    return {
      data: patientsWithAge,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  static async getPatientById(id: string): Promise<IPatient | null> {
    await dbConnect()
    const patient = await Patient.findById(id).lean()
    
    if (patient && patient.dateNaissance) {
      const today = new Date()
      const birthDate = new Date(patient.dateNaissance)
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      
      return { ...patient, age }
    }
    
    return patient
  }

  static async createPatient(data: Partial<IPatient>): Promise<IPatient> {
    await dbConnect()
    
    const patient = new Patient(data)
    await patient.save()
    return patient.toJSON()
  }

  static async updatePatient(id: string, data: Partial<IPatient>): Promise<IPatient | null> {
    await dbConnect()
    
    const patient = await Patient.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).lean()
    
    return patient
  }

  static async deletePatient(id: string): Promise<boolean> {
    await dbConnect()
    
    const result = await Patient.findByIdAndDelete(id)
    return !!result
  }

  static async searchPatients(searchTerm: string): Promise<IPatient[]> {
    await dbConnect()
    
    const patients = await Patient.find({
      $text: { $search: searchTerm }
    })
    .limit(10)
    .lean()
    
    return patients
  }
}