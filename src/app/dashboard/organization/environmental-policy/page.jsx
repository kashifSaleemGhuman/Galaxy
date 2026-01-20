'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import EditableSection from '@/components/documents/EditableSection';

export default function EnvironmentalPolicyPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [documentInfo, setDocumentInfo] = useState(null);
  const [content, setContent] = useState({
    policyStatement: [
      'ESF LEATHER is committed to managing environmental matters as an integral part of our business planning and decisions. Manufacturing and environmental protection must continue to be compatible goals. To obtain these goals, we will adhere to the following principles.',
      'ESF LEATHER is committed to manage environmental impact, prevention of pollution is an integral part of our operations and to always assure the environmental integrity of our processes and facilities. We will do so by adhering to the following principles:'
    ],
    employeeManagement: {
      description: 'Employee management systems and procedures specifically designed to minimize the use of hazardous materials, energy, and other natural resources.',
      items: [
        'Always meet or exceed all applicable legislations that organization subscribes.',
        'Promote participation and communicate our commitment by promoting environmental responsibility among our employees; by providing the necessary training and support to enable them to implement this policy.',
        'By informing suppliers about our environmental management practices; and by soliciting input from our employees, suppliers, customers in meeting our environmental goals.'
      ]
    },
    pollutionPrevention: [
      'We are committed to pollution prevention and the continual improvement of our environmental performance.',
      'We will employ management systems, training and procedures designed to prevent activities and/or conditions that pose a threat to human health, safety, or the environment, and we will work to minimize our impact on the environment.'
    ],
    resourceConservation: [
      'Reduce water usage in production and other areas of the facility to minimize usage of natural resources.',
      'Energy reduction in all areas of the facility including production, offices, and general areas of work premise to reduce excess consumption.',
      'Air and noise pollution reduction to reduce the impact on environment.'
    ],
    wasteManagement: [
      'Waste management systems and procedures specifically designed to minimize the use of hazardous materials.',
      'Adopt production techniques that will minimize the generation of waste, and to enable recycling and reuse of materials.'
    ],
    communicationTraining: 'We will communicate our commitment to environmental commitment to all stakeholders and to our set company\'s environmental performance objectives to our employees. Environmental commitment to vendors, customers, and external stakeholders.',
    continuousImprovement: [
      'We will measure our progress as best we can and report on our efforts on an annual basis. We will continuously seek opportunities to improve our adherence to these principles and to improve our environmental performance.',
      'We will continually seek opportunities for continual improvement of our environmental performance by establishing objectives & targets, measuring progress, and reporting our results; including but not limited to resource conservation, waste reduction, and pollution prevention.'
    ],
    compliance: 'We will comply with applicable laws and regulations and will implement programs and procedures to ensure compliance. ESF LEATHER shall promote a workplace in which all employees are properly trained to comply with environmental requirements and procedures, to meet environmental program goals, and to take the personal responsibility for implementation of the program.',
    publicAccess: [
      'Management at all levels of ESF LEATHER are responsible for ensuring that this policy is communicated and adhered to by all employees and subcontractors, and that it is made available to interested members of the public.',
      'Further if public has any complaints about our operations one can raise the same at compliant register available at our facility Entrance.'
    ]
  });

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN';

  useEffect(() => {
    fetchDocumentContent();
  }, []);

  const fetchDocumentContent = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/organization/documents/content?documentName=EMS POLICY');
      const data = await res.json();
      
      if (res.ok) {
        if (data.data?.content) {
          setContent(data.data.content.content);
          setDocumentInfo({
            docNo: data.data.document.docNo || 'ESF-EMS-POL-01',
            revDate: data.data.document.revDate || 'Rev.No-03/Date-16-09-2023',
            revisionNo: data.data.content.revisionNo,
            revisionDate: data.data.content.revisionDate
          });
        } else {
          // Initialize with default content
          setDocumentInfo({
            docNo: 'ESF-EMS-POL-01',
            revDate: 'Rev.No-03/Date-16-09-2023',
            revisionNo: 1,
            revisionDate: new Date()
          });
        }
      }
    } catch (error) {
      console.error('Error fetching document content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSection = async (sectionKey, sectionContent) => {
    try {
      const updatedContent = {
        ...content,
        [sectionKey]: sectionContent
      };

      const res = await fetch('/api/organization/documents/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName: 'EMS POLICY',
          content: updatedContent,
          changeDescription: `Updated ${sectionKey} section`
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save changes');
      }

      setContent(updatedContent);
      
      // Update document info with new revision
      if (data.data) {
        const revDateStr = new Date(data.data.revisionDate).toLocaleDateString('en-GB', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        }).replace(/\//g, '-');
        
        setDocumentInfo({
          docNo: 'ESF-EMS-POL-01',
          revDate: `Rev.No-${String(data.data.revisionNo).padStart(2, '0')}/Date-${revDateStr}`,
          revisionNo: data.data.revisionNo,
          revisionDate: data.data.revisionDate
        });
      }

      setToast({ type: 'success', message: data.message || 'Document updated successfully. Revision number incremented.' });
    } catch (error) {
      console.error('Error saving section:', error);
      throw error;
    }
  };

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'documents', label: 'Document Details', href: '/dashboard/organization/documents' },
    { key: 'environmental-policy', label: 'Environmental Policy', href: '#' },
  ];

  const handleNavigate = (index, item) => {
    if (item.href) router.push(item.href);
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-10">
        <Breadcrumbs items={breadcrumbs} onNavigate={handleNavigate} />
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <Breadcrumbs items={breadcrumbs} onNavigate={handleNavigate} />
      
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">ENVIRONMENTAL POLICY</h1>
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                  <span className="font-medium">Document ID: {documentInfo?.docNo || 'ESF-EMS-POL-01'}</span>
                  <span>•</span>
                  <span>{documentInfo?.revDate || 'Rev.No-03/Date-16-09-2023'}</span>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/organization/documents')}
            >
              Back to Documents
            </Button>
          </div>
        </div>

        {/* Policy Content */}
        <div className="p-8 space-y-8">
          {/* Policy Statement */}
          <EditableSection
            title="Policy Statement"
            content={content.policyStatement}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="policyStatement"
            contentType="paragraph"
          />

          {/* Employee Management Systems */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-green-600 pb-2 flex items-center justify-between">
              <span>Employee Management Systems</span>
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newDescription = prompt('Edit description:', content.employeeManagement?.description || '');
                    if (newDescription !== null && newDescription !== '') {
                      handleSaveSection('employeeManagement', {
                        ...content.employeeManagement,
                        description: newDescription
                      });
                    }
                  }}
                >
                  Edit Description
                </Button>
              )}
            </h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">{content.employeeManagement?.description || ''}</p>
              {isAdmin ? (
                <EditableSection
                  title=""
                  content={content.employeeManagement?.items || []}
                  onSave={(key, items) => handleSaveSection('employeeManagement', {
                    ...content.employeeManagement,
                    items
                  })}
                  canEdit={isAdmin}
                  sectionKey="employeeManagementItems"
                  contentType="list"
                />
              ) : (
                <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-700">
                  {(content.employeeManagement?.items || []).map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Pollution Prevention and Resource Management */}
          <EditableSection
            title="Pollution Prevention and Resource Management"
            content={content.pollutionPrevention}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="pollutionPrevention"
            contentType="list"
          />

          {/* Resource Conservation */}
          <EditableSection
            title="Resource Conservation to Reduce Environmental Impact"
            content={content.resourceConservation}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="resourceConservation"
            contentType="list"
          />

          {/* Waste Management */}
          <EditableSection
            title="Waste Management"
            content={content.wasteManagement}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="wasteManagement"
            contentType="list"
          />

          {/* Communication and Training */}
          <EditableSection
            title="Communication and Training"
            content={content.communicationTraining}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="communicationTraining"
            contentType="text"
          />

          {/* Continuous Improvement */}
          <EditableSection
            title="Continuous Improvement"
            content={content.continuousImprovement}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="continuousImprovement"
            contentType="list"
          />

          {/* Compliance */}
          <EditableSection
            title="Compliance"
            content={content.compliance}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="compliance"
            contentType="text"
          />

          {/* Public Access */}
          <EditableSection
            title="Public Access and Complaints"
            content={content.publicAccess}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="publicAccess"
            contentType="paragraph"
          />

          {/* Signature Section */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900 mb-4">DIRECTOR</p>
              <p className="text-sm text-gray-600">ESF LEATHER</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

