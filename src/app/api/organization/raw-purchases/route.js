import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/organization/raw-purchases
// Fetch all purchase orders with their RFQ data and traceability information
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all purchase orders with related data
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      include: {
        supplier: true,
        lines: {
          include: {
            product: true
          }
        }
      },
      orderBy: { dateCreated: 'desc' }
    });

    // Fetch RFQ data for each PO to get traceability answers
    const rawPurchases = [];

    for (const po of purchaseOrders) {
      let rfqData = null;
      
      // If PO has an RFQ, fetch it with items and traceability answers
      if (po.rfqId) {
        rfqData = await prisma.rFQ.findUnique({
          where: { id: po.rfqId },
          include: {
            vendor: true,
            items: {
              include: {
                product: true
              }
            }
          }
        });
      }

      // Process each PO line
      for (const line of po.lines) {
        // Find corresponding RFQ item for traceability answers
        let traceabilityAnswers = [];
        let animal = null;
        let origin = null;
        let customFields = {};

        if (rfqData) {
          const rfqItem = rfqData.items.find(item => item.productId === line.productId);
          if (rfqItem) {
            // Get traceability answers
            if (Array.isArray(rfqItem.traceabilityAnswers)) {
              traceabilityAnswers = rfqItem.traceabilityAnswers;
            }

            // Get custom field answers
            if (rfqItem.customFieldAnswers && typeof rfqItem.customFieldAnswers === 'object') {
              customFields = rfqItem.customFieldAnswers;
            }
          }
        }

        // Extract Animal, Origin, and Weight from custom fields (case-insensitive)
        // Create a case-insensitive lookup map
        const customFieldMap = {};
        if (customFields && typeof customFields === 'object') {
          Object.entries(customFields).forEach(([key, value]) => {
            customFieldMap[key.toLowerCase()] = value;
          });
        }

        // Extract Animal from custom fields (case-insensitive)
        animal = customFieldMap['animal'] || null;

        // Extract Origin from custom fields (case-insensitive)
        origin = customFieldMap['origin'] || null;

        // Extract Weight from custom fields (case-insensitive)
        const weight = customFieldMap['weight'] || null;

        // If not found in custom fields, try to extract from traceability answers as fallback
        if (!animal) {
          traceabilityAnswers.forEach(answer => {
            const prompt = (answer.prompt || '').toLowerCase();
            if (prompt.includes('animal') && answer.answer) {
              animal = answer.answer;
            }
          });
        }

        if (!origin) {
          traceabilityAnswers.forEach(answer => {
            const prompt = (answer.prompt || '').toLowerCase();
            if ((prompt.includes('origin') || prompt.includes('country')) && answer.answer) {
              origin = answer.answer;
            }
          });
        }

        // Calculate square feet (approximate) - you may need to adjust this based on your calculation logic
        const sqFtApprox = weight ? (parseFloat(weight) * 10).toFixed(2) : null; // Placeholder calculation

        rawPurchases.push({
          id: line.poLineId,
          slNo: rawPurchases.length + 1,
          invoiceDate: po.dateCreated.toISOString().split('T')[0],
          invoiceNo: po.poId, // Using PO ID as invoice number
          supplier: po.supplier?.name || 'N/A',
          supplierId: po.supplierId,
          vendor: rfqData?.vendor?.name || po.supplier?.name || 'N/A',
          vendorId: rfqData?.vendorId || null,
          animal: animal && String(animal).trim() !== '' ? String(animal) : 'N/A',
          origin: origin && String(origin).trim() !== '' ? String(origin) : 'N/A',
          weight: weight && String(weight).trim() !== '' ? String(weight) : null,
          pcs: line.quantityOrdered,
          sqFtApprox: sqFtApprox,
          productId: line.productId,
          productName: line.product?.name || 'N/A',
          productDescription: line.product?.description || '',
          category: line.product?.category || '',
          unit: line.product?.unit || '',
          price: parseFloat(line.price) || 0,
          quantityOrdered: line.quantityOrdered,
          quantityReceived: line.quantityReceived,
          poId: po.poId,
          rfqId: po.rfqId,
          traceabilityAnswers: traceabilityAnswers,
          customFields: customFields,
          traceabilityQuestions: Array.isArray(line.product?.traceabilityQuestions) 
            ? line.product.traceabilityQuestions 
            : []
        });
      }
    }

    return NextResponse.json({ success: true, data: rawPurchases });
  } catch (error) {
    console.error('Error fetching raw purchases:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

