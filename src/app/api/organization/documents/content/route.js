import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/organization/documents/content?documentName=...
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const documentName = searchParams.get('documentName');

    if (!documentName) {
      return NextResponse.json({ error: 'Document name is required' }, { status: 400 });
    }

    // Find document by name
    const document = await prisma.document.findUnique({
      where: { name: documentName },
      include: {
        content: true,
        revisions: {
          orderBy: { revisionNo: 'desc' },
          take: 10 // Get last 10 revisions
        }
      }
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        document,
        content: document.content,
        revisions: document.revisions
      }
    });
  } catch (error) {
    console.error('Error fetching document content:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// POST /api/organization/documents/content - Create or update document content
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is admin
    const role = (currentUser.role || '').toUpperCase();
    const isAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN';
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Only admins can edit documents' }, { status: 403 });
    }

    const body = await req.json();
    const { documentName, content, changeDescription } = body;

    if (!documentName || !content) {
      return NextResponse.json(
        { error: 'Document name and content are required' },
        { status: 400 }
      );
    }

    // Find document by name
    const document = await prisma.document.findUnique({
      where: { name: documentName },
      include: { content: true }
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    let documentContent;
    let revisionNo = 1;
    let revisionDate = new Date();

    if (document.content) {
      // Update existing content - increment revision
      revisionNo = document.content.revisionNo + 1;
      
      // Save current content as revision history (only if it doesn't already exist)
      try {
        await prisma.documentRevision.create({
          data: {
            documentId: document.id,
            documentName: document.name,
            revisionNo: document.content.revisionNo,
            revisionDate: document.content.revisionDate,
            content: document.content.content,
            editedBy: document.content.lastEditedBy,
            changeDescription: `Previous revision ${document.content.revisionNo}`
          }
        });
      } catch (error) {
        // If revision already exists, skip it (this is fine - it means we already have this revision in history)
        if (error.code === 'P2002' && error.meta?.target?.includes('revisionNo')) {
          console.log(`Revision ${document.content.revisionNo} already exists in history, skipping`);
        } else {
          // Re-throw if it's a different error
          throw error;
        }
      }

      // Update content with new revision
      documentContent = await prisma.documentContent.update({
        where: { documentId: document.id },
        data: {
          content,
          revisionNo,
          revisionDate,
          lastEditedBy: currentUser.id,
          lastEditedAt: revisionDate
        }
      });
    } else {
      // Create new content
      documentContent = await prisma.documentContent.create({
        data: {
          documentId: document.id,
          documentName: document.name,
          content,
          revisionNo: 1,
          revisionDate,
          lastEditedBy: currentUser.id,
          lastEditedAt: revisionDate
        }
      });
    }

    // Update document's revDate
    const revDateStr = revisionDate.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).replace(/\//g, '-');
    
    await prisma.document.update({
      where: { id: document.id },
      data: {
        revDate: `Rev.No-${String(revisionNo).padStart(2, '0')}/Date-${revDateStr}`
      }
    });

    // Save current revision to history (only if it doesn't already exist)
    try {
      await prisma.documentRevision.create({
        data: {
          documentId: document.id,
          documentName: document.name,
          revisionNo,
          revisionDate,
          content,
          editedBy: currentUser.id,
          changeDescription: changeDescription || `Revision ${revisionNo}`
        }
      });
    } catch (error) {
      // If revision already exists, update it instead
      if (error.code === 'P2002' && error.meta?.target?.includes('revisionNo')) {
        await prisma.documentRevision.update({
          where: {
            documentId_revisionNo: {
              documentId: document.id,
              revisionNo: revisionNo
            }
          },
          data: {
            documentName: document.name,
            revisionDate,
            content,
            editedBy: currentUser.id,
            changeDescription: changeDescription || `Revision ${revisionNo}`
          }
        });
      } else {
        // Re-throw if it's a different error
        throw error;
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: documentContent,
      message: `Document updated successfully. Revision ${revisionNo} created.`
    }, { status: 201 });
  } catch (error) {
    console.error('Error updating document content:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

