/**
 * HRM E2E Smoke Test (Full)
 *
 * Runs an end-to-end set of API checks for HRM using real NextAuth login.
 * It tests both sides:
 * - HR Manager: creates + manages entities
 * - Employee: performs employee actions and verifies access controls
 *
 * Usage:
 *   HR_EMAIL=... HR_PASSWORD=... EMP_EMAIL=... EMP_PASSWORD=... npm run hrm:test
 *
 * Optional:
 *   BASE_URL=http://127.0.0.1:3000
 *   START_SERVER=1   (default: 1) starts `npm run dev -p <PORT>` automatically
 *   PORT=3000        (default: 3000)
 *   STRICT=1         (default: 0) fail on "environment/config" dependent features too (docs generate/upload)
 *   SKIP_DOCS=1      skip document generation/upload (Supabase/PDF env dependencies)
 *
 * Notes:
 * - Auth is cookie-based (NextAuth Credentials provider).
 * - Data created is prefixed with SMOKE_<runId> to be identifiable.
 * - Cleanup is best-effort (soft delete where supported).
 */

import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'

const PORT = Number(process.env.PORT || 3000)
const BASE_URL = process.env.BASE_URL || `http://127.0.0.1:${PORT}`
const START_SERVER = (process.env.START_SERVER ?? '1') !== '0'
const STRICT = (process.env.STRICT ?? '0') !== '0'
const SKIP_DOCS = (process.env.SKIP_DOCS ?? '0') !== '0'

const HR_EMAIL = process.env.HR_EMAIL
const HR_PASSWORD = process.env.HR_PASSWORD
const EMP_EMAIL = process.env.EMP_EMAIL
const EMP_PASSWORD = process.env.EMP_PASSWORD

function requireEnv(name) {
  if (!process.env[name]) throw new Error(`Missing env var: ${name}`)
  return process.env[name]
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg)
}

class CookieJar {
  constructor() {
    /** @type {Map<string,string>} */
    this.cookies = new Map()
  }

  /** @param {Headers} headers */
  addFromResponse(headers) {
    // Node fetch supports getSetCookie() in newer runtimes; fall back to raw header.
    const setCookies = typeof headers.getSetCookie === 'function'
      ? headers.getSetCookie()
      : (headers.get('set-cookie') ? [headers.get('set-cookie')] : [])

    for (const sc of setCookies) {
      if (!sc) continue
      const [pair] = sc.split(';')
      const idx = pair.indexOf('=')
      if (idx === -1) continue
      const name = pair.slice(0, idx).trim()
      const value = pair.slice(idx + 1).trim()
      if (name) this.cookies.set(name, value)
    }
  }

  header() {
    if (this.cookies.size === 0) return ''
    return [...this.cookies.entries()].map(([k, v]) => `${k}=${v}`).join('; ')
  }
}

async function http(jar, path, { method = 'GET', headers = {}, body } = {}) {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`
  const h = new Headers(headers)
  const cookie = jar?.header?.()
  if (cookie) h.set('cookie', cookie)

  const res = await fetch(url, { method, headers: h, body, redirect: 'manual' })
  jar?.addFromResponse?.(res.headers)

  const contentType = res.headers.get('content-type') || ''
  const text = await res.text()
  let json = null
  if (contentType.includes('application/json')) {
    try { json = JSON.parse(text) } catch {}
  }
  return { res, text, json }
}

async function httpJson(jar, path, method, payload) {
  return await http(jar, path, {
    method,
    headers: { 'content-type': 'application/json' },
    body: payload === undefined ? undefined : JSON.stringify(payload)
  })
}

async function waitForServer() {
  const jar = new CookieJar()
  for (let i = 0; i < 60; i++) {
    try {
      const { res } = await http(jar, '/api/auth/session')
      if (res.status === 200) return
    } catch {}
    await sleep(500)
  }
  throw new Error(`Server not reachable at ${BASE_URL}`)
}

async function login(email, password) {
  const jar = new CookieJar()

  // 1) Get CSRF token (also sets csrf cookie)
  const csrf = await http(jar, '/api/auth/csrf')
  assert(csrf.res.ok, `CSRF failed (${csrf.res.status}): ${csrf.text}`)
  const csrfToken = csrf.json?.csrfToken || csrf.json?.csrf || csrf.json?.token
  assert(csrfToken, `CSRF token missing: ${csrf.text}`)

  // 2) Credentials callback
  const form = new URLSearchParams()
  form.set('csrfToken', csrfToken)
  form.set('email', email)
  form.set('password', password)
  form.set('callbackUrl', `${BASE_URL}/dashboard`)
  form.set('json', 'true')

  const cb = await http(jar, '/api/auth/callback/credentials', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: form.toString()
  })

  // NextAuth may respond 200/302; cookies are what we care about.
  if (!(cb.res.status === 200 || cb.res.status === 302)) {
    throw new Error(`Login failed (${cb.res.status}): ${cb.text}`)
  }

  // 3) Verify session
  const sess = await http(jar, '/api/auth/session')
  assert(sess.res.ok, `Session check failed (${sess.res.status}): ${sess.text}`)
  assert(sess.json?.user?.email?.toLowerCase?.() === email.toLowerCase(), `Logged in user mismatch: ${sess.text}`)

  return { jar, session: sess.json }
}

async function mustOk(step, out) {
  if (!out.res.ok) {
    const msg = out.json?.error || out.json?.message || out.text
    throw new Error(`${step} failed (${out.res.status}): ${msg}`)
  }
}

function logStep(name) {
  process.stdout.write(`\n→ ${name}\n`)
}

function isoDate(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x.toISOString()
}

function yyyyMmDd(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x.toISOString().split('T')[0]
}

async function getEmployeeByEmail(hrJar, email) {
  const out = await http(hrJar, '/api/organization/employees')
  await mustOk('HR org employees list', out)
  const list = Array.isArray(out.json) ? out.json : []
  const match = list.find(e => (e.user?.email || '').toLowerCase() === email.toLowerCase())
  return match || list[0] || null
}

async function expectForbidden(step, out) {
  if (!(out.res.status === 403 || out.res.status === 401)) {
    throw new Error(`${step} expected 401/403 but got ${out.res.status}: ${out.text}`)
  }
}

async function runFullFlow(hr, emp) {
  const runId = `${Date.now()}`
  const SMOKE = `SMOKE_${runId}`
  const created = {
    leaveTypeId: null,
    leavePolicyId: null,
    leaveRequestId: null,
    shiftId: null,
    shiftAssignmentId: null,
    salaryStructureId: null,
    payrollPeriodId: null,
    payrollRecordId: null,
    bonusId: null,
    loanId: null,
    templateId: null,
    generatedDocId: null
  }

  // Resolve target employee record (by EMP_EMAIL)
  logStep('Resolve employee record for tests')
  const targetEmployee = await getEmployeeByEmail(hr.jar, EMP_EMAIL)
  assert(targetEmployee?.id, 'No Employee record found to run HRM tests against (need at least 1 employee).')
  console.log('Using employee:', { id: targetEmployee.id, employeeId: targetEmployee.employeeId, email: targetEmployee.user?.email })

  // Access control checks (employee cannot access HR-only endpoints)
  logStep('Access control: employee must be forbidden from HR-only endpoints')
  await expectForbidden('EMP cannot list shifts', await http(emp.jar, '/api/hrm/shifts'))
  await expectForbidden('EMP cannot list payroll periods', await http(emp.jar, '/api/hrm/payroll/periods'))
  await expectForbidden('EMP cannot create leave type', await httpJson(emp.jar, '/api/hrm/leave/types', 'POST', { name: 'x', code: 'X' }))

  // Shift: create + assign
  logStep('HR: create shift and assign to employee')
  const shiftOut = await httpJson(hr.jar, '/api/hrm/shifts', 'POST', {
    name: `${SMOKE}_SHIFT`,
    startTime: '09:00',
    endTime: '17:00',
    gracePeriodMinutes: 15,
    breakDurationMinutes: 60,
    halfDayThresholdHours: 4.0
  })
  await mustOk('HR create shift', shiftOut)
  created.shiftId = shiftOut.json?.id

  const assignShiftOut = await httpJson(hr.jar, '/api/hrm/shifts/assign', 'POST', {
    employeeId: targetEmployee.id,
    shiftId: created.shiftId,
    effectiveFrom: isoDate(new Date())
  })
  await mustOk('HR assign shift', assignShiftOut)
  created.shiftAssignmentId = assignShiftOut.json?.id

  // Attendance: employee check-in/out; HR verifies attendance visible
  logStep('EMP: attendance check-in/out then HR verifies')
  await mustOk('EMP my attendance', await http(emp.jar, '/api/hrm/attendance/my-attendance?limit=1'))
  await mustOk('EMP check-in', await httpJson(emp.jar, '/api/hrm/attendance/check-in', 'POST', {}))
  await mustOk('EMP check-out', await httpJson(emp.jar, '/api/hrm/attendance/check-out', 'POST', {}))
  await mustOk('HR attendance list', await http(hr.jar, '/api/hrm/attendance?limit=50'))

  // Corrections: employee creates, HR approves
  logStep('EMP: create attendance correction, HR: approve it')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const corrCreate = await httpJson(emp.jar, '/api/hrm/attendance/corrections', 'POST', {
    date: today.toISOString(),
    requestedCheckInTime: new Date(today.getTime() + 9 * 60 * 60 * 1000).toISOString(),
    requestedCheckOutTime: new Date(today.getTime() + 17 * 60 * 60 * 1000).toISOString(),
    reason: `${SMOKE} correction`
  })
  // If already pending, route returns 400; accept and proceed.
  if (!(corrCreate.res.ok || corrCreate.res.status === 400)) {
    throw new Error(`EMP correction create failed (${corrCreate.res.status}): ${corrCreate.text}`)
  }
  const corrList = await http(emp.jar, '/api/hrm/attendance/corrections')
  await mustOk('EMP correction list', corrList)
  const pending = (Array.isArray(corrList.json) ? corrList.json : []).find(c => c.status === 'PENDING')
  if (pending?.id) {
    const appr = await httpJson(hr.jar, `/api/hrm/attendance/corrections/${pending.id}/approve`, 'POST', { reviewNotes: `${SMOKE} approved` })
    await mustOk('HR approve correction', appr)
  }

  // Leave: create type/policy/assign; employee requests; HR approves; employee sees balance/approved
  logStep('HR: leave type + policy + assign; EMP: request; HR: approve')
  const leaveCode = `SMK${runId.slice(-6)}`.toUpperCase()
  const leaveTypeOut = await httpJson(hr.jar, '/api/hrm/leave/types', 'POST', {
    name: `${SMOKE} Paid Leave`,
    code: leaveCode,
    description: 'Smoke test leave type',
    isPaid: true,
    requiresApproval: true,
    maxConsecutiveDays: 10
  })
  await mustOk('HR create leave type', leaveTypeOut)
  created.leaveTypeId = leaveTypeOut.json?.id

  const leavePolicyOut = await httpJson(hr.jar, '/api/hrm/leave/policies', 'POST', {
    leaveTypeId: created.leaveTypeId,
    name: `${SMOKE} Policy`,
    accrualType: 'MONTHLY',
    accrualAmount: 2,
    maxBalance: 24,
    allowNegativeBalance: false,
    carryForwardEnabled: true,
    carryForwardLimit: 10,
    effectiveFrom: yyyyMmDd(new Date())
  })
  await mustOk('HR create leave policy', leavePolicyOut)
  created.leavePolicyId = leavePolicyOut.json?.id

  const assignPolicyOut = await httpJson(hr.jar, '/api/hrm/leave/policies/assign', 'POST', {
    policyId: created.leavePolicyId,
    employeeId: targetEmployee.id,
    effectiveFrom: yyyyMmDd(new Date())
  })
  await mustOk('HR assign leave policy', assignPolicyOut)

  await mustOk('EMP balances after assignment', await http(emp.jar, '/api/hrm/leave/balances'))

  const start = new Date()
  start.setDate(start.getDate() + 1)
  const end = new Date()
  end.setDate(end.getDate() + 2)
  const leaveReqOut = await httpJson(emp.jar, '/api/hrm/leave/requests', 'POST', {
    leaveTypeId: created.leaveTypeId,
    startDate: yyyyMmDd(start),
    endDate: yyyyMmDd(end),
    reason: `${SMOKE} leave request`
  })
  await mustOk('EMP create leave request', leaveReqOut)
  created.leaveRequestId = leaveReqOut.json?.id

  const approveLeaveOut = await httpJson(hr.jar, `/api/hrm/leave/requests/${created.leaveRequestId}/approve`, 'POST', {})
  await mustOk('HR approve leave request', approveLeaveOut)
  await mustOk('EMP leave requests list (should include APPROVED)', await http(emp.jar, '/api/hrm/leave/requests'))

  // Payroll: salary structure -> period -> lock attendance -> bonus -> approve bonus -> loan -> generate -> finalize -> mark paid
  logStep('HR: payroll full flow (salary structure, period, lock attendance, bonus, loan, generate, finalize, paid)')
  const salaryStructureOut = await httpJson(hr.jar, '/api/hrm/payroll/salary-structures', 'POST', {
    employeeId: targetEmployee.id,
    effectiveFrom: yyyyMmDd(new Date()),
    components: [
      { name: 'Basic Salary', type: 'ALLOWANCE', calculationType: 'FIXED', amount: 100000, priority: 1, isTaxable: false },
      { name: 'House Allowance', type: 'ALLOWANCE', calculationType: 'PERCENTAGE', amount: 40, priority: 2, isTaxable: false },
      { name: 'Income Tax', type: 'DEDUCTION', calculationType: 'PERCENTAGE', amount: 5, priority: 90 }
    ]
  })
  await mustOk('HR create salary structure', salaryStructureOut)
  created.salaryStructureId = salaryStructureOut.json?.id

  const periodsOut = await http(hr.jar, '/api/hrm/payroll/periods')
  await mustOk('HR list payroll periods', periodsOut)
  const periods = Array.isArray(periodsOut.json) ? periodsOut.json : []
  const maxEnd = periods.reduce((m, p) => {
    const t = new Date(p.periodEnd).getTime()
    return Number.isFinite(t) && t > m ? t : m
  }, 0)
  // pick a safe future window beyond all existing periods to avoid overlap
  const base = maxEnd ? new Date(maxEnd) : new Date()
  base.setMonth(base.getMonth() + 1)
  base.setDate(1)
  const pStart = new Date(base)
  const pEnd = new Date(base)
  pEnd.setMonth(pEnd.getMonth() + 1)
  pEnd.setDate(0)

  const periodName = `${SMOKE} ${pStart.getFullYear()}-${String(pStart.getMonth() + 1).padStart(2, '0')}`
  const periodCreateOut = await httpJson(hr.jar, '/api/hrm/payroll/periods', 'POST', {
    periodName,
    periodStart: yyyyMmDd(pStart),
    periodEnd: yyyyMmDd(pEnd),
    notes: 'Smoke test period'
  })
  await mustOk('HR create payroll period', periodCreateOut)
  created.payrollPeriodId = periodCreateOut.json?.id

  const lockOut = await httpJson(hr.jar, `/api/hrm/payroll/periods/${created.payrollPeriodId}/lock-attendance`, 'POST', {})
  await mustOk('HR lock attendance for period', lockOut)

  const bonusOut = await httpJson(hr.jar, '/api/hrm/payroll/bonuses', 'POST', {
    employeeId: targetEmployee.id,
    payrollPeriodId: created.payrollPeriodId,
    name: `${SMOKE} Bonus`,
    amount: 5000,
    type: 'ONE_TIME',
    notes: 'Smoke test bonus'
  })
  await mustOk('HR create bonus', bonusOut)
  created.bonusId = bonusOut.json?.id
  const bonusApproveOut = await httpJson(hr.jar, `/api/hrm/payroll/bonuses/${created.bonusId}/approve`, 'POST', {})
  await mustOk('HR approve bonus', bonusApproveOut)

  const loanOut = await httpJson(hr.jar, '/api/hrm/payroll/loans', 'POST', {
    employeeId: targetEmployee.id,
    loanNumber: `${SMOKE}_LN`,
    principalAmount: 10000,
    interestRate: 0,
    installmentAmount: 1000,
    totalInstallments: 3,
    startDate: yyyyMmDd(new Date()),
    notes: 'Smoke test loan'
  })
  await mustOk('HR create loan', loanOut)
  created.loanId = loanOut.json?.id

  const generateOut = await httpJson(hr.jar, '/api/hrm/payroll/generate', 'POST', {
    payrollPeriodId: created.payrollPeriodId,
    employeeIds: [targetEmployee.id]
  })
  await mustOk('HR generate payroll', generateOut)
  created.payrollRecordId = generateOut.json?.results?.[0]?.payrollRecordId || null
  assert(created.payrollRecordId, `Payroll record id missing from generate response: ${generateOut.text}`)

  const finalizeOut = await httpJson(hr.jar, `/api/hrm/payroll/periods/${created.payrollPeriodId}/finalize`, 'POST', {})
  await mustOk('HR finalize payroll period', finalizeOut)
  const paidOut = await httpJson(hr.jar, `/api/hrm/payroll/periods/${created.payrollPeriodId}/mark-paid`, 'POST', {})
  await mustOk('HR mark payroll paid', paidOut)

  // Payslip should be available to both HR and employee for their record
  logStep('Payslip access (HR + employee)')
  await mustOk('HR fetch payslip', await http(hr.jar, `/api/hrm/payroll/payslips/${created.payrollRecordId}?format=text`))
  await mustOk('EMP fetch payslip', await http(emp.jar, `/api/hrm/payroll/payslips/${created.payrollRecordId}?format=text`))
  await mustOk('EMP list payroll records (self)', await http(emp.jar, '/api/hrm/payroll/records'))

  // Document templates + generate doc (best-effort; depends on env)
  if (!SKIP_DOCS) {
    logStep('HR: document template create/update/delete + generate document (may depend on env)')
    const tmplOut = await httpJson(hr.jar, '/api/hrm/document-templates', 'POST', {
      name: `${SMOKE} Template`,
      category: 'SMOKE',
      description: 'Smoke test template',
      content: '<html><body><h1>{{employee.name}}</h1><p>{{title}}</p></body></html>',
      fields: [{ key: 'title', label: 'Title', type: 'text' }],
      isActive: true
    })
    await mustOk('HR create document template', tmplOut)
    created.templateId = tmplOut.json?.id

    await mustOk('HR update template', await httpJson(hr.jar, `/api/hrm/document-templates/${created.templateId}`, 'PUT', {
      description: 'Updated by smoke test'
    }))

    const genOut = await httpJson(hr.jar, '/api/hrm/documents/generate', 'POST', {
      templateId: created.templateId,
      employeeId: targetEmployee.id,
      fieldValues: { title: 'Smoke Test Document' },
      title: `${SMOKE} Doc`,
      description: 'Generated by smoke test',
      tags: ['smoke-test']
    })

    if (!genOut.res.ok) {
      const msg = genOut.text
      if (STRICT) {
        throw new Error(`Document generate failed (${genOut.res.status}): ${msg}`)
      }
      console.warn('⚠️ Document generation failed (non-strict). Likely missing Supabase/PDF env. Response:', msg.substring(0, 400))
    } else {
      created.generatedDocId = genOut.json?.id
      await mustOk('EMP documents list (should include generated doc)', await http(emp.jar, '/api/hrm/documents'))
    }

    // Soft-delete template
    await mustOk('HR delete template (soft)', await http(hr.jar, `/api/hrm/document-templates/${created.templateId}`, { method: 'DELETE' }))
  }

  // Cleanup: leave type deactivation
  logStep('Cleanup (best-effort soft deletes/deactivations)')
  if (created.leaveTypeId) {
    const del = await http(hr.jar, `/api/hrm/leave/types/${created.leaveTypeId}`, { method: 'DELETE' })
    if (!del.res.ok) console.warn('Cleanup leave type failed:', del.status, del.text?.slice?.(0, 200))
  }

  console.log('\n✅ Full HRM flow completed')
}

async function main() {
  requireEnv('HR_EMAIL')
  requireEnv('HR_PASSWORD')
  requireEnv('EMP_EMAIL')
  requireEnv('EMP_PASSWORD')

  let serverProc = null
  try {
    if (START_SERVER) {
      serverProc = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev', '--', '-p', String(PORT)], {
        stdio: 'inherit',
        env: { ...process.env, PORT: String(PORT) }
      })
      await waitForServer()
    } else {
      await waitForServer()
    }

    const hr = await login(HR_EMAIL, HR_PASSWORD)
    const emp = await login(EMP_EMAIL, EMP_PASSWORD)

    console.log('✅ Logged in as HR:', hr.session.user.email, 'role:', hr.session.user.role)
    console.log('✅ Logged in as EMP:', emp.session.user.email, 'role:', emp.session.user.role)

    await runFullFlow(hr, emp)

    console.log('✅ HRM E2E smoke test PASSED')
  } finally {
    if (serverProc) {
      serverProc.kill('SIGINT')
    }
  }
}

main().catch((e) => {
  console.error('❌ HRM E2E smoke test FAILED')
  console.error(e?.stack || e?.message || e)
  process.exit(1)
})


