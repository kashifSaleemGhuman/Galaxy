import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { hasPermission, PERMISSIONS } from '@/lib/constants/roles';

const normalizeTraceabilityAnswers = (input) => {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((entry) => {
      if (!entry) return null;
      const questionId =
        typeof entry.questionId === 'string'
          ? entry.questionId.trim()
          : typeof entry.id === 'string'
            ? entry.id.trim()
            : '';
      if (!questionId) return null;
      const rawAnswer =
        entry.answer ?? entry.value ?? entry.response ?? entry.text ?? '';
      const answer =
        typeof rawAnswer === 'string' ? rawAnswer.trim() : rawAnswer;
      return { questionId, answer };
    })
    .filter((entry) => entry && entry.answer !== undefined && entry.answer !== null && `${entry.answer}`.trim() !== '');
};

const hasAnswerValue = (value) =>
  value !== undefined &&
  value !== null &&
  `${value}`.trim() !== '';

// Force dynamic rendering - this route uses getServerSession which requires headers()
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!rfqId) {
      return NextResponse.json({ error: 'RFQ ID is required' }, { status: 400 });
    }

    const { vendorNotes, items } = await req.json();

    // Validate items array is provided
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'items array with pricing and delivery dates is required' }, { status: 400 });
    }

    // Validate all items have required fields
    for (const item of items) {
      if (!item.productId) {
        return NextResponse.json({ error: 'Each item must have a productId' }, { status: 400 });
      }
      if (item.unitPrice === undefined || item.unitPrice === null || item.unitPrice === '') {
        return NextResponse.json({ error: 'Each item must have a unitPrice' }, { status: 400 });
      }
      if (!item.expectedDeliveryDate) {
        return NextResponse.json({ error: 'Each item must have an expectedDeliveryDate' }, { status: 400 });
      }
    }

    const sanitizedItems = items.map((item) => ({
      ...item,
      traceabilityAnswers: normalizeTraceabilityAnswers(item.traceabilityAnswers),
    }));

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const rfq = await prisma.rFQ.findUnique({
      where: { id: rfqId },
      include: { 
        vendor: true, 
        createdBy: true,
        items: { include: { product: true } }
      }
    });

    if (!rfq) {
      return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });
    }

    // Creator, manager, or admin can record quote
    // Users can record quotes for their own RFQs, or if they have purchase permissions
    const canRecord = rfq.createdById === currentUser.id || 
                     hasPermission(currentUser.role, PERMISSIONS.PURCHASE.VIEW_ALL) ||
                     hasPermission(currentUser.role, PERMISSIONS.PURCHASE.CREATE_RFQ);
    if (!canRecord) {
      return NextResponse.json({ error: 'Access denied. You can only record quotes for RFQs you created, or if you have purchase permissions.' }, { status: 403 });
    }

    const rfqItemsByProduct = new Map(
      rfq.items.map((rfqItem) => [rfqItem.productId, rfqItem])
    );

    const enrichedItems = [];

    for (const item of sanitizedItems) {
      const rfqItem = rfqItemsByProduct.get(item.productId);
      if (!rfqItem) {
        return NextResponse.json(
          { error: 'Product not found in RFQ items' },
          { status: 400 }
        );
      }

      const productQuestions = Array.isArray(rfqItem.product?.traceabilityQuestions)
        ? rfqItem.product.traceabilityQuestions
        : [];

      const answersByQuestionId = new Map(
        item.traceabilityAnswers.map((answer) => [answer.questionId, answer])
      );

      const missingRequired = productQuestions
        .filter((question) => question.required !== false)
        .filter((question) => {
          const answer = answersByQuestionId.get(question.id);
          return !answer || !hasAnswerValue(answer.answer);
        });

      if (missingRequired.length > 0) {
        return NextResponse.json(
          {
            error: `Traceability answers required for ${rfqItem.product?.name || 'product'}: ${missingRequired
              .map((q) => q.prompt)
              .join(', ')}`,
          },
          { status: 400 }
        );
      }

      const normalizedAnswers = productQuestions.reduce((acc, question) => {
        const answer = answersByQuestionId.get(question.id);
        if (!answer || !hasAnswerValue(answer.answer)) {
          return acc;
        }

        acc.push({
          questionId: question.id,
          prompt: question.prompt,
          type: question.type || 'text',
          answer: answer.answer,
        });

        return acc;
      }, []);

      // Validate and normalize custom field answers
      const productAttributes = rfqItem.product?.attributes || {};
      let normalizedCustomFields = {};
      
      // Only validate custom fields if product has attributes
      if (productAttributes && typeof productAttributes === 'object' && Object.keys(productAttributes).length > 0) {
        const customFieldAnswers = item.customFieldAnswers || {};
        const attributeKeys = Object.keys(productAttributes);
        
        // Validate all custom fields are provided
        const missingCustomFields = attributeKeys.filter((key) => {
          const value = customFieldAnswers[key];
          return !value || !hasAnswerValue(value);
        });

        if (missingCustomFields.length > 0) {
          return NextResponse.json(
            {
              error: `Custom field values required for ${rfqItem.product?.name || 'product'}: ${missingCustomFields.join(', ')}`,
            },
            { status: 400 }
          );
        }

        // Normalize custom field answers (only include fields that exist in product attributes)
        normalizedCustomFields = attributeKeys.reduce((acc, key) => {
          const value = customFieldAnswers[key];
          if (value && hasAnswerValue(value)) {
            acc[key] = typeof value === 'string' ? value.trim() : value;
          }
          return acc;
        }, {});
      }

      enrichedItems.push({
        ...item,
        traceabilityAnswers: normalizedAnswers,
        customFieldAnswers: normalizedCustomFields,
      });
    }

    const totalPrice = enrichedItems.reduce((sum, item) => {
      return sum + (parseFloat(item.unitPrice || 0) * parseInt(item.quantity || 0));
    }, 0);

    const allDates = enrichedItems
      .map(item => item.expectedDeliveryDate)
      .filter(date => date)
      .sort();
    const earliestDeliveryDate = allDates[0];

    // Note: Using sequential operations instead of transaction because Prisma Accelerate doesn't support transactions
    const updatedRfq = await prisma.rFQ.update({
      where: { id: params.id },
      data: {
        vendorPrice: parseFloat(totalPrice),
        expectedDelivery: new Date(earliestDeliveryDate),
        vendorNotes: vendorNotes || null,
        status: 'received'
      },
      include: {
        vendor: true,
        createdBy: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } }
      }
    });

    // Update RFQ items with per-item pricing and delivery dates
    await Promise.all(
      enrichedItems.map(async (item) => {
        // Find the RFQ item by productId
        const rfqItem = updatedRfq.items.find(
          rfqItem => rfqItem.productId === item.productId
        );
        
        if (rfqItem) {
          await prisma.rFQItem.update({
            where: { id: rfqItem.id },
            data: {
              unitPrice: parseFloat(item.unitPrice),
              expectedDeliveryDate: new Date(item.expectedDeliveryDate),
              traceabilityAnswers: item.traceabilityAnswers,
              customFieldAnswers: item.customFieldAnswers || {}
            }
          });
        } else {
          console.warn(`RFQ item not found for productId: ${item.productId}`);
        }
      })
    );

    // Create audit log (non-blocking)
    try {
      await prisma.auditLog.create({
        data: {
          userId: currentUser.id,
          action: 'RECORD_RFQ_QUOTE',
          details: `Recorded vendor quote for RFQ ${rfq.rfqNumber}`
        }
      });
    } catch (auditError) {
      console.warn('Failed to create audit log for RFQ quote:', auditError);
      // Continue - RFQ was successfully updated
    }

    const updated = updatedRfq;

    // For approvals screen, 'received' is considered pending manager approval
    return NextResponse.json({ success: true, rfq: updated });
  } catch (error) {
    console.error('Error recording vendor quote:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ 
      error: 'Failed to record vendor quote',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
