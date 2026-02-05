import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ROLES } from '@/lib/constants/roles'
import { createInitialAccrual } from '@/lib/leave-accrual-helper'

/**
 * POST /api/hrm/leave/policies/assign
 * Assign a leave policy to an employee or department (HR only)
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has HR permissions
    const isHR = [ROLES.HR_MANAGER, ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(session.user.role)
    if (!isHR) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { policyId, employeeId, departmentId, effectiveFrom, effectiveTo } = body

    // Validate required fields
    if (!policyId || !effectiveFrom) {
      return NextResponse.json(
        { error: 'Policy ID and effective from date are required' },
        { status: 400 }
      )
    }

    // Must have either employeeId or departmentId, but not both
    if (!employeeId && !departmentId) {
      return NextResponse.json(
        { error: 'Either employee ID or department ID is required' },
        { status: 400 }
      )
    }

    if (employeeId && departmentId) {
      return NextResponse.json(
        { error: 'Cannot assign to both employee and department' },
        { status: 400 }
      )
    }

    // Check if policy exists and get leave type
    const policy = await prisma.leavePolicy.findUnique({
      where: { id: policyId },
      include: {
        leaveType: true
      }
    })

    if (!policy) {
      return NextResponse.json(
        { error: 'Leave policy not found' },
        { status: 404 }
      )
    }

    // If assigning to employee, check if employee exists
    if (employeeId) {
      const employee = await prisma.employee.findUnique({
        where: { id: employeeId }
      })

      if (!employee) {
        return NextResponse.json(
          { error: 'Employee not found' },
          { status: 404 }
        )
      }

      // Deactivate previous assignment for this employee and policy
      await prisma.leavePolicyAssignment.updateMany({
        where: {
          employeeId,
          policyId,
          isActive: true
        },
        data: {
          isActive: false,
          effectiveTo: new Date(effectiveFrom)
        }
      })
    }

    // Create new assignment
    const assignment = await prisma.leavePolicyAssignment.create({
      data: {
        policyId,
        employeeId: employeeId || null,
        departmentId: departmentId || null,
        effectiveFrom: new Date(effectiveFrom),
        effectiveTo: effectiveTo ? new Date(effectiveTo) : null,
        isActive: true
      },
      include: {
        policy: {
          include: {
            leaveType: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          }
        },
        employee: employeeId ? {
          select: {
            id: true,
            name: true,
            employeeId: true
          }
        } : false
      }
    })

    // Automatically create initial accrual for individual employee assignments
    if (employeeId && policy.accrualType !== 'NONE') {
      try {
        await createInitialAccrual(
          employeeId,
          policy.leaveTypeId,
          policy,
          effectiveFrom,
          session.user.id
        )
      } catch (error) {
        console.error('Error creating initial accrual (non-blocking):', error)
        // Don't fail the assignment if accrual creation fails
      }
    }

    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    console.error('Error assigning leave policy:', error)
    return NextResponse.json(
      { error: 'Failed to assign leave policy' },
      { status: 500 }
    )
  }
}

