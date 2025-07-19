export interface PersonalInfo {
  fullName: string
  email: string
  phone: string
  address: string
  website: string
  linkedin: string
  github: string
  summary: string
}

export interface Experience {
  id: string
  position: string
  company: string
  startDate: string
  endDate: string
  description: string
  current: boolean
}

export interface Education {
  id: string
  degree: string
  school: string
  startDate: string
  endDate: string
  gpa: string
}

export interface Skill {
  id: string
  name: string
  level: string
}

export interface Project {
  id: string
  name: string
  description: string
  technologies: string
  url: string
}

export interface Language {
  id: string
  name: string
  level: string
}

export interface Certification {
  id: string
  name: string
  issuer: string
  date: string
  url: string
}

export interface CVData {
  personalInfo: PersonalInfo
  experience: Experience[]
  education: Education[]
  skills: Skill[]
  projects: Project[]
  languages: Language[]
  certifications: Certification[]
}
