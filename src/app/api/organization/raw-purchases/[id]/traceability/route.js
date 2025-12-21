import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/organization/raw-purchases/[id]/traceability
// Get traceability data for a specific product in a purchase
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params if it's a Promise (Next.js 15+)
    const resolvedParams = await params;
    const { id } = resolvedParams; // This is the poLineId

    if (!id) {
      return NextResponse.json({ error: 'Purchase order line ID is required' }, { status: 400 });
    }

    // Fetch traceability data with error handling
    let traceability = null;
    try {
      traceability = await prisma.productTraceability.findUnique({
        where: { poLineId: id },
        include: {
          poLine: {
            include: {
              product: true,
              purchaseOrder: {
                include: {
                  supplier: true
                }
              }
            }
          }
        }
      });
    } catch (dbError) {
      // If traceability table doesn't exist or connection fails, continue to fetch PO line
      console.warn('Could not fetch traceability data:', dbError.message);
    }

    // If traceability doesn't exist, still fetch the PO line info
    let poLine = traceability?.poLine;
    if (!poLine) {
      try {
        poLine = await prisma.pOLine.findUnique({
          where: { poLineId: id },
          include: {
            product: true,
            purchaseOrder: {
              include: {
                supplier: true
              }
            }
          }
        });
      } catch (dbError) {
        console.error('Error fetching PO line:', dbError);
        // Check if it's a connection error
        if (dbError.message?.includes('Can\'t reach database server') || 
            dbError.message?.includes('P1001') ||
            dbError.message?.includes('connection')) {
          return NextResponse.json({ 
            error: 'Database connection failed. Please check your database configuration.',
            details: 'Unable to connect to the database server. Please verify DATABASE_URL or PRISMA_DATABASE_URL in your environment variables.'
          }, { status: 503 });
        }
        throw dbError;
      }
    }

    if (!poLine) {
      return NextResponse.json({ error: 'Purchase order line not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: traceability || null,
      poLine: poLine
    });
  } catch (error) {
    console.error('Error fetching traceability:', error);
    
    // Handle specific database connection errors
    if (error.message?.includes('Can\'t reach database server') || 
        error.message?.includes('P1001') ||
        error.code === 'P1001') {
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: 'Unable to connect to the database server. Please check your database configuration and ensure the database is running.',
        message: error.message
      }, { status: 503 });
    }
    
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch traceability data' 
    }, { status: 500 });
  }
}

// POST /api/organization/raw-purchases/[id]/traceability
// Create or update traceability data for a specific product in a purchase
export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params if it's a Promise (Next.js 15+)
    const resolvedParams = await params;
    const { id } = resolvedParams; // This is the poLineId
    
    if (!id) {
      return NextResponse.json({ error: 'Purchase order line ID is required' }, { status: 400 });
    }
    
    const body = await req.json();

    // Validate poLineId exists
    const poLine = await prisma.pOLine.findUnique({
      where: { poLineId: id }
    });

    if (!poLine) {
      return NextResponse.json({ error: 'Purchase order line not found' }, { status: 404 });
    }

    // Prepare data - handle JSON fields
    const traceabilityData = {
      poLineId: id,
      // Farm Section
      farmId: body.farm?.farmId || null,
      animalType: body.farm?.animalType || null,
      farmLocation: body.farm?.location || null,
      farmCertifications: body.farm?.certifications ? (Array.isArray(body.farm.certifications) ? body.farm.certifications : []) : [],
      
      // Slaughter House Section
      supplier: body.slaughterHouse?.supplier || null,
      slaughterAnimalType: body.slaughterHouse?.animalType || null,
      origin: body.slaughterHouse?.origin || null,
      hideSkinType: body.slaughterHouse?.hideSkinType || null,
      hideSkinId: body.slaughterHouse?.hideSkinId || null,
      slaughterDate: body.slaughterHouse?.slaughterDate ? new Date(body.slaughterHouse.slaughterDate) : null,
      slaughterLocation: body.slaughterHouse?.location || null,
      slaughterCertifications: body.slaughterHouse?.certifications ? (Array.isArray(body.slaughterHouse.certifications) ? body.slaughterHouse.certifications : []) : [],
      
      // Tannery Section
      tanneryName: body.tannery?.tanneryName || null,
      tanneryLocation: body.tannery?.tanneryLocation || null,
      tanningType: body.tannery?.tanningType || null,
      article: body.tannery?.article || null,
      vehicleNumber: body.tannery?.vehicleNumber || null,
      processedLotNumber: body.tannery?.processedLotNumber || null,
      envParameters: body.tannery?.envParameters ? (typeof body.tannery.envParameters === 'object' ? body.tannery.envParameters : {}) : {},
      tanneryCertifications: body.tannery?.certifications ? (Array.isArray(body.tannery.certifications) ? body.tannery.certifications : []) : [],
      
      // Factory Section
      factoryName: body.factory?.factoryName || null,
      factoryLocation: body.factory?.factoryLocation || null,
      materialType: body.factory?.materialType || null,
      product: body.factory?.product || null,
      finishDate: body.factory?.finishDate ? new Date(body.factory.finishDate) : null,
      hardLabourUsed: body.factory?.hardLabourUsed || null,
      care: body.factory?.care || null,
      brand: body.factory?.brand || null,
      factoryCertification: body.factory?.certification || null,
    };

    // Use upsert to create or update
    const traceability = await prisma.productTraceability.upsert({
      where: { poLineId: id },
      update: traceabilityData,
      create: traceabilityData,
      include: {
        poLine: {
          include: {
            product: true,
            purchaseOrder: {
              include: {
                supplier: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: traceability,
      message: 'Traceability data saved successfully'
    });
  } catch (error) {
    console.error('Error saving traceability:', error);
    
    // Handle specific database connection errors
    if (error.message?.includes('Can\'t reach database server') || 
        error.message?.includes('P1001') ||
        error.code === 'P1001') {
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: 'Unable to connect to the database server. Please check your database configuration and ensure the database is running.',
        message: error.message
      }, { status: 503 });
    }
    
    return NextResponse.json({ 
      error: error.message || 'Failed to save traceability data' 
    }, { status: 500 });
  }
}

