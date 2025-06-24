// Import all models to ensure they are registered with Mongoose
import './Role'
import './User'
import './Patient'
import './Exam'
import './Image'
import './Report'
import './ReportTemplate'

// Re-export for convenience
export { default as Role } from './Role'
export { default as User } from './User'
export { default as Patient } from './Patient'
export { default as Exam } from './Exam'
export { default as Image } from './Image'
export { default as Report } from './Report'
export { default as ReportTemplate } from './ReportTemplate'