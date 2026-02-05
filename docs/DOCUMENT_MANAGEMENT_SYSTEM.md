# Document Management System for HRMS

## Overview

The Document Management System allows HR managers to generate and manage employee documents using templates. Employees can view and download their assigned documents.

## Features

### For HR Managers:
- ✅ Generate documents from predefined templates
- ✅ Upload custom documents
- ✅ Assign documents to employees
- ✅ Manage document templates
- ✅ View all employee documents

### For Employees:
- ✅ View assigned documents
- ✅ Download documents (PDF)
- ✅ View document history

## Document Types

The system includes the following predefined document templates:

1. **Offer Letter** - Job offer letters
2. **Employment Contract** - Employment contracts
3. **Appointment Letter** - Appointment confirmations
4. **Promotion Letter** - Promotion notifications
5. **Experience Letter** - Experience certificates
6. **Salary Certificate** - Salary verification letters
7. **Warning Letter** - Disciplinary warnings
8. **Notice Letter** - General notices

## Database Schema

### DocumentTemplate
- `id` - Unique identifier
- `name` - Template name
- `category` - Document category (OFFER_LETTER, etc.)
- `content` - HTML template with placeholders
- `fields` - JSON array of field definitions
- `isActive` - Active status
- `createdBy` - User who created the template

### EmployeeDocument
- `id` - Unique identifier
- `employeeId` - Reference to Employee
- `templateId` - Reference to DocumentTemplate (if generated)
- `documentType` - "UPLOADED" or "GENERATED"
- `category` - Document category
- `title` - Document title
- `fileName` - Original file name
- `filePath` - Path in Supabase storage
- `fileUrl` - Public URL for download
- `fileSize` - File size in bytes
- `mimeType` - File MIME type
- `fieldValues` - JSON object with field values used (for generated docs)
- `uploadedBy` - User who uploaded/generated
- `description` - Optional description
- `tags` - Array of tags for categorization
- `isActive` - Active status

## API Endpoints

### Document Templates

- `GET /api/hrm/document-templates` - List all templates
- `POST /api/hrm/document-templates` - Create a template
- `GET /api/hrm/document-templates/[id]` - Get a template
- `PUT /api/hrm/document-templates/[id]` - Update a template
- `DELETE /api/hrm/document-templates/[id]` - Delete a template
- `GET /api/hrm/document-templates/categories` - Get available categories

### Documents

- `GET /api/hrm/documents` - List documents (filtered by employee if employee role)
- `POST /api/hrm/documents/upload` - Upload a document
- `POST /api/hrm/documents/generate` - Generate a document from template
- `GET /api/hrm/documents/[id]/download` - Get download URL
- `DELETE /api/hrm/documents/[id]` - Delete a document

## Template Placeholders

Templates use placeholders in the format `{{fieldName}}` or `{{fieldName|defaultValue}}`.

### Available Fields:
- Employee data: `employeeName`, `employeeId`, `designation`, `department`, `dateOfJoining`, `salary`, etc.
- System fields: `currentDate`, `currentYear`
- Custom fields: Can be passed via `fieldValues` in the generate API

## PDF Generation

Documents are generated as PDFs using the `pdf-lib` library. The HTML templates are parsed and converted to PDF format programmatically before being stored in Supabase.

## Storage

All documents are stored in Supabase Storage bucket `hr-documents` with the following structure:
```
hr-documents/
  employees/
    {employeeId}/
      {category}/
        {timestamp}_{filename}.pdf
```

## Permissions

- **HR Managers**: Can upload, generate, view, and delete all documents
- **Employees**: Can only view and download their own documents
- **Super Admin/Admin**: Full access to all documents

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install @supabase/supabase-js pdf-lib
   ```

2. **Create Supabase bucket:**
   - Go to Supabase Dashboard → Storage
   - Create a bucket named `hr-documents`
   - Set it to public or configure RLS policies

3. **Run migrations:**
   ```bash
   npx prisma migrate dev --name add_document_management
   ```

4. **Configure environment variables:**
   - Add Supabase credentials to `.env.local`

## Usage Examples

### Generate an Offer Letter

```javascript
POST /api/hrm/documents/generate
{
  "templateId": "OFFER_LETTER",
  "employeeId": "emp123",
  "fieldValues": {
    "companyName": "Galaxy ERP Solutions",
    "companyAddress": "123 Business Street, City, Country"
  },
  "title": "Offer Letter - John Doe",
  "description": "Job offer for Software Engineer position"
}
```

### Upload a Document

```javascript
POST /api/hrm/documents/upload
FormData:
  - file: (File)
  - employeeId: "emp123"
  - category: "CUSTOM"
  - title: "Custom Document"
  - description: "Optional description"
```

### Download a Document

```javascript
GET /api/hrm/documents/{id}/download
Returns: { url: "signed_url", fileName: "document.pdf", mimeType: "application/pdf" }
```

