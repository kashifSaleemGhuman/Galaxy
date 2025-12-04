import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { id } = params

    const employee = await prisma.employee.findUnique({
      where: { id }
    })

    if (!employee) {
      return new NextResponse('Employee not found', { status: 404 })
    }

    return NextResponse.json(employee)
  } catch (error) {
    console.error('[EMPLOYEE_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { id } = params
    const body = await req.json()
    const {
      employeeId,
      idCardNumber,
      name,
      photo,
      parentName,
      dob,
      address,
      gender,
      contactNumber,
      emergencyContact,
      dateOfJoining,
      department,
      lastEmployment,
      process,
      designation,
      salary,
      dateOfLeaving,
      shift,
      secondaryJob,
      isFirstAider,
      isEmergencyResponder,
      isFirefighter
    } = body

    // Basic validation
    if (!employeeId || !name) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        employeeId,
        idCardNumber,
        name,
        photo,
        parentName,
        dob: dob ? new Date(dob) : null,
        address,
        gender,
        contactNumber,
        emergencyContact,
        dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : null,
        department,
        lastEmployment,
        process,
        designation,
        salary: salary ? parseFloat(salary) : null,
        dateOfLeaving: dateOfLeaving ? new Date(dateOfLeaving) : null,
        shift,
        secondaryJob,
        isFirstAider: isFirstAider || false,
        isEmergencyResponder: isEmergencyResponder || false,
        isFirefighter: isFirefighter || false
      }
    })

    return NextResponse.json(employee)
  } catch (error) {
    console.error('[EMPLOYEE_UPDATE]', error)
    if (error.code === 'P2002') {
      return new NextResponse('Employee ID already exists', { status: 400 })
    }
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { id } = params

    await prisma.employee.delete({
      where: { id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[EMPLOYEE_DELETE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

