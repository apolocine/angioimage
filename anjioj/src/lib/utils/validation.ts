import * as yup from 'yup'

export const loginSchema = yup.object({
  email: yup.string().email('Email invalide').required('Email requis'),
  password: yup.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères').required('Mot de passe requis')
})

export const registerSchema = yup.object({
  email: yup.string().email('Email invalide').required('Email requis'),
  password: yup.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères').required('Mot de passe requis'),
  name: yup.string().required('Nom requis'),
  role: yup.string().oneOf(['admin', 'doctor', 'assistant']).required('Rôle requis')
})

export const patientSchema = yup.object({
  nom: yup.string().required('Nom requis'),
  prenom: yup.string().required('Prénom requis'),
  dateNaissance: yup.date().required('Date de naissance requise').max(new Date(), 'Date invalide'),
  sexe: yup.string().oneOf(['M', 'F']).required('Sexe requis'),
  email: yup.string().email('Email invalide').nullable(),
  telephone: yup.string().nullable(),
  adresse: yup.object({
    rue: yup.string().nullable(),
    ville: yup.string().nullable(),
    codePostal: yup.string().nullable(),
    pays: yup.string().default('France')
  }).nullable(),
  dossierMedical: yup.object({
    numeroSecu: yup.string().nullable(),
    medecin: yup.string().nullable(),
    antecedents: yup.array().of(yup.string()).nullable(),
    allergies: yup.array().of(yup.string()).nullable(),
    traitements: yup.array().of(yup.string()).nullable()
  }).nullable()
})

export type LoginInput = yup.InferType<typeof loginSchema>
export type RegisterInput = yup.InferType<typeof registerSchema>
export type PatientInput = yup.InferType<typeof patientSchema>