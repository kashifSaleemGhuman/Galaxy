'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { Input } from '@/components/ui/Input'
import EditableSection from '@/components/documents/EditableSection'

export default function EmergencyPreparednessPlanPage() {
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
      documentId: 'ESF-EMER-PLAN-01',
      
      // Emergency Contact Numbers
      emergencyContacts: [
        { id: 1, position: 'HR MANAGER', name: '0' },
        { id: 2, position: 'SAFETY MANAGER', name: '0' },
        { id: 3, position: 'PRODUCTION MANAGER', name: '0' },
        { id: 4, position: 'MAINTENANCE ENGINEER', name: '0' },
        { id: 5, position: 'ELETRICAL ENGINEER', name: '0' },
        { id: 6, position: 'ETP ENGINEER', name: '0' },
        { id: 7, position: 'FIRST AIDER', name: '0' },
        { id: 8, position: 'FIRST AIDER', name: '0' },
        { id: 9, position: 'FIRE FIGHTER', name: '0' }
      ],

      // Department Contact Numbers
      departmentContacts: [
        { id: 1, department: 'Fire & Rescue Service', contactNumber: '' },
        { id: 2, department: 'Ambulance', contactNumber: '' },
        { id: 3, department: 'Government Hospital', contactNumber: '' },
        { id: 4, department: 'Private Hospital', contactNumber: '' },
        { id: 5, department: 'Police Department', contactNumber: '' }
      ],

      // Emergency Evacuation Procedure
      emergencyEvacuationProcedure: `• In case of any emergency event, one should trigger alarm with nearby alarm buttons and or inform Emergency team member in their section
• Alert team should alert fellow employees by raising alarm or shouting "EVACUATE" or "Fire"
• Hearing the alert alarm / sound all members should evacuate their place leaving their work as it is and assemble in "SAFE ASSEMBLY POINT"
• Meanwhile, salvage team should collect attendance and visitors list from Security and identify how many people are inside the factory
• Sooner all employees have assembled in "SAFE ASSEMBLY POINT", head count should be tallied with attendance and visitor list. In case of shortfall in numbers, Salvage team should identify the missing member and trace him/her out from factory
• First aid team should do relevant first aid as per requirement of situation and inform emergency services (Ambulance and Hospital) in case external support is required`,

      // Emergency Evacuation Plan
      emergencyEvacuationPlan: `• Firefighting team should act depending on requirement of situation and inform emergency services (Fire Station) in case external support is required
• Emergency event should be informed to Internal emergency contact's (Evacuation team/Maintenance Manager/Safety Officer/MR/Security officer& Director)`,

      // Building Evacuation
      buildingEvacuation: `• Remain calm.
• Gather any personal items with the knowledge that you may not be able to return that day.
• Leave calmly but quickly.
• Alert co-workers and others to the situation as you are leaving and prompt them to leave as well.
• Inform any individuals who have declared a disability to you where the location of the designated Area of Rescue Assistance or Area of Refuge.
• These are usually stairwells that are rated to withstand fire for a certain length of time.
• Follow any direction from your departmental administrator or emergency team.
• Go immediately to primary/secondary meeting site as identified in your department's Emergency Evacuation Plan and make your presence known.
• Do not re-enter the building unless all clear message to do so is given by the Fire Department or authorized person.`,

      // Fire Emergency
      fireEmergency: `Raise alarm
Clear area of personnel
Check whether everybody has safely escaped or been rescued, if possible!
Provide first medical aid if required and inform medical emergency service (doctor, ambulance, hospital)
Close all vents and shut down mechanical ventilation!
Fight fire using available firefighting equipment (but check whether you are using the right type of firefighting equipment before use)!
If possible, remove other combustible/flammable material to avoid spread of fire!
Call fire brigade and inform about the accident.`,

      // First Aid Emergency
      firstAidEmergency: `Telephone the emergency team or First Aid Responders immediately.

Provide:
A) Your name and telephone number.
B) Location of the emergency (Building and Room Number).
C) The extent of the accident/injury and number of people involved.
D) Location where someone will meet the ambulance for directing personnel to the injured.

Notify the supervisor in the area immediately.

The individual making the call should continue to stay on the phone with the dispatcher and answer as many questions as possible regarding the condition of the injured person so that information can be forwarded to the responding emergency personnel.

The ESF Leather Emergency Team maintains a State-certified ambulance staffed with Emergency Medical Technicians.

Medical emergencies should not be transported in personal or University vehicles.

The ambulance is on call 24 hours a day.`,

      // Machinery / Electrical Emergency
      machineryElectricalEmergency: `Immediately turn off machine and power.
If accident victim is caught in electrical current, do no touch person with bare hands! Use insulation stick or dry wooden stick to remove accident victim from immediate danger area.
Remove accident victim from danger area (e.g., pit, machine, electrical installation).
Make accident victim comfortable while giving first aid. In case of vomiting, turn face towards the side and maintain clear airway.
Check breathing - if stopped, apply artificial respiration.
Check pulse- if absent, give artificial respiration and external heart compression.
Arrest bleeding, and attend to electrical burns, if present.
Attend to shock by keeping accident victim warm.
Arrange quick transport to doctor or hospital.
At hospital give attending doctor full details about accident conditions and first medical aid measures provided!`,

      // Earthquake Emergency
      earthquakeEmergency: `Be aware that some earthquakes are foreshocks, and a larger earthquake might occur. Minimize your movements to a few steps to a nearby safe place and if you are indoors, stay there until the shaking has stopped and you are sure exiting is safe.

If you are inside when the shaking starts...
• DROP (get down on the floor), COVER (protect your head and body by getting under a desk, table, or other hard object) and HOLD ON (hold onto the object you are under or your head if you are in an open area). Move as little as possible.
• Stay away from windows to avoid being injured by shattered glass.
• If you must leave the building after the shaking stops, use the stairs - do not use elevators in case there are aftershocks, power outages or other damage.
• Be aware that fire alarms and sprinkler systems frequently go off in buildings during an earthquake, even if there is no fire.

If you are outside when the shaking starts...
• Find a clear spot and drop to the ground. Stay there until the shaking stops (away from buildings, power lines, trees, streetlights).
• If you are in a vehicle, pull over to a clear location and stop. Avoid bridges, overpasses, and power lines if possible. Stay inside with your seatbelt fastened until the shaking stops. Then drive carefully, avoiding bridges and ramps that may have been damaged.
• If a power line falls on your vehicle, DO NOT GET OUT. Wait for assistance from emergency personnel.`,

      // Fire Extinguisher Guide
      fireExtinguisherGuide: `HEN IT'S TIME TO USE FIRE EXTINGUISHE
JUST REMEMBER PASS

PULL
Pull the pin.

AIM
Aim the nozzle or hose at the base of the fire from a recommended safe distance.

SQUEEZE
Squeeze the operating lever to discharge the fire extinguishing agent.

SWEEP
Starting at the recommended distance, Sweep the nozzle or hose from side to side until the fire is out. Move forward or around the fire area as the fire diminishes. Watch the area in case of re-ignition.`
    }
  }

  const [content, setContent] = useState(initializeContent())

  useEffect(() => {
    fetchDocumentContent()
  }, [])

  const fetchDocumentContent = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/organization/documents/content?documentName=EMERGENCY PREPARENESS PLAN')
      const data = await res.json()
      
      if (res.ok) {
        if (data.data?.content) {
          const loadedData = data.data.content.content || content
          // Ensure structure exists
          if (!loadedData.emergencyContacts) {
            loadedData.emergencyContacts = initializeContent().emergencyContacts
          }
          if (!loadedData.departmentContacts) {
            loadedData.departmentContacts = initializeContent().departmentContacts
          }
          setContent(loadedData)
          setDocumentInfo({
            docNo: data.data.document.docNo || 'ESF-EMER-PLAN-01',
            revDate: data.data.document.revDate || '',
            revisionNo: data.data.content.revisionNo,
            revisionDate: data.data.content.revisionDate
          })
        } else {
          setDocumentInfo({
            docNo: 'ESF-EMER-PLAN-01',
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
          documentName: 'EMERGENCY PREPARENESS PLAN',
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

  const handleContactChange = (type, id, field, value) => {
    const updatedContent = { ...content }
    const contacts = type === 'emergency' ? updatedContent.emergencyContacts : updatedContent.departmentContacts
    const contact = contacts.find(c => c.id === id)
    if (contact) {
      contact[field] = value
      setContent(updatedContent)
    }
  }

  const handleAddContact = (type) => {
    const updatedContent = { ...content }
    const contacts = type === 'emergency' ? updatedContent.emergencyContacts : updatedContent.departmentContacts
    const newId = Math.max(...contacts.map(c => c.id), 0) + 1
    if (type === 'emergency') {
      updatedContent.emergencyContacts.push({ id: newId, position: '', name: '' })
    } else {
      updatedContent.departmentContacts.push({ id: newId, department: '', contactNumber: '' })
    }
    setContent(updatedContent)
  }

  const handleDeleteContact = (type, id) => {
    const updatedContent = { ...content }
    if (type === 'emergency') {
      updatedContent.emergencyContacts = updatedContent.emergencyContacts.filter(c => c.id !== id)
    } else {
      updatedContent.departmentContacts = updatedContent.departmentContacts.filter(c => c.id !== id)
    }
    setContent(updatedContent)
  }

  const handleSaveAll = async () => {
    try {
      const res = await fetch('/api/organization/documents/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName: 'EMERGENCY PREPARENESS PLAN',
          content: content,
          changeDescription: 'Updated Emergency Preparedness Plan'
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

      setToast({ type: 'success', message: 'Emergency Preparedness Plan saved successfully. Revision number incremented.' })
    } catch (error) {
      console.error('Error saving record:', error)
      setToast({ type: 'error', message: 'Failed to save changes. Please try again.' })
    }
  }

  const handleInputChange = (field, value) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'documents', label: 'Document Details', href: '/dashboard/organization/documents' },
    { key: 'emergency-preparedness-plan', label: 'EMERGENCY PREPARENESS PLAN', href: '#' }
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
              {documentInfo && documentInfo.revisionNo && (
                <div>
                  <span className="font-medium">Revision:</span> {documentInfo.revisionNo} ({new Date(documentInfo.revisionDate).toLocaleDateString()})
                </div>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900 uppercase mt-4">
              EMERGENCY PREPARENESS PLAN
            </h2>
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
          {/* Emergency Contact Numbers Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">EMERGENCY CONTACT NUMBERS</h3>
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddContact('emergency')}
                >
                  + Add Contact
                </Button>
              )}
            </div>
            <div className="border border-gray-300 rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Position</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                    {isAdmin && (
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {content.emergencyContacts?.map((contact) => (
                    <tr key={contact.id}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={contact.position}
                            onChange={(e) => handleContactChange('emergency', contact.id, 'position', e.target.value)}
                            className="w-full"
                          />
                        ) : (
                          <span className="text-sm text-gray-900">{contact.position}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={contact.name}
                            onChange={(e) => handleContactChange('emergency', contact.id, 'name', e.target.value)}
                            className="w-full"
                          />
                        ) : (
                          <span className="text-sm text-gray-900">{contact.name}</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteContact('emergency', contact.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Department Contact Numbers Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">DEPARTMENT</h3>
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddContact('department')}
                >
                  + Add Department
                </Button>
              )}
            </div>
            <div className="border border-gray-300 rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Department</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Contact Number</th>
                    {isAdmin && (
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {content.departmentContacts?.map((contact) => (
                    <tr key={contact.id}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={contact.department}
                            onChange={(e) => handleContactChange('department', contact.id, 'department', e.target.value)}
                            className="w-full"
                          />
                        ) : (
                          <span className="text-sm text-gray-900">{contact.department}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {isAdmin ? (
                          <Input
                            type="text"
                            value={contact.contactNumber}
                            onChange={(e) => handleContactChange('department', contact.id, 'contactNumber', e.target.value)}
                            className="w-full"
                          />
                        ) : (
                          <span className="text-sm text-gray-900">{contact.contactNumber || '-'}</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteContact('department', contact.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Emergency Evacuation Procedure */}
          <EditableSection
            title="EMERGENCY EVACUATION PROCEDURE"
            content={content.emergencyEvacuationProcedure}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="emergencyEvacuationProcedure"
            contentType="text"
          />

          {/* Emergency Evacuation Plan */}
          <EditableSection
            title="EMERGENCY EVACUATION PLAN"
            content={content.emergencyEvacuationPlan}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="emergencyEvacuationPlan"
            contentType="text"
          />

          {/* Building Evacuation */}
          <EditableSection
            title="BUILDING EVACUATION"
            content={content.buildingEvacuation}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="buildingEvacuation"
            contentType="text"
          />

          {/* Fire Emergency */}
          <EditableSection
            title="FIRE EMERGENCY"
            content={content.fireEmergency}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="fireEmergency"
            contentType="text"
          />

          {/* First Aid Emergency */}
          <EditableSection
            title="FIRST AID EMERGENCY"
            content={content.firstAidEmergency}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="firstAidEmergency"
            contentType="text"
          />

          {/* Machinery / Electrical Emergency */}
          <EditableSection
            title="MACHINERY / ELECTRICAL EMERGENCY"
            content={content.machineryElectricalEmergency}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="machineryElectricalEmergency"
            contentType="text"
          />

          {/* Earthquake Emergency */}
          <EditableSection
            title="EARTHQUAKE EMERGENCY"
            content={content.earthquakeEmergency}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="earthquakeEmergency"
            contentType="text"
          />

          {/* Fire Extinguisher Guide */}
          <EditableSection
            title="FIRE EXTINGUISHER GUIDE"
            content={content.fireExtinguisherGuide}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="fireExtinguisherGuide"
            contentType="text"
          />

          {/* Footer */}
          <div className="text-center text-sm text-gray-600 mt-6">
            Prepared by ESF Leather Consultancy.
          </div>
        </div>
      </div>
    </div>
  )
}

