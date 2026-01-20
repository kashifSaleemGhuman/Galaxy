'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import EditableSection from '@/components/documents/EditableSection';

export default function EMSProcedurePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [documentInfo, setDocumentInfo] = useState(null);
  const [content, setContent] = useState({
    legalRequirements: {
      policy: 'We are committed to timely identify all applicable legal, Customer, other statutory requirements (National & Local) and customer requirements via a tracking system resulting from nature of our business activities & specific customer requirements and ensure full compliance for all identified requirements.',
      purpose: 'This procedure describes the methods for identifying and updating the legal and other requirements applicable to the Environmental aspects of ESF LEATHER business activities and for maintaining access to these requirements.',
      scope: 'Legal and other requirements include those specified in country, state legislations & local regulations and technical memoranda that are legally binding. Other requirements include contract requirements, business codes, and guidance notes, code of practices, other technical memoranda and other practice notes produced by customers as well as professional institutions.',
      responsibility: 'The MR shall work together with the member of EMS team to maintain and update the Register of Legal and Other Requirements and ensure that the updated register is available to relevant staff and the relevant requirements listed in the Register are accessible.',
      procedure: [
        'The MR along with respective process heads identify the relevant legal and other requirements applicable to the environmental aspects of their activities in the Organization, requirements from Clients, Corporate, local bodies etc. and determine how these requirements apply to its EMS Management System.',
        'The MR shall maintain a Register of Legal and other requirements, and ensure all updated information listed in the Register is available and accessible. The register shall include:',
        'Title and description of the requirement',
        'Application and scope',
        'Licenses and compliance records',
        'The MR and EMS team shall review the register every 3 months or when relevant information becomes available. Updated information shall be sourced from official websites such as www.moef.nic.in, www.cpcb.nic.in, and other relevant sources.'
      ]
    },
    objectivesTargets: {
      policy: 'The top management is committed to define measurable objective per year towards Environmental Protection mainly through resources conservation and waste minimization. This can achieve through provision of adequate resources, Technologies, roles & responsibilities and continuous monitoring.',
      purpose: 'To establish and maintain documented environmental objective and targets (at each relevant function within the organization).',
      scope: 'This procedure covers the defining the facility\'s objective and targets pertaining to Environmental Management system.',
      responsibility: 'The Top Management, MR & EMS Team shall be responsible for defining the objective, Targets.',
      procedure: [
        'MR & EMS team shall be responsible for defining the EMS Objectives based on the observations and risk analysis of Aspects and impacts analysis, Targets and action plans shall be reviewed and approved by top management prior to release.',
        'Procedure to be followed during objective implementation:',
        'Written record identifying why the objective was chosen',
        'Written record to identifying how or why the performance target was determined',
        'There should be a named project leader',
        'Names and/or Departments and/or Roles of the team members is to be identified and defined',
        'Objectives should be Specific; Measurable; Achievable; Relevant; where practicable with targets. Objectives are framed based on organizational changes and impact registers, with a minimum of 5 objectives, at least 2 being quantifiable.'
      ]
    }
    // Add more sections as needed
  });

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN';

  useEffect(() => {
    fetchDocumentContent();
  }, []);

  const fetchDocumentContent = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/organization/documents/content?documentName=EMS PROCEDURE');
      const data = await res.json();
      
      if (res.ok) {
        if (data.data?.content) {
          setContent(data.data.content.content);
          setDocumentInfo({
            revisionNo: data.data.content.revisionNo,
            revisionDate: data.data.content.revisionDate
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
          documentName: 'EMS PROCEDURE',
          content: updatedContent,
          changeDescription: `Updated ${sectionKey} section`
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save changes');
      }

      setContent(updatedContent);
      
      if (data.data) {
        setDocumentInfo({
          revisionNo: data.data.revisionNo,
          revisionDate: data.data.revisionDate
        });
      }

      setToast({ type: 'success', message: data.message || 'Document updated successfully. Revision number incremented.' });
    } catch (error) {
      console.error('Error saving section:', error);
      setToast({ 
        type: 'error', 
        message: error.message || 'Failed to save changes' 
      });
    }
  };

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'documents', label: 'Document Details', href: '/dashboard/organization/documents' },
    { key: 'ems-procedure', label: 'EMS Procedure', href: '#' },
  ];

  const handleNavigate = (index, item) => {
    if (item.href) router.push(item.href);
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-10">
        <Breadcrumbs items={breadcrumbs} onNavigate={handleNavigate} />
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">EMS PROCEDURE</h1>
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                  <span className="font-medium">Environmental Management System Procedures</span>
                  {documentInfo && (
                    <>
                      <span>•</span>
                      <span>Rev.No-{String(documentInfo.revisionNo || 1).padStart(2, '0')}</span>
                    </>
                  )}
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

        {/* Procedure Content */}
        <div className="p-8 space-y-10">
          {/* 1. Legal, Customer and Other Requirements */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 border-b-2 border-blue-600 pb-2">
              1.0 LEGAL, CUSTOMER AND OTHER REQUIREMENTS
            </h2>
            
            <div className="space-y-4">
              <EditableSection
                title="1.1 POLICY"
                content={content.legalRequirements?.policy || ''}
                onSave={(key, val) => handleSaveSection('legalRequirements', { ...content.legalRequirements, policy: val })}
                canEdit={isAdmin}
                sectionKey="legalRequirementsPolicy"
                contentType="text"
              />
              
              <EditableSection
                title="1.2 PURPOSE"
                content={content.legalRequirements?.purpose || ''}
                onSave={(key, val) => handleSaveSection('legalRequirements', { ...content.legalRequirements, purpose: val })}
                canEdit={isAdmin}
                sectionKey="legalRequirementsPurpose"
                contentType="text"
              />
              
              <EditableSection
                title="1.3 SCOPE"
                content={content.legalRequirements?.scope || ''}
                onSave={(key, val) => handleSaveSection('legalRequirements', { ...content.legalRequirements, scope: val })}
                canEdit={isAdmin}
                sectionKey="legalRequirementsScope"
                contentType="text"
              />
              
              <EditableSection
                title="1.4 RESPONSIBILITY"
                content={content.legalRequirements?.responsibility || ''}
                onSave={(key, val) => handleSaveSection('legalRequirements', { ...content.legalRequirements, responsibility: val })}
                canEdit={isAdmin}
                sectionKey="legalRequirementsResponsibility"
                contentType="text"
              />
              
              <EditableSection
                title="1.5 PROCEDURE"
                content={content.legalRequirements?.procedure || []}
                onSave={(key, val) => handleSaveSection('legalRequirements', { ...content.legalRequirements, procedure: val })}
                canEdit={isAdmin}
                sectionKey="legalRequirementsProcedure"
                contentType="list"
              />
            </div>
          </section>

          {/* 2. Objectives and Targets */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 border-b-2 border-blue-600 pb-2">
              2.0 OBJECTIVES AND TARGETS
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">POLICY</h3>
                <p className="text-gray-700 leading-relaxed">
                  The top management is committed to define measurable objective per year towards Environmental Protection mainly through 
                  resources conservation and waste minimization. This can achieve through provision of adequate resources, Technologies, 
                  roles & responsibilities and continuous monitoring.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">2.1 PURPOSE</h3>
                <p className="text-gray-700 leading-relaxed">
                  To establish and maintain documented environmental objective and targets (at each relevant function within the organization).
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">2.2 SCOPE</h3>
                <p className="text-gray-700 leading-relaxed">
                  This procedure covers the defining the facility's objective and targets pertaining to Environmental Management system.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">2.3 RESPONSIBILITY</h3>
                <p className="text-gray-700 leading-relaxed">
                  The Top Management, MR & EMS Team shall be responsible for defining the objective, Targets.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">2.4 PROCEDURE</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  MR & EMS team shall be responsible for defining the EMS Objectives based on the observations and risk analysis of Aspects 
                  and impacts analysis, Targets and action plans shall be reviewed and approved by top management prior to release.
                </p>
                <p className="text-gray-700 leading-relaxed mb-3">Procedure to be followed during objective implementation:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Written record identifying why the objective was chosen</li>
                  <li>Written record to identifying how or why the performance target was determined</li>
                  <li>There should be a named project leader</li>
                  <li>Names and/or Departments and/or Roles of the team members is to be identified and defined</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-3">
                  Objectives should be Specific; Measurable; Achievable; Relevant; where practicable with targets. Objectives are framed 
                  based on organizational changes and impact registers, with a minimum of 5 objectives, at least 2 being quantifiable.
                </p>
              </div>
            </div>
          </section>

          {/* 3. Roles, Resources and Responsibilities */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 border-b-2 border-blue-600 pb-2">
              3.0 ROLES, RESOURCES AND RESPONSIBILITIES
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">3.1 PURPOSE</h3>
                <p className="text-gray-700 leading-relaxed">
                  To define the resources, roles and responsibility for the Environment Management System.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">3.2 SCOPE</h3>
                <p className="text-gray-700 leading-relaxed">
                  This procedure covers EMS Management System of ESF LEATHER.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">3.3 RESPONSIBILITY</h3>
                <p className="text-gray-700 leading-relaxed">
                  The Managing Director is responsible for implementation of this procedure.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">3.4 PROCEDURE</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  The organization structure of ESF LEATHER is given in Annexure 1. Refer 8.5b Organization & EMS Chart.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Key responsibilities include Managing Director, General Manager, Maintenance In Charge, Process Supervisors, 
                  Admin & HR, Process In-Charges, Management Representative, Security, and Helpers, each with specific roles 
                  in implementing and maintaining the EMS.
                </p>
              </div>
            </div>
          </section>

          {/* 4. Competence, Awareness and Training */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 border-b-2 border-blue-600 pb-2">
              4.0 COMPETENCE, AWARENESS AND TRAINING
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">4.1 COMPETENCE, EDUCATION AND TRAINING POLICY</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>We ensure that personnel involved in Environmental Management System are competent to achieve the defined Environmental 
                      objectives, roles and responsibilities with their education and skill level.</li>
                  <li>All employees' skill level will be evaluated, Training identification and training schedule will be produced.</li>
                  <li>Selected employees are expected to be trained based on training requirements set by the company, also according to 
                      selected objectives.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">4.2 PURPOSE</h3>
                <p className="text-gray-700 leading-relaxed">
                  To establish criteria for competence requirements for personnel whose work has potential to cause significant environmental 
                  impacts, and to create a system for identifying training needs, providing training, and measuring its effectiveness.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">4.3 SCOPE</h3>
                <p className="text-gray-700 leading-relaxed">
                  This procedure covers the training process of all employees in ESF LEATHER.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">4.4 RESPONSIBILITY</h3>
                <p className="text-gray-700 leading-relaxed">
                  HR In-charge.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">4.6 COMPETENCE</h3>
                <p className="text-gray-700 leading-relaxed">
                  The HR In-Charge will prepare the competence requirement for all Personnel performing work that have potential to cause 
                  significant environmental impacts in terms education and experience and recorded as competence matrix.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">4.7 TRAINING</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Training needs to be provided for personnel to create awareness and to update knowledge/skills and to induce motivation 
                  for increase in productivity. Training includes:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Importance of conformity with environmental policies and procedures and requirements of EMS</li>
                  <li>The significance of environmental aspects and related actual and potential impacts associated with their work</li>
                  <li>The potential consequences of departure from specified procedures</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 5. Control of Documents */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 border-b-2 border-blue-600 pb-2">
              5.0 CONTROL OF DOCUMENTS
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">5.1 DOCUMENT CONTROL POLICY</h3>
                <p className="text-gray-700 leading-relaxed">
                  Documents required for Environmental Management System shall be identified, reviewed, approved and controlled. Documents 
                  shall be legible, identifiable and retrievable. Only the latest version of documents shall be available at the point of use.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">5.2 PURPOSE</h3>
                <p className="text-gray-700 leading-relaxed">
                  This procedure describes the method to control documents required for Environmental Management Systems.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">5.3 SCOPE</h3>
                <p className="text-gray-700 leading-relaxed">
                  This procedure applies to all documents under the implementation of the Environmental Management System in ESF LEATHER.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">5.4 RESPONSIBILITY</h3>
                <p className="text-gray-700 leading-relaxed">
                  Management Representative.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">5.6 CONTROL OF DOCUMENTS</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">5.6.1 APPROVAL OF DOCUMENTS</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Documents must be approved for adequacy before issue. Documents shall be identified with "MASTER COPY" and "CONTROL COPY" stamps.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">5.6.2.1 ENVIRONMENTAL MANUAL</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Master copy of the Environmental Manual is retained and controlled by MR, identified as "Master Copy", and distributed 
                      according to the EMS documents list. Issue of documents to different processes is recorded in 'Document control & Issue register'.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">5.6.2.2 ENVIRONMENTAL PROCEDURE</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Master copy of Environmental Procedures shall be retained and controlled by MR. This copy shall be identified as Master Copy. 
                      Environmental procedures-controlled copies shall be distributed as per Distribution list of EMS documents. Issue of documents 
                      to different personnel shall be recorded in 'Document control register'.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">5.6.2.3 OPERATIONAL CONTROL/STANDARD OPERATING PROCEDURES/CHECKLISTS</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Master copy of Operational Control/Standard Operating/Checklist shall be retained and controlled by MR. This copy is identified 
                      as Master Copy. Controlled copies of work Instructions/Checklists shall be distributed as per the distribution list of EMS documents. 
                      Issue of documents to different personnel shall be recorded in 'Document control register'.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 6. Internal Audits */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 border-b-2 border-blue-600 pb-2">
              6.0 INTERNAL AUDITS
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">6.1 EMS INTERNAL AUDIT POLICY</h3>
                <p className="text-gray-700 leading-relaxed">
                  We committed to conduct internal audits once in a month with qualified internal auditors, results are documented, and necessary 
                  corrective are implemented in timely manner where deficiencies are identified. Ensures that the audits are conducted objectively 
                  without any bias for continual improvement of Environmental Management System.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">6.2 PURPOSE</h3>
                <p className="text-gray-700 leading-relaxed">
                  To establish a procedure for conducting internal audit of Environmental Management System in ESF LEATHER.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">6.3 SCOPE</h3>
                <p className="text-gray-700 leading-relaxed">
                  This procedure shall be applicable for conducting internal audits of Environmental Management System in ESF LEATHER.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">6.4 RESPONSIBILITY</h3>
                <p className="text-gray-700 leading-relaxed">
                  Management Representative.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">6.5 PROCEDURE</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Internal audit shall be carried out once in a month to determine:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Whether the implemented Environmental Management System conforms to the international standard ISO 14001:2004</li>
                  <li>Whether Environmental Management System is effectively implemented and maintained for continual improvement</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-3">
                  Annual Internal Audit Calendar for a year shall be prepared and released by MR as per the frequency stated in this procedure 
                  and included all EMS process to be audited. MR shall ensure that corrective actions are taken by the concerned personnel without 
                  undue delay. List of approved internal auditors shall be maintained by MR.
                </p>
              </div>
            </div>
          </section>

          {/* 7. Management Review */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 border-b-2 border-blue-600 pb-2">
              7.0 MANAGEMENT REVIEW
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">7.1 EMS MANAGEMENT REVIEW MEETING POLICY</h3>
                <p className="text-gray-700 leading-relaxed">
                  We committed to conduct at least 4 Management Reviews per year with adequate support dates to evaluate the performance of the 
                  Implemented Environmental Management System to evaluate its suitability, adequacy and Opportunity for continual improvement 
                  of Environmental Management System.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">7.2 PURPOSE</h3>
                <p className="text-gray-700 leading-relaxed">
                  To establish a procedure to evaluate the EMS and to ensure its continuing suitability, adequacy and effectiveness in the environment 
                  health & safety performance of the Organisation.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">7.3 SCOPE</h3>
                <p className="text-gray-700 leading-relaxed">
                  This procedure applies to EMS Management System of ESF LEATHER.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">7.4 RESPONSIBILITY</h3>
                <p className="text-gray-700 leading-relaxed">
                  MR is responsible for implementing this Procedure.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">7.5 PROCEDURE</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  The Management of ESF LEATHER reviews the performance of EMS once in 3 months by the management review Committee along with the MR. 
                  The MR prepares an environment report which contains issues that need to be reviewed in the Management Review. The Report is based on:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Performance against laid down environment objectives</li>
                  <li>Audit reports of environment audits</li>
                  <li>Status of corrective and preventive actions taken for non-conformance</li>
                  <li>Compliance with applicable legislation</li>
                  <li>Changing circumstances, continued suitability of the system with changes in equipment, product, process including applicable 
                      legislation & another requirement</li>
                  <li>Adequacy and need for resources</li>
                  <li>Interested party concerns (Complaints)</li>
                  <li>Potential party for continual improvement and newer objectives</li>
                  <li>Follow up of previous management review</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-3">
                  The team reviews the plant's performance based on the environment assessment report. The conclusion, action plans with responsibility, 
                  target and recommendations of the review are documented and maintained by the MR and circulated among members.
                </p>
              </div>
            </div>
          </section>

          {/* 8. Environmental Aspect and Impacts */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 border-b-2 border-blue-600 pb-2">
              8.0 ENVIRONMENTAL ASPECT AND IMPACTS
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">8.1 PURPOSE</h3>
                <p className="text-gray-700 leading-relaxed">
                  To describe the method for identifying environmental aspects and impacts of organizational activities.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">8.2 SCOPE</h3>
                <p className="text-gray-700 leading-relaxed">
                  This procedure applies to all operations and activities under normal and foreseeable situations at ESF LEATHER.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">8.3 RESPONSIBILITY</h3>
                <div className="space-y-2">
                  <p className="text-gray-700 leading-relaxed">
                    <strong>8.3.1 EMS TEAM:</strong> The EMS team, headed by MR (Management Representative), identifies environmental aspects and 
                    evaluates risks. The MR is also responsible for maintaining the Register of Environmental risks.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    <strong>8.3.2 TOP MANAGEMENT:</strong> Top Management reviews and approves identified Environmental risks.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    <strong>8.3.3 PROCEDURE:</strong> Environmental aspect and impact review by area owners, environmental impact assessment for 
                    new equipment (by Managing Director, production head, and MR), and for process changes (by Production head and MR). Information 
                    on potential environmental hazards is collected including:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700 ml-4">
                    <li>Emission to air</li>
                    <li>Release of water/Wastewater/effluent</li>
                    <li>Waste generation</li>
                    <li>Contamination of land</li>
                    <li>Use of raw materials and nature resources</li>
                    <li>Past incident, accidents and emergencies</li>
                    <li>Other potential hazards</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

