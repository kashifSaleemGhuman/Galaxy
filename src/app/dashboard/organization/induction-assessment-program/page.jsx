'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { Input } from '@/components/ui/Input'
import EditableSection from '@/components/documents/EditableSection'

export default function InductionAssessmentProgramPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [documentInfo, setDocumentInfo] = useState(null)

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN' || session?.user?.role === 'super_admin' || session?.user?.role === 'admin'

  // Initialize content structure with all sections from images
  const initializeContent = () => {
    return {
      companyName: 'ESF LEATHER CONSULTANCY',
      location: 'CHENNAI',
      documentId: 'ESF-HS-IP-05',
      date: '10/16/2023',
      revisionNo: '02',
      revisionDate: '2/16/2023',
      
      // Safety Induction Checklist
      inductionType: 'Employee', // Employee or Visitor - Business
      
      // Employer Obligations
      employerObligations: `• The health and safety of workers and others on site who may be affected by the activities and work being undertaken.
• Safe systems of work.
• Safe plant and substances.
• Training, supervision, and information.
• Prescribed welfare facilities.
• Monitoring of working conditions and employee health (as appropriate), and
• Maintenance of records`,

      // Worker Obligations
      workerObligations: `Workers also have a legal obligation to ensure they take all reasonable care to protect their own health and safety at work and in particular:
• Take reasonable care to not adversely affect the health and safety of others through their actions.
• Use equipment provided to protect their health and safety PPE.
• Comply with all reasonable instructions from the company.
• Cooperate with any reasonable policies, procedures, and instructions at the workplace`,

      // Emergency Phone Number
      emergencyPhoneNumber: `ESF LEATHER has a list of emergency phone number which is designed to cater for events such as fire, bomb threat, personal threat, medical emergency, internal emergency, external emergency & evacuation. Employees are expected to store the numbers in their mobile in case of any emergency. Also refer to sign boards provided in company`,

      // Emergency Code Responses
      emergencyCodeResponses: [
        { id: 1, emergencyType: 'Fire and/or Smoke', code: 'RED', bgColor: 'bg-red-600', textColor: 'text-white' },
        { id: 2, emergencyType: 'Bomb Threat', code: 'PURPLE', bgColor: 'bg-purple-600', textColor: 'text-white' },
        { id: 3, emergencyType: 'Medical Emergency', code: 'BLUE', bgColor: 'bg-blue-600', textColor: 'text-white' },
        { id: 4, emergencyType: 'Personal Threat', code: 'BLACK', bgColor: 'bg-black', textColor: 'text-white' },
        { id: 5, emergencyType: 'Internal Emergency', code: 'YELLOW', bgColor: 'bg-yellow-400', textColor: 'text-black' },
        { id: 6, emergencyType: 'External Emergency', code: 'BROWN', bgColor: 'bg-amber-800', textColor: 'text-white' },
        { id: 7, emergencyType: 'Evacuation', code: 'ORANGE', bgColor: 'bg-orange-500', textColor: 'text-black' }
      ],

      // Emergency Control Organization
      emergencyControlOrganization: `has an effective emergency management structure in place and includes the following`,

      // Security always available on site
      securityAvailable: `Usually, the Hospital Coordinator controls ESF's Emergency Response and can easily be identified by a security uniform.
- Responds to the emergency helpline internal or external depending on the type of emergency.`,

      // Department supervisors
      departmentSupervisors: `- In work areas, communicate with Supervisors via phone and direct action in department as required and can be identified by induction program.
- Trained team to respond to Code Blue and calls Code Black Team
- Trained team to respond to "personal threat"`,

      // What to do in an Emergency
      whatToDoInEmergency: `ESF's trained Emergency Control Organisation overrides management in the event of an emergency
ESF sites have
An emergency warning intercommunication system (which includes the persons in charge), emergency telephone system
Heat and smoke detectors - selected areas of high risk are provided with this.
Fire doors
Exit lighting
Break glass If required to evacuate, evacuate laterally as directed by your department Warden/s o Locate Fire doors in your area
o Specific Hazards in Area - Marked and highlighted in site plan.
o Hazardous areas are marked and isolated from the remaining process areas
o Chemical storage warehouses.
o Hazardous waste storage areas.
o H₂S Risk areas`,

      // Hazard Reporting
      hazardReporting: `o Duty of care to report hazards or unsafe working conditions
o A hazard is any situation that has the potential to cause harm to people or the environment.
o It is a requirement for all workers to report hazards to assist in the prevention of injuries occurring`,

      // Incident and Near Miss Reporting
      incidentNearMissReporting: `o An incident is an event which results in a fatality, injury or occupational disease to an employee, contractor, visitor, or member of the public
o A near miss is an event which does not result in an injury but may have caused harm to employees, contractors, visitors, the public, the environment or company property
o It is a requirement for all workers to report incidents immediately to assist with minimising reoccurrence.
o Incident report forms are located online (Risk Man) or available through your Manager`,

      // Blood and Body Fluid Exposure Incidents
      bloodBodyFluidExposure: `o Report any blood or body fluid exposure incident to your manager or Hospital Coordinator and follow their directions to adhere to protocol.`,

      // Work Health & Safety trained competent person
      whsTrainedPerson: `o ESF has mechanisms for local competent person to train new employees. Off site and onsite training is provided by 3rd party agencies scheduled.`,

      // Hazardous Chemicals
      hazardousChemicals: `o ESF operations include the use of various chemicals and substances
o Safe work practices and procedures must be followed at all times. Chemicals have the potential to harm both workers and the environment if they are not used or disposed of in the correct manner
o Material Safety Data Sheet (MSDS) are located in all relevant departments
o Good hygiene is essential when working with chemicals. Ensure you wash your hands prior to eating and following contact with chemicals (warm water with soap).
o Any reactions from the chemicals used are to be reported immediately to your manager.`,

      // Personal Protective Equipment (PPE)
      personalProtectiveEquipment: `o Workers have a right to ensure they wear the personal protective equipment provided by ESF.
Footwear must be fully enclosed around the toes and heels, firmly secured to the foot with non-slip soles. In some areas specific safety footwear is required to be worn.
List of PPE Items:
• Gloves
• Eye protection
• Masks
• Lead Aprons`,

      // Electrical Safety
      electricalSafety: `ESF has an effective electrical tagging and testing system in place. Earth leakage protection is in place and electrical plant is constantly inspected. Electrical equipment without current inspection tags must not be used.
Danger/Out of Service tags are displayed when plant is undergoing maintenance checks and when a unit is faulty. The danger tags identifies to all workers that the unit is not to be used under any circumstances.`,

      // Safety Signs and Reflective Mirrors
      safetySignsReflectiveMirrors: `Safety signs and reflective mirrors are located through the sites. All workers are required to comply with the safety signs including restricted areas.
Reflective mirrors have been installed to assist in the prevention of collision occurrences.`,

      // Safety Inspections and General Housekeeping
      safetyInspectionsHousekeeping: `Regular safety inspections are carried out in all departments to assist in the identification of hazards and risks.
General housekeeping is necessary to minimise the risk of injuries occurring. This can be achieved by keeping floors clean, ensuring power cords are not across walkways, keeping objects clear of emergency exits. To maintain access and egress keep equipment on one side of corridor only.`,

      // Drug and Alcohol Policy
      drugAlcoholPolicy: `A drug and alcohol policy applies to all employees at ESF. It is recognised that the use of alcohol or drugs can affect job performance and the safety of staff. Consequences if found in the possession, use or trade of illicit drugs will result in instant dismissal.`,

      // Smoking
      smoking: `Smoking is not permitted in any buildings on site and where no smoking signs are located. Designated smoking areas must be used at facilities where they have been allocated.`,

      // Security and Identification Badges
      securityIdentificationBadges: `Workers must always have their identification badges on show.`,

      // Speed limits and Parking
      speedLimitsParking: `The speed limit for all car parks is 10 kph (walking speed). Please take extra care when travelling through these areas.
All cars are parked in ESF car parks are at the owner's risk.`,

      // Equal opportunity and Workplace Harassment
      equalOpportunityHarassment: `All workers have the right to be treated fairly and with respect.
It's important that all staff know and understand their obligations in relation to Equal opportunity, Harassment and Bullying in the workplace. Equal opportunity, harassment and bullying must be reported through the informal or formal complaints procedure.`,

      // Injury Management
      injuryManagement: `It is a requirement for all personnel to report injuries immediately to their manager and/or Hospital Coordinator.`,

      // General information about the company for employees
      generalInformation: `General information about the company for employees.`,

      // Questions with English and Tamil
      questions: [
        {
          id: 1,
          english: 'How many emergency exits are there in the company?',
          tamil: 'நமது நிறுவனத்தில்அவசரகால வெளியேற்றங்கள்எத்தனைஉள்ளன?',
          answer: ''
        },
        {
          id: 2,
          english: 'Who are the key person to be contacted during emergency?',
          tamil: 'அவசரகாலத்தில்கூப்பிடவேண்டியமுக்கியநபர்கள்யாவர்?',
          answer: ''
        },
        {
          id: 3,
          english: 'When alarm rings, what will you do? Explain',
          tamil: 'அலாரம்ஒலிக்கும்போதுஎன்னசெய்யவேண்டும்? விளக்கவும்,',
          answer: ''
        },
        {
          id: 4,
          english: 'Did you get your copy of emergency manual? Show what are all evacuation exits and emission points at the company?',
          tamil: 'உங்களக்கானஅவசரகாலகையேடுகுடுக்கப்பட்டதா? எத்தனைஉள்ளது? எங்கெங்கேஉள்ளது?',
          answer: ''
        },
        {
          id: 5,
          english: 'What are spill kits? How many are there in our company? Do you know how to use?',
          tamil: 'இரசாயணசிதறல்பெட்டிஎன்றால்என்ன? எத்தனைஉள்ளது? எங்கெங்கேஉள்ளது?',
          answer: ''
        },
        {
          id: 6,
          english: 'Are you aware about Traffic Management Procedure of our Company kindly explain?',
          tamil: 'நமது நிறுவனத்தில் போக்குவரத்து வழிமுறைகள் பற்றிய விழிப்புணர்வு உள்ளதா?',
          answer: ''
        }
      ],

      // Induction Fields
      dateOfInduction: '',
      safetyInductionConductedBy: '',

      // Advise new starter
      adviseNewStarter: `o Advise the new starter of the Health and Safety Representatives listing and the site WHS Coordinator & ESF WHS Coordinator
o WHS - Work Health & Safety`
    }
  }

  const [content, setContent] = useState(initializeContent())

  useEffect(() => {
    fetchDocumentContent()
  }, [])

  const fetchDocumentContent = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/organization/documents/content?documentName=Induction Assessment Program')
      const data = await res.json()
      
      if (res.ok) {
        if (data.data?.content) {
          const loadedData = data.data.content.content || content
          // Ensure structure exists
          if (!loadedData.questions) {
            loadedData.questions = initializeContent().questions
          }
          if (!loadedData.emergencyCodeResponses) {
            loadedData.emergencyCodeResponses = initializeContent().emergencyCodeResponses
          }
          setContent(loadedData)
          setDocumentInfo({
            docNo: data.data.document.docNo || 'ESF-HS-IP-05',
            revDate: data.data.document.revDate || '',
            revisionNo: data.data.content.revisionNo,
            revisionDate: data.data.content.revisionDate
          })
        } else {
          setDocumentInfo({
            docNo: 'ESF-HS-IP-05',
            revDate: '',
            revisionNo: 1,
            revisionDate: new Date()
          })
        }
      }
    } catch (error) {
      console.error('Error fetching document content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSection = async (sectionKey, sectionContent) => {
    try {
      const updatedContent = {
        ...content,
        [sectionKey]: sectionContent
      }

      const res = await fetch('/api/organization/documents/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName: 'Induction Assessment Program',
          content: updatedContent,
          changeDescription: `Updated ${sectionKey} section`
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save changes')
      }

      setContent(updatedContent)
      if (data.data) {
        setDocumentInfo({
          ...documentInfo,
          revisionNo: data.data.revisionNo,
          revisionDate: data.data.revisionDate
        })
      }
      setToast({ type: 'success', message: 'Section updated successfully. Revision number incremented.' })
    } catch (error) {
      console.error('Error saving section:', error)
      setToast({ type: 'error', message: error.message || 'Failed to save changes' })
    }
  }

  const handleQuestionChange = (questionId, field, value) => {
    setContent(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, [field]: value } : q
      )
    }))
  }

  const handleEmergencyCodeChange = (id, field, value) => {
    setContent(prev => ({
      ...prev,
      emergencyCodeResponses: prev.emergencyCodeResponses.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }))
  }

  const handleInputChange = (field, value) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveAll = async () => {
    try {
      const res = await fetch('/api/organization/documents/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName: 'Induction Assessment Program',
          content: content,
          changeDescription: 'Updated Induction Assessment Program'
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save changes')
      }

      if (data.data) {
        setDocumentInfo({
          ...documentInfo,
          revisionNo: data.data.revisionNo,
          revisionDate: data.data.revisionDate
        })
      }

      setToast({ type: 'success', message: 'Induction Assessment Program saved successfully. Revision number incremented.' })
    } catch (error) {
      console.error('Error saving record:', error)
      setToast({ type: 'error', message: 'Failed to save changes. Please try again.' })
    }
  }

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'documents', label: 'Document Details', href: '/dashboard/organization/documents' },
    { key: 'induction-assessment-program', label: 'Induction Assessment Program', href: '#' }
  ]

  const handleNavigate = (index, item) => {
    if (item.href && item.href !== '#') router.push(item.href)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbs} onNavigate={handleNavigate} />
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading document...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbs} onNavigate={handleNavigate} />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {isAdmin ? (
                <Input
                  type="text"
                  value={content.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="inline-block w-64"
                />
              ) : (
                content.companyName
              )}
            </h1>
            <div className="mt-2 flex gap-6 text-sm text-gray-600 flex-wrap">
              <div>
                <span className="font-medium">Location:</span>{' '}
                {isAdmin ? (
                  <Input
                    type="text"
                    value={content.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="inline-block w-48 ml-2"
                  />
                ) : (
                  <span className="ml-2">{content.location}</span>
                )}
              </div>
              <div>
                <span className="font-medium">Document ID:</span>{' '}
                {isAdmin ? (
                  <Input
                    type="text"
                    value={content.documentId}
                    onChange={(e) => handleInputChange('documentId', e.target.value)}
                    className="inline-block w-48 ml-2"
                  />
                ) : (
                  <span className="ml-2">{content.documentId}</span>
                )}
              </div>
              <div>
                <span className="font-medium">Date:</span>{' '}
                {isAdmin ? (
                  <Input
                    type="text"
                    value={content.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="inline-block w-32 ml-2"
                  />
                ) : (
                  <span className="ml-2">{content.date}</span>
                )}
              </div>
              {documentInfo && documentInfo.revisionNo && (
                <div>
                  <span className="font-medium">Revision:</span> {documentInfo.revisionNo} ({new Date(documentInfo.revisionDate).toLocaleDateString()})
                </div>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900 uppercase mt-4">
              INDUCTION PROGRAM FOR NEW EMPLOYEES
            </h2>
            <h3 className="text-lg font-semibold text-gray-800 mt-2">
              HEALTH & SAFETY PROCEDURES
            </h3>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <Button
                onClick={handleSaveAll}
                className="px-6"
              >
                Save All Changes
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/organization/documents')}
            >
              Back to Documents
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Safety Induction Checklist */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">SAFETY INDUCTION CHECKLIST</h3>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="inductionType"
                  value="Employee"
                  checked={content.inductionType === 'Employee'}
                  onChange={(e) => handleInputChange('inductionType', e.target.value)}
                  disabled={!isAdmin}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Employee</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="inductionType"
                  value="Visitor - Business"
                  checked={content.inductionType === 'Visitor - Business'}
                  onChange={(e) => handleInputChange('inductionType', e.target.value)}
                  disabled={!isAdmin}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Visitor - Business</span>
              </label>
            </div>
          </div>

          {/* Duty of Care - Employer Obligations */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Duty of Care</h3>
            <h4 className="text-md font-semibold text-gray-800">Employer Obligations</h4>
            <p className="text-sm text-gray-600">Employer responsibilities -</p>
            <EditableSection
              title=""
              content={content.employerObligations}
              onSave={handleSaveSection}
              canEdit={isAdmin}
              sectionKey="employerObligations"
              contentType="text"
            />
          </div>

          {/* Duty of Care - Worker Obligations */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-gray-800">Worker Obligations</h4>
            <EditableSection
              title=""
              content={content.workerObligations}
              onSave={handleSaveSection}
              canEdit={isAdmin}
              sectionKey="workerObligations"
              contentType="text"
            />
          </div>

          {/* Advise New Starter */}
          <EditableSection
            title=""
            content={content.adviseNewStarter}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="adviseNewStarter"
            contentType="text"
          />

          {/* Emergency Phone Number */}
          <EditableSection
            title="Emergency Phone Number"
            content={content.emergencyPhoneNumber}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="emergencyPhoneNumber"
            contentType="text"
          />

          {/* Emergency Code Responses Table */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Emergency Code Responses</h3>
            <div className="border border-gray-300 rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Emergency Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Code</th>
                    {isAdmin && (
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {content.emergencyCodeResponses?.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={item.emergencyType}
                            onChange={(e) => handleEmergencyCodeChange(item.id, 'emergencyType', e.target.value)}
                            className="w-full"
                          />
                        ) : (
                          <span className="text-sm text-gray-900">{item.emergencyType}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded text-sm font-semibold ${item.bgColor} ${item.textColor}`}>
                          {item.code}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <Input
                            type="text"
                            value={item.code}
                            onChange={(e) => handleEmergencyCodeChange(item.id, 'code', e.target.value)}
                            className="w-24"
                          />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Emergency Control Organization */}
          <EditableSection
            title="Emergency Control Organization:"
            content={content.emergencyControlOrganization}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="emergencyControlOrganization"
            contentType="text"
          />

          {/* Security always available on site */}
          <EditableSection
            title="Security always available on site"
            content={content.securityAvailable}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="securityAvailable"
            contentType="text"
          />

          {/* Department supervisors */}
          <EditableSection
            title="Department supervisors:"
            content={content.departmentSupervisors}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="departmentSupervisors"
            contentType="text"
          />

          {/* What to do in an Emergency */}
          <EditableSection
            title="What to do in an Emergency:"
            content={content.whatToDoInEmergency}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="whatToDoInEmergency"
            contentType="text"
          />

          {/* Hazard Reporting */}
          <EditableSection
            title="Hazard Reporting:"
            content={content.hazardReporting}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="hazardReporting"
            contentType="text"
          />

          {/* Incident and Near Miss Reporting */}
          <EditableSection
            title="Incident and Near Miss Reporting:"
            content={content.incidentNearMissReporting}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="incidentNearMissReporting"
            contentType="text"
          />

          {/* Blood and Body Fluid Exposure Incidents */}
          <EditableSection
            title="Blood and Body Fluid Exposure Incidents (BBFEI):"
            content={content.bloodBodyFluidExposure}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="bloodBodyFluidExposure"
            contentType="text"
          />

          {/* Work Health & Safety trained competent person */}
          <EditableSection
            title="Work Health & Safety trained competent person:"
            content={content.whsTrainedPerson}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="whsTrainedPerson"
            contentType="text"
          />

          {/* Hazardous Chemicals */}
          <EditableSection
            title="Hazardous Chemicals:"
            content={content.hazardousChemicals}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="hazardousChemicals"
            contentType="text"
          />

          {/* Personal Protective Equipment (PPE) */}
          <EditableSection
            title="Personal Protective Equipment (PPE):"
            content={content.personalProtectiveEquipment}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="personalProtectiveEquipment"
            contentType="text"
          />

          {/* Electrical Safety */}
          <EditableSection
            title="Electrical Safety:"
            content={content.electricalSafety}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="electricalSafety"
            contentType="text"
          />

          {/* Safety Signs and Reflective Mirrors */}
          <EditableSection
            title="Safety Signs and Reflective Mirrors:"
            content={content.safetySignsReflectiveMirrors}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="safetySignsReflectiveMirrors"
            contentType="text"
          />

          {/* Safety Inspections and General Housekeeping */}
          <EditableSection
            title="Safety Inspections and General Housekeeping:"
            content={content.safetyInspectionsHousekeeping}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="safetyInspectionsHousekeeping"
            contentType="text"
          />

          {/* Drug and Alcohol Policy */}
          <EditableSection
            title="Drug and Alcohol Policy:"
            content={content.drugAlcoholPolicy}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="drugAlcoholPolicy"
            contentType="text"
          />

          {/* Smoking */}
          <EditableSection
            title="Smoking:"
            content={content.smoking}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="smoking"
            contentType="text"
          />

          {/* Security and Identification Badges */}
          <EditableSection
            title="Security and Identification Badges:"
            content={content.securityIdentificationBadges}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="securityIdentificationBadges"
            contentType="text"
          />

          {/* Speed limits and Parking */}
          <EditableSection
            title="Speed limits and Parking:"
            content={content.speedLimitsParking}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="speedLimitsParking"
            contentType="text"
          />

          {/* Equal opportunity and Workplace Harassment */}
          <EditableSection
            title="Equal opportunity and Workplace Harassment:"
            content={content.equalOpportunityHarassment}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="equalOpportunityHarassment"
            contentType="text"
          />

          {/* Injury Management */}
          <EditableSection
            title="Injury Management:"
            content={content.injuryManagement}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="injuryManagement"
            contentType="text"
          />

          {/* General information about the company for employees */}
          <EditableSection
            title="General information about the company for employees."
            content={content.generalInformation}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="generalInformation"
            contentType="text"
          />

          {/* Questions Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
            {content.questions?.map((question, index) => (
              <div key={question.id} className="border border-gray-300 rounded-md p-4 space-y-3">
                <div className="font-semibold text-gray-900">
                  {index + 1}. {question.english}
                </div>
                <div className="text-sm text-gray-600 italic">
                  {question.tamil}
                </div>
                {isAdmin ? (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">English Question:</label>
                      <Input
                        type="text"
                        value={question.english}
                        onChange={(e) => handleQuestionChange(question.id, 'english', e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tamil Question:</label>
                      <Input
                        type="text"
                        value={question.tamil}
                        onChange={(e) => handleQuestionChange(question.id, 'tamil', e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Answer:</label>
                      <textarea
                        value={question.answer}
                        onChange={(e) => handleQuestionChange(question.id, 'answer', e.target.value)}
                        rows={3}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Answer:</label>
                    <textarea
                      value={question.answer}
                      onChange={(e) => handleQuestionChange(question.id, 'answer', e.target.value)}
                      rows={3}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      readOnly={!isAdmin}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Induction Fields */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900">Induction Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Induction:</label>
                {isAdmin ? (
                  <Input
                    type="text"
                    value={content.dateOfInduction}
                    onChange={(e) => handleInputChange('dateOfInduction', e.target.value)}
                    className="w-full"
                    placeholder="Enter date"
                  />
                ) : (
                  <div className="text-sm text-gray-900">{content.dateOfInduction || 'Not provided'}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Safety Induction conducted by:</label>
                {isAdmin ? (
                  <Input
                    type="text"
                    value={content.safetyInductionConductedBy}
                    onChange={(e) => handleInputChange('safetyInductionConductedBy', e.target.value)}
                    className="w-full"
                    placeholder="Enter name"
                  />
                ) : (
                  <div className="text-sm text-gray-900">{content.safetyInductionConductedBy || 'Not provided'}</div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-600 mt-6">
            Prepared by ESF Leather Consultancy.
          </div>
        </div>
      </div>
    </div>
  )
}

