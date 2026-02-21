import { NextResponse } from 'next/server'
import { checkAndSendMissedCheckInAlerts } from '@/lib/attendance-alerts'

/**
 * POST /api/hrm/attendance/check-missed
 * 
 * Check for missed check-ins and send alerts
 * This endpoint should be called by a scheduled job (cron) at the end of business day
 * 
 * Optional query params:
 * - date: Date to check (ISO string), defaults to today
 */
export async function POST(req) {
  try {
    const { searchParams } = new URL(req.url)
    const dateParam = searchParams.get('date')
    const date = dateParam ? new Date(dateParam) : new Date()

    const result = await checkAndSendMissedCheckInAlerts(date)

    return NextResponse.json({
      success: true,
      ...result,
      message: `Checked missed check-ins for ${date.toLocaleDateString()}. Found ${result.alertsCount || 0} missed check-ins.`
    })
  } catch (error) {
    console.error('[CHECK_MISSED_CHECKINS]', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

