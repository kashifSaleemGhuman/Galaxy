import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';

export const runtime = 'nodejs';

export async function GET() {
	try {
		const session = await getServerSession();
		if (!session?.user?.email) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const currentUser = await prisma.user.findUnique({
			where: { email: session.user.email }
		});

		if (!currentUser) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		// Regular users only see their own RFQs for stats as well
		const baseWhere = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PURCHASE_MANAGER].includes(currentUser.role)
			? {}
			: { createdById: currentUser.id };

		const now = new Date();

		const [draftCount, sentCount, lateRFQCount] = await Promise.all([
			prisma.rFQ.count({ where: { ...baseWhere, status: 'draft' } }),
			prisma.rFQ.count({ where: { ...baseWhere, status: 'sent' } }),
			prisma.rFQ.count({
				where: {
					...baseWhere,
					orderDeadline: { lt: now },
					status: { notIn: ['approved', 'rejected', 'cancelled'] }
				}
			})
		]);

		// Not acknowledged: using 'sent' as proxy (no explicit ack flag yet)
		const notAcknowledgedCount = sentCount;

		// Late receipt requires GRN table which we may not have; return 0 for now
		const lateReceiptCount = 0;

		// Average days to order: from sent/created to approved
		const approvedRfqs = await prisma.rFQ.findMany({
			where: { ...baseWhere, status: 'approved' },
			select: { createdAt: true, sentDate: true, approvedAt: true, updatedAt: true }
		});

		let daysToOrder = '0.00';
		if (approvedRfqs.length > 0) {
			const totalDays = approvedRfqs.reduce((sum, r) => {
				const start = r.sentDate ? new Date(r.sentDate) : new Date(r.createdAt);
				const end = r.approvedAt ? new Date(r.approvedAt) : new Date(r.updatedAt);
				return sum + (end - start) / (1000 * 60 * 60 * 24);
			}, 0);
			daysToOrder = (totalDays / approvedRfqs.length).toFixed(2);
		}

		return NextResponse.json({
			stats: {
				new: draftCount,
				rfqSent: sentCount,
				lateRFQ: lateRFQCount,
				notAcknowledged: notAcknowledgedCount,
				lateReceipt: lateReceiptCount,
				daysToOrder
			}
		});
	} catch (error) {
		console.error('Error generating purchase stats:', error);
		return NextResponse.json({ error: 'Failed to compute stats' }, { status: 500 });
	}
}
