import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';

// GET /api/organization
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Allow all authenticated users to view organization details?
    // Or restrict to specific roles? Usually everyone needs to see company details (e.g. for reports)
    // But editing is admin only.

    const organization = await prisma.organization.findFirst({
      orderBy: { createdAt: 'desc' } // Assuming one, or get latest
    });

    return NextResponse.json(organization || {});
  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/organization
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user role from database to ensure accuracy
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is admin (case-insensitive check)
    const userRole = user.role?.toLowerCase();
    const isAdmin = userRole === ROLES.SUPER_ADMIN.toLowerCase() || userRole === ROLES.ADMIN.toLowerCase();
    
    if (!isAdmin) {
      console.log('[Organization API] Access denied for role:', user.role);
      return NextResponse.json({ 
        error: 'Forbidden: Only administrators can modify organization details',
        role: user.role 
      }, { status: 403 });
    }

    const body = await req.json();
    const {
      id, // If updating
      companyName,
      companyLogo,
      shortName,
      address,
      factoryContactNo,
      email,
      fullAddress,
      auditDate,
      internalAuditorNames,
      dataFrom,
      // Section 1
      siteNameLocalLanguage,
      siteURN,
      fullestScopeOfOperations,
      abbreviations,
      // Section 2
      companyRegistrationNumber,
      // Section 3
      latitude,
      longitude,
      // Section 4
      country,
      // Section 5
      telephoneNumber,
      // Section 6a
      principalContactName,
      principalContactPosition,
      principalContactEmail,
      // Section 6b
      environmentalResponsibleName,
      environmentalResponsiblePosition,
      environmentalResponsibleEmail,
      // Additional
      lwgCommunicationsMembers,
      website,
      facilityDescription,
      totalSiteArea,
      siteAreaBoundaries,
      // Workforce - Direct Labour
      directLabourShiftAM,
      directLabourShiftPM,
      directLabourShiftNight,
      directLabourCount,
      // Workforce - Indirect Labour
      indirectLabourShiftAM,
      indirectLabourShiftPM,
      indirectLabourShiftNight,
      indirectLabourCount,
      // Workforce - Shift Total
      shiftTotalAM,
      shiftTotalPM,
      shiftTotalNight,
      shiftTotal,
      // Operating Schedule - Worker
      workerDaysPerWeek,
      workerWeeksPerYear,
      workerDaysPerYear,
      // Operating Schedule - Manufacturing operations
      manufacturingDaysPerWeek,
      manufacturingWeeksPerYear,
      manufacturingDaysPerYear,
      // Environmental
      environmentalImpacts,
      operationsForOtherOrganisations
    } = body;

    if (!companyName) {
      return NextResponse.json({ error: 'Company Name is required' }, { status: 400 });
    }

    let organization;
    
    // Check if an organization record already exists
    const existingOrg = await prisma.organization.findFirst();

    const organizationData = {
      companyName,
      companyLogo,
      shortName,
      address,
      factoryContactNo,
      email,
      fullAddress,
      auditDate: auditDate ? new Date(auditDate) : null,
      internalAuditorNames: internalAuditorNames ? JSON.parse(JSON.stringify(internalAuditorNames)) : null,
      dataFrom: dataFrom ? new Date(dataFrom) : null,
      // Section 1
      siteNameLocalLanguage,
      siteURN,
      fullestScopeOfOperations,
      abbreviations: abbreviations ? JSON.parse(JSON.stringify(abbreviations)) : null,
      // Section 2
      companyRegistrationNumber,
      // Section 3
      latitude,
      longitude,
      // Section 4
      country,
      // Section 5
      telephoneNumber,
      // Section 6a
      principalContactName,
      principalContactPosition,
      principalContactEmail,
      // Section 6b
      environmentalResponsibleName,
      environmentalResponsiblePosition,
      environmentalResponsibleEmail,
      // Additional
      lwgCommunicationsMembers: lwgCommunicationsMembers ? JSON.parse(JSON.stringify(lwgCommunicationsMembers)) : null,
      website,
      facilityDescription,
      totalSiteArea,
      siteAreaBoundaries,
      // Workforce - Direct Labour
      directLabourShiftAM: directLabourShiftAM ? parseInt(directLabourShiftAM) : null,
      directLabourShiftPM: directLabourShiftPM ? parseInt(directLabourShiftPM) : null,
      directLabourShiftNight: directLabourShiftNight ? parseInt(directLabourShiftNight) : null,
      directLabourCount: directLabourCount ? parseInt(directLabourCount) : null,
      // Workforce - Indirect Labour
      indirectLabourShiftAM: indirectLabourShiftAM ? parseInt(indirectLabourShiftAM) : null,
      indirectLabourShiftPM: indirectLabourShiftPM ? parseInt(indirectLabourShiftPM) : null,
      indirectLabourShiftNight: indirectLabourShiftNight ? parseInt(indirectLabourShiftNight) : null,
      indirectLabourCount: indirectLabourCount ? parseInt(indirectLabourCount) : null,
      // Workforce - Shift Total
      shiftTotalAM: shiftTotalAM ? parseInt(shiftTotalAM) : null,
      shiftTotalPM: shiftTotalPM ? parseInt(shiftTotalPM) : null,
      shiftTotalNight: shiftTotalNight ? parseInt(shiftTotalNight) : null,
      shiftTotal: shiftTotal ? parseInt(shiftTotal) : null,
      // Operating Schedule - Worker
      workerDaysPerWeek: workerDaysPerWeek ? parseInt(workerDaysPerWeek) : null,
      workerWeeksPerYear: workerWeeksPerYear ? parseInt(workerWeeksPerYear) : null,
      workerDaysPerYear: workerDaysPerYear ? parseInt(workerDaysPerYear) : null,
      // Operating Schedule - Manufacturing operations
      manufacturingDaysPerWeek: manufacturingDaysPerWeek ? parseInt(manufacturingDaysPerWeek) : null,
      manufacturingWeeksPerYear: manufacturingWeeksPerYear ? parseInt(manufacturingWeeksPerYear) : null,
      manufacturingDaysPerYear: manufacturingDaysPerYear ? parseInt(manufacturingDaysPerYear) : null,
      // Environmental
      environmentalImpacts,
      operationsForOtherOrganisations
    };

    if (existingOrg) {
      // Update existing
      organization = await prisma.organization.update({
        where: { id: existingOrg.id },
        data: organizationData
      });
    } else {
      // Create new
      organization = await prisma.organization.create({
        data: organizationData
      });
    }

    return NextResponse.json(organization);
  } catch (error) {
    console.error('Error saving organization:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}













