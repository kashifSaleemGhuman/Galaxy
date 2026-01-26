'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { Input } from '@/components/ui/Input'

export default function HealthAndSafetyProcedurePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [documentInfo, setDocumentInfo] = useState(null)

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN' || session?.user?.role === 'super_admin' || session?.user?.role === 'admin'

  const initializeContent = () => {
    return {
      preparedBy: 'ESF LEATHER CONSULTANCY',
      documentId: 'ESF-HS-PRO-06',
      version: 'Version.03',
      date: '16/10/2023',
      sections: {
        externalEmergencyServicesCommunication: {
          title: 'EXTERNAL EMERGENCY SERVICES COMMUNICATION',
          communication: {
            description: 'After an emergency incident occurred, the health & safety manager will contact the external emergency service providers. E.g.,',
            contacts: [
              { service: 'Fire & Rescue Department', number: '101' },
              { service: 'Ambulance', number: '102' },
              { service: 'Emergency', number: '108' },
              { service: 'Disaster Control Room', number: '1077' }
            ],
            guidelines: [
              'There must be only one responsible person who will communicate with the external emergency service department.',
              'Fire Key Person / Deputy is responsible for communicating with the fire department.',
              'All emergencies should be contacted through the key persons / Deputy for the relevant emergencies.',
              'The responsible person should convey the internal procedure clearly with the external agency to access the plant and coordinate.',
              'The responsible person should tell the company address clearly and traffic free route to external service department. So that external emergency service team should arrive at earliest possible'
            ]
          },
          access: {
            guidelines: [
              'Company\'s security head must coordinate with the Key Person and keep all access routes clear of obstructions for external emergency department to access the factory.',
              'Company\'s head security should be active to open the gate as soon as external emergency service team arrives and should give them clear route where the accident happened inside the factory.',
              'The external emergency service team can enter the industry freely without any obstacles from company\'s security department and can have the access to the incident zone.'
            ]
          },
          liaison: {
            description: 'The external emergency service team should liaise with',
            contacts: [
              'Fire Fighting - Key Person / Deputy',
              'First Aid - Key Person / Deputy',
              'Security Head liaising with key person.'
            ],
            notes: [
              'In case of emergency, emergency teams will be involved in evacuating and doing basic first aid and firefighting activities.',
              'Emergency team coordinator or any one from the emergency team should call upon following external emergency services as per requirement:',
              'i. Fire and Rescue services',
              'ii. Ambulance',
              'iii. Hospital',
              'The emergency team coordinator or any other person assigned by him who have contacted emergency services, should remain at gate to brief the details of emergency event that has occurred such as location, time and duration of occurrence and number of persons affected by the event, etc.'
            ]
          }
        },
        evacuationProcedure: {
          title: 'EVACUATION PROCEDURE',
          description: 'Fire and evacuation alarms are intended to alert building occupants that a fire or other life-threatening situation exists. Upon hearing the alarm, everyone should leave the building immediately in an orderly manner. In the event of a fire, the following steps should be taken to ensure the safety of all building occupants:',
          steps: [
            'Activate the fire alarm.',
            'Call emergency services (Refer emergency contact list) immediately and provide information. Responsibility - Key Person / Deputy',
            'Assist injured personnel or notify emergency responders of the medical emergency.',
            'Exit the building following emergency maps.',
            'Assist physically impaired individuals to a secure area and notify emergency responders.',
            'Ensure all personnel are out of the building.',
            'Sooner all employees have assembled in "SAFE ASSEMBLY POINT", head count should be tallied with attendance and visitor list. In case of shortfall in numbers, Salvage team should identify the missing member and trace him/her out from factory',
            'First aid team should do relevant first aid as per requirement of situation (emergency) and inform emergency services (Ambulance and Hospital) in case external support is required',
            'Firefighting team should act depending on requirement of situation'
          ]
        },
        fireProcedures: {
          title: 'WHAT TO DO IN CASE OF FIRE',
          steps: [
            'Raise alarm',
            'Clear area of personnel',
            'Check whether everybody has safely escaped or been rescued, if possible!',
            'Provide first medical aid if required and inform medical emergency service (doctor, ambulance, hospital)',
            'Close all vents and shut down mechanical ventilation!',
            'Fight fire using available firefighting equipment (but check whether you are using the right type of firefighting equipment before use)!',
            'If possible, remove other combustible/flammable material to avoid spread of fire!',
            'Call fire brigade and inform about the accident.',
            'Assemble personnel at safe assembly point.',
            'Report hazardous conditions.',
            'Stay away from the building until it is safe to return.'
          ],
          firstMedicalAid: {
            title: 'FIRST MEDICAL AID IN CASE OF FIRE',
            steps: [
              'In rescuing workers overcome by smoke, use suitable breathing apparatus or have wet handkerchief around your face before entering the danger area!',
              'Remove accident victim from danger!',
              'Hold a rug, blanket, or coat in front of you, while approaching person whose clothing has caught fire!',
              'Lay down person quickly on the ground and wrap tightly with thick piece of cloth, rug, or coat. Smother flames by gently rolling the person or by gentle pats over the covering.',
              'Do not remove adhering particles of charred clothes. Cover burnt area with sterile or clean dressing and bandage!',
              'Wrap victim into clean clothes. In case of vomiting, turn face towards the side and maintain clear airway!',
              'Check breathing - if stopped, apply artificial respiration!',
              'Check pulse- if absent, give artificial respiration and external heart compression!',
              'Arrest bleeding if present!',
              'Attend to shock by keeping accident victim warm!',
              'Arrange quick transport to doctor or hospital!',
              'At hospital give attending doctor full details about accident conditions and first medical aid measures provided!'
            ]
          }
        },
        gasPoisoning: {
          title: 'WHAT TO DO IN CASE OF GAS POISONING',
          steps: [
            'If a worker is overcome by gas or fumes, use suitable breathing apparatus before entering the danger area!',
            'Remove accident victim from danger area to uncontaminated and well-ventilated place! Provide additional oxygen in case of severe poisoning!',
            'Make accident victim comfortable while giving first aid. In case of vomiting, turn face towards the side and maintain clear airway!',
            'Check breathing - if stopped, apply artificial respiration!',
            'Check pulse- if absent, give artificial respiration and external heart compression!',
            'Arrest bleeding if present!',
            'Attend to shock by keeping accident victim warm!',
            'Arrange quick transport to doctor or hospital!',
            'At hospital give attending doctor full details about accident conditions and first medical aid measures provided!',
            'Note: For H₂S Gas refer H₂S Risk assessment document.'
          ]
        },
        chemicalSplashing: {
          title: 'WHAT TO DO IN CASE OF CHEMICAL SPLASHING ON SKINS AND EYES',
          steps: [
            'Immediately flush away hazardous substance splashed on the skin/in the eyes!',
            'Rinse skin/eye with large volume or clean water for at least 10 minutes!',
            'If skin and clothing of the worker are highly contaminated with chemicals, flush worker with water as clothing is removed!',
            'Check with material safety data sheet for further immediate measures!',
            'Inform supervisor about accident, indicating the chemical involved!',
            'Arrange quick transport to doctor or hospital.',
            'At hospital give attending doctor full details about accident conditions and first medical aid measures provided!'
          ]
        },
        accidentalSwallowing: {
          title: 'WHAT TO DO IN CASE OF ACCIDENTAL SWALLOWING OF CHEMICALS',
          steps: [
            'Make person vomit if conscious! Never induce vomiting or feed water if person is unconscious!',
            'Check breathing - if stopped, apply artificial respiration!',
            'Check pulse - if absent, give artificial respiration and external heart compression!',
            'Inform supervisor about accident, indicating the chemical involved!',
            'Check respective Material Safety Data Sheet of chemical for recommended first medical aid measures!',
            'Arrange quick transport to doctor or hospital. At hospital give attending doctor full details about accident conditions and first medical aid measures provided.'
          ]
        },
        chemicalSpill: {
          title: 'WHAT TO DO IN CASE OF CHEMICAL SPILL AND LEAKS',
          steps: [
            'Evacuate any non-essential personnel to an area safe from any possible harm and provide first medical aid, if required!',
            'If the chemical is flammable or combustible, reduce risk of fire or explosion by removing or turning off any possible source of ignition in the leak/spill area!',
            'Ventilate area well, keeping in mind possible flammable fumes and vapors!',
            'Check Material Safety Data Sheet of respective chemicals before taking further action!',
            'Use personal protective equipment as specified in the Material Safety Data Sheet!',
            'Eliminate further spread of the chemical involved by controlling it at its source, if possible (e.g., close valve, seal tank or reroute)!',
            'Attempt to contain spill or leak by dyking (meaning embankment to prevent flooding) and absorption! If appropriate, put chemical in a sealed container or neutralize as specified on the Material Safety Data Sheet!'
          ]
        },
        generalAccidents: {
          title: 'WHAT TO DO IN CASE OF GENERAL ACCIDENTS WITH MACHINES AND ELECTRICITY',
          steps: [
            'Immediately turn off machine and power!',
            'If accident victim is caught in electrical current, do no touch person with bare hands! Use insulation stick or dry wooden stick to remove accident victim from immediate danger area!',
            'Remove accident victim from danger area (e.g., pit, machine, electrical installation)!',
            'Make accident victim comfortable while giving first aid. In case of vomiting, turn face towards the side and maintain clear airway!',
            'Check breathing - If stopped, apply artificial respiration!',
            'Check pulse - if absent, give artificial respiration and external heart compression!',
            'Arrest bleeding, and attend to electrical burns, if present!',
            'Attend to shock by keeping accident victim warm!',
            'Arrange quick transport to doctor or hospital!',
            'At hospital give attending doctor full details about accident conditions and first medical aid measures provided!'
          ]
        },
        buildingEvacuation: {
          title: 'BUILDING EVACUATION',
          steps: [
            'When the fire alarm is activated, evacuation is mandatory.',
            'DO NOT use elevators.',
            'Take personal belongings (ID, keys, purses, wallets, etc.) and dress appropriately for the weather.',
            'Upon exiting, proceed to your Safe assembly point to begin the accountability process.',
            'Do not, under any circumstances, re-enter the building until authorized to do so by emergency personnel.'
          ]
        },
        suspiciousBehavior: {
          title: 'SUSPICIOUS BEHAVIOR',
          steps: [
            'Do not physically confront the person exhibiting the behavior',
            'Do not let anyone into a locked room/building.',
            'Do not block a person\'s access to an exit.',
            'Call emergency phone number: Internal security'
          ]
        },
        suspiciousPackages: {
          title: 'SUSPICIOUS PACKAGES',
          steps: [
            'Do no touch or disturb the object or package.',
            'Isolate the package and evacuate the immediate area.',
            'Call emergency phone number: Internal security',
            'Notify your building administrator.'
          ]
        },
        activeShooter: {
          title: 'ACTIVE SHOOTER',
          steps: [
            'If possible, exit the building immediately and call emergency phone number: police',
            'If you cannot exit, clear the hallway immediately and/or remain behind closed doors in a locked or barricaded room, if possible. Stay away from all windows. Remain calm and quietly call emergency phone number: police',
            'Evacuate the room only when authorities have arrived and instructed you to do so',
            'DO NOT: Leave or unlock the door to "see what\'s happening."',
            'DO NOT: Attempt to confront or apprehend the shooter, unless as a last resort.',
            'DO NOT: Assume someone else has called police or emergency personnel.'
          ]
        },
        bombThreat: {
          title: 'BOMB THREAT',
          steps: [
            'Remain calm.',
            'Get as much information as possible from the threatening caller.',
            'Call emergency phone number: police',
            'Follow the instructions from emergency personnel.'
          ]
        }
      }
    }
  }

  const [content, setContent] = useState(initializeContent())

  useEffect(() => {
    fetchDocumentContent()
  }, [])

  const fetchDocumentContent = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/organization/documents/content?documentName=HEALTH & SAFETY PROCEDURE')
      const data = await res.json()
      
      if (res.ok) {
        if (data.data?.content) {
          const loadedData = data.data.content.content || content
          if (!loadedData.sections) {
            loadedData.sections = initializeContent().sections
          }
          setContent(loadedData)
          setDocumentInfo({
            docNo: data.data.document.docNo || 'ESF-HS-PRO-06',
            revDate: data.data.document.revDate || '',
            revisionNo: data.data.content.revisionNo,
            revisionDate: data.data.content.revisionDate
          })
        } else {
          setDocumentInfo({
            docNo: 'ESF-HS-PRO-06',
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

  const handleSectionChange = (sectionKey, field, value) => {
    setContent(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionKey]: {
          ...prev.sections[sectionKey],
          [field]: value
        }
      }
    }))
  }

  const handleNestedChange = (sectionKey, nestedKey, field, value) => {
    setContent(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionKey]: {
          ...prev.sections[sectionKey],
          [nestedKey]: {
            ...prev.sections[sectionKey][nestedKey],
            [field]: value
          }
        }
      }
    }))
  }

  const handleArrayChange = (sectionKey, arrayKey, index, field, value) => {
    setContent(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionKey]: {
          ...prev.sections[sectionKey],
          [arrayKey]: prev.sections[sectionKey][arrayKey].map((item, i) =>
            i === index ? { ...item, [field]: value } : item
          )
        }
      }
    }))
  }

  const handleStepsChange = (sectionKey, index, value) => {
    setContent(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionKey]: {
          ...prev.sections[sectionKey],
          steps: prev.sections[sectionKey].steps.map((step, i) =>
            i === index ? value : step
          )
        }
      }
    }))
  }

  const handleAddStep = (sectionKey) => {
    setContent(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionKey]: {
          ...prev.sections[sectionKey],
          steps: [...(prev.sections[sectionKey].steps || []), '']
        }
      }
    }))
  }

  const handleDeleteStep = (sectionKey, index) => {
    setContent(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionKey]: {
          ...prev.sections[sectionKey],
          steps: prev.sections[sectionKey].steps.filter((_, i) => i !== index)
        }
      }
    }))
  }

  const handleAddContact = (sectionKey, nestedKey) => {
    setContent(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionKey]: {
          ...prev.sections[sectionKey],
          [nestedKey]: {
            ...prev.sections[sectionKey][nestedKey],
            contacts: [...(prev.sections[sectionKey][nestedKey].contacts || []), { service: '', number: '' }]
          }
        }
      }
    }))
  }

  const handleDeleteContact = (sectionKey, nestedKey, index) => {
    setContent(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionKey]: {
          ...prev.sections[sectionKey],
          [nestedKey]: {
            ...prev.sections[sectionKey][nestedKey],
            contacts: prev.sections[sectionKey][nestedKey].contacts.filter((_, i) => i !== index)
          }
        }
      }
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
          documentName: 'HEALTH & SAFETY PROCEDURE',
          content: content,
          changeDescription: 'Updated Health & Safety Procedure'
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

      setToast({ type: 'success', message: 'Health & Safety Procedure saved successfully. Revision number incremented.' })
    } catch (error) {
      console.error('Error saving procedure:', error)
      setToast({ type: 'error', message: 'Failed to save changes. Please try again.' })
    }
  }

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'documents', label: 'Document Details', href: '/dashboard/organization/documents' },
    { key: 'health-safety-procedure', label: 'Health & Safety Procedure', href: '#' }
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

  const renderSection = (sectionKey, section) => {
    return (
      <div key={sectionKey} className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase">
          {isAdmin ? (
            <Input
              type="text"
              value={section.title || ''}
              onChange={(e) => handleSectionChange(sectionKey, 'title', e.target.value)}
              className="text-lg font-bold"
            />
          ) : (
            section.title
          )}
        </h3>

        {section.description && (
          <div className="mb-4">
            {isAdmin ? (
              <textarea
                value={section.description}
                onChange={(e) => handleSectionChange(sectionKey, 'description', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                rows={3}
              />
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{section.description}</p>
            )}
          </div>
        )}

        {section.communication && (
          <div className="mb-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description:</label>
              {isAdmin ? (
                <textarea
                  value={section.communication.description}
                  onChange={(e) => handleNestedChange(sectionKey, 'communication', 'description', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  rows={2}
                />
              ) : (
                <p className="text-sm text-gray-700">{section.communication.description}</p>
              )}
            </div>
            {section.communication.contacts && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contacts:</label>
                {section.communication.contacts.map((contact, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    {isAdmin ? (
                      <>
                        <Input
                          type="text"
                          value={contact.service}
                          onChange={(e) => handleArrayChange(sectionKey, 'communication', 'contacts', index, 'service', e.target.value)}
                          className="flex-1"
                          placeholder="Service name"
                        />
                        <Input
                          type="text"
                          value={contact.number}
                          onChange={(e) => handleArrayChange(sectionKey, 'communication', 'contacts', index, 'number', e.target.value)}
                          className="w-32"
                          placeholder="Number"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteContact(sectionKey, 'communication', index)}
                          className="text-red-600"
                        >
                          ×
                        </Button>
                      </>
                    ) : (
                      <span className="text-sm text-gray-700">{contact.service} - {contact.number}</span>
                    )}
                  </div>
                ))}
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddContact(sectionKey, 'communication')}
                    className="mt-2"
                  >
                    + Add Contact
                  </Button>
                )}
              </div>
            )}
            {section.communication.guidelines && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Guidelines:</label>
                {section.communication.guidelines.map((guideline, index) => (
                  <div key={index} className="mb-2">
                    {isAdmin ? (
                      <textarea
                        value={guideline}
                        onChange={(e) => {
                          const newGuidelines = [...section.communication.guidelines]
                          newGuidelines[index] = e.target.value
                          handleNestedChange(sectionKey, 'communication', 'guidelines', newGuidelines)
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        rows={2}
                      />
                    ) : (
                      <p className="text-sm text-gray-700">• {guideline}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {section.steps && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Steps:</label>
            {section.steps.map((step, index) => (
              <div key={index} className="mb-2 flex gap-2">
                <span className="text-sm font-medium text-gray-500 w-8">{index + 1}.</span>
                {isAdmin ? (
                  <>
                    <textarea
                      value={step}
                      onChange={(e) => handleStepsChange(sectionKey, index, e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
                      rows={2}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteStep(sectionKey, index)}
                      className="text-red-600"
                    >
                      ×
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-gray-700 flex-1">{step}</p>
                )}
              </div>
            ))}
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddStep(sectionKey)}
                className="mt-2"
              >
                + Add Step
              </Button>
            )}
          </div>
        )}

        {section.firstMedicalAid && (
          <div className="mt-4">
            <h4 className="text-md font-semibold text-gray-900 mb-2">
              {isAdmin ? (
                <Input
                  type="text"
                  value={section.firstMedicalAid.title}
                  onChange={(e) => handleNestedChange(sectionKey, 'firstMedicalAid', 'title', e.target.value)}
                  className="text-md font-semibold"
                />
              ) : (
                section.firstMedicalAid.title
              )}
            </h4>
            {section.firstMedicalAid.steps && (
              <div>
                {section.firstMedicalAid.steps.map((step, index) => (
                  <div key={index} className="mb-2 flex gap-2">
                    <span className="text-sm font-medium text-gray-500 w-8">{index + 1}.</span>
                    {isAdmin ? (
                      <>
                        <textarea
                          value={step}
                          onChange={(e) => {
                            const newSteps = [...section.firstMedicalAid.steps]
                            newSteps[index] = e.target.value
                            handleNestedChange(sectionKey, 'firstMedicalAid', 'steps', newSteps)
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
                          rows={2}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newSteps = section.firstMedicalAid.steps.filter((_, i) => i !== index)
                            handleNestedChange(sectionKey, 'firstMedicalAid', 'steps', newSteps)
                          }}
                          className="text-red-600"
                        >
                          ×
                        </Button>
                      </>
                    ) : (
                      <p className="text-sm text-gray-700 flex-1">{step}</p>
                    )}
                  </div>
                ))}
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newSteps = [...(section.firstMedicalAid.steps || []), '']
                      handleNestedChange(sectionKey, 'firstMedicalAid', 'steps', newSteps)
                    }}
                    className="mt-2"
                  >
                    + Add Step
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
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
              ESF LEATHER CONSULTANCY
            </h1>
            <h2 className="text-xl font-bold text-gray-900 uppercase mt-2">
              ENVIRONMENTAL, CHEMICAL AND HEALTH & SAFETY EMERGENCY RESPONSE PROCEDURE
            </h2>
            <div className="mt-4 flex gap-6 text-sm text-gray-600">
              <div>
                <span className="font-medium">Prepared By:</span>{' '}
                {isAdmin ? (
                  <Input
                    type="text"
                    value={content.preparedBy}
                    onChange={(e) => handleInputChange('preparedBy', e.target.value)}
                    className="inline-block w-64 ml-2"
                  />
                ) : (
                  <span className="ml-2">{content.preparedBy}</span>
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
                <span className="font-medium">Version:</span>{' '}
                {isAdmin ? (
                  <Input
                    type="text"
                    value={content.version}
                    onChange={(e) => handleInputChange('version', e.target.value)}
                    className="inline-block w-32 ml-2"
                  />
                ) : (
                  <span className="ml-2">{content.version}</span>
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
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/organization/documents')}
          >
            Back to Documents
          </Button>
        </div>

        <div className="p-6 space-y-8">
          {isAdmin && (
            <div className="flex justify-end">
              <Button
                onClick={handleSaveAll}
                className="px-6"
              >
                Save All Changes
              </Button>
            </div>
          )}

          {Object.entries(content.sections || {}).map(([key, section]) => renderSection(key, section))}
        </div>
      </div>
    </div>
  )
}

