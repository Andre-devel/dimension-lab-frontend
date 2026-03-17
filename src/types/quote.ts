export type QuoteStatus =
  | 'RECEIVED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'PRINTING'
  | 'READY'
  | 'DELIVERED'
  | 'CANCELLED'

export type FileType = 'IMAGE' | 'VIDEO' | 'MODEL_3D'

export interface QuoteFile {
  id: string
  filePath: string
  fileType: FileType
}

export interface Quote {
  id: string
  description: string
  material: string
  color: string
  quantity: number
  finish: string
  desiredDeadline: string
  status: QuoteStatus
  createdAt: string
  files: QuoteFile[]
  customer?: Customer
}

export interface Customer {
  id: string
  name: string
  email: string
  whatsapp?: string
}

export interface CreateQuotePayload {
  description: string
  material: string
  color: string
  quantity: number
  finish: string
  desiredDeadline: string
  files: File[]
  customerName?: string
  customerEmail?: string
  customerWhatsapp?: string
}
