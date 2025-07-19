export interface ResumeValues {
  firstName: string
  lastName: string
  jobTitle: string
  city: string
  country: string
  phone: string
  email: string
  summary: string
  skills: string[]
  education: Education[]
  workExperiences: WorkExperience[]
  photo: File | string | null
  colorHex: string
  borderStyle: BorderStyles
  fontFamily: FontFamily
  fontSize: FontSize
  lineHeight: LineHeight
  fontWeight: FontWeight
}

export interface Education {
  degree: string
  school: string
  startDate: Date | null
  endDate: Date | null
}

export interface WorkExperience {
  position: string
  company: string
  startDate: Date | null
  endDate: Date | null
  description: string
}

export enum BorderStyles {
  SQUARE = "square",
  ROUNDED = "rounded",
  CIRCLE = "circle",
}

export enum FontFamily {
  INTER = "Inter",
  ROBOTO = "Roboto",
  OPEN_SANS = "Open Sans",
  LATO = "Lato",
  POPPINS = "Poppins",
  MONTSERRAT = "Montserrat",
  NUNITO = "Nunito",
  SOURCE_SANS = "Source Sans Pro",
  PLAYFAIR = "Playfair Display",
  MERRIWEATHER = "Merriweather",
  CRIMSON = "Crimson Text",
  LIBRE_BASKERVILLE = "Libre Baskerville",
}

export enum FontSize {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
  EXTRA_LARGE = "extra-large",
}

export enum LineHeight {
  TIGHT = "tight",
  NORMAL = "normal",
  RELAXED = "relaxed",
  LOOSE = "loose",
}

export enum FontWeight {
  LIGHT = "light",
  NORMAL = "normal",
  MEDIUM = "medium",
  SEMIBOLD = "semibold",
  BOLD = "bold",
}
