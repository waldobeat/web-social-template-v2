export type JobModality = 'presencial' | 'remoto' | 'hibrido';

export type JobType = 'full-time' | 'part-time' | 'freelance' | 'pasantia' | 'temporal';

export interface JobAd {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  companyVerified?: boolean;
  title: string;
  category: string;
  modality: JobModality;
  // If presencial / hibrido: Venezuelan state
  venezuelaState?: string;
  city?: string;
  // If remoto: Country or Global
  remoteCountry?: string;
  jobType: JobType;
  salary?: string;
  description: string;
  requirements: string[];
  benefits?: string[];
  createdAt: number;
  status: 'active' | 'paused' | 'closed';
  applicantCount: number;
}

export interface CandidateWorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

export interface CandidateEducation {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate?: string;
  current: boolean;
}

// User CV in Sheddit Jobs
export interface CandidateCV {
  userId: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  title: string; // e.g. "Desarrollador Web Frontend" o "Contador Público"
  phone: string;
  country: string;
  state: string; // Estado de residencia (ej: Carabobo, Aragua, etc.)
  city: string;
  addressSummary: string; // Ubicación general segura
  skills: string[]; // Actitudes / Aptitudes
  summary: string; // Resumen profesional
  experience: CandidateWorkExperience[];
  education: CandidateEducation[];
  updatedAt: number;
  // NOTA: Datos estrictamente confidenciales como DNI/Cédula NO se guardan en la vista pública para empresas
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  companyId: string;
  companyName: string;
  applicantId: string;
  appliedAt: number;
  status: 'recibida' | 'en_revision' | 'contactado' | 'descartado';
  // Snapshot of candidate confidential view safe for company:
  candidateSafeData: {
    firstName: string;
    lastName: string;
    photoUrl: string;
    title: string;
    phone: string;
    state: string;
    city: string;
    skills: string[];
    summary: string;
    experience: CandidateWorkExperience[];
    education: CandidateEducation[];
  };
}

export interface CompanyRequest {
  id: string;
  ownerUid: string;
  ownerEmail: string;
  name: string;
  rif: string; // RIF o Registro Mercantil
  legalRepresentative: string;
  phone: string;
  email: string;
  sector: string;
  website?: string;
  requestLetter: string; // Carta de solicitud formal para Sheddit
  logo?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  reviewedAt?: number;
  reviewNotes?: string;
}

export const VENEZUELA_STATES = [
  'Amazonas',
  'Anzoátegui',
  'Apure',
  'Aragua',
  'Barinas',
  'Bolívar',
  'Carabobo',
  'Cojedes',
  'Delta Amacuro',
  'Distrito Capital (Caracas)',
  'Falcón',
  'Guárico',
  'La Guaira (Vargas)',
  'Lara',
  'Mérida',
  'Miranda',
  'Monagas',
  'Nueva Esparta (Margarita)',
  'Portuguesa',
  'Sucre',
  'Táchira',
  'Trujillo',
  'Yaracuy',
  'Zulia'
] as const;

export const REMOTE_COUNTRIES = [
  'Global / Cualquier País',
  'Venezuela',
  'Colombia',
  'México',
  'Argentina',
  'Chile',
  'Perú',
  'España',
  'Estados Unidos',
  'Ecuador',
  'Panamá',
  'República Dominicana',
  'Uruguay',
  'Costa Rica',
  'Otro país'
] as const;

export const JOB_CATEGORIES = [
  'Tecnología y Software',
  'Ventas y Comercial',
  'Administración y Finanzas',
  'Atención al Cliente',
  'Marketing y Publicidad',
  'Diseño y Multimedia',
  'Recursos Humanos',
  'Logística y Almacén',
  'Salud y Medicina',
  'Ingeniería y Operaciones',
  'Educación y Docencia',
  'Hotelería y Gastronomía',
  'Seguridad y Vigilancia',
  'Oficios y Mantenimiento',
  'Otros'
] as const;
