import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAvailableCategories } from '@/lib/document-templates'

// GET /api/hrm/document-templates/categories - Get all available template categories
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const categories = getAvailableCategories()
    
    // Map categories to user-friendly names
    const categoryMap = {
      OFFER_LETTER: 'Offer Letter',
      EMPLOYMENT_CONTRACT: 'Employment Contract',
      APPOINTMENT_LETTER: 'Appointment Letter',
      PROMOTION_LETTER: 'Promotion Letter',
      EXPERIENCE_LETTER: 'Experience Letter',
      SALARY_CERTIFICATE: 'Salary Certificate',
      WARNING_LETTER: 'Warning Letter',
      NOTICE_LETTER: 'Notice Letter'
    }

    const formattedCategories = categories.map(category => ({
      value: category,
      label: categoryMap[category] || category.replace(/_/g, ' '),
      category
    }))

    return NextResponse.json(formattedCategories)
  } catch (error) {
    console.error('[TEMPLATE_CATEGORIES_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

