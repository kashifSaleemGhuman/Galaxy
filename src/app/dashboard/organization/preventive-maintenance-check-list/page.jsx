'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { Input } from '@/components/ui/Input'

export default function PreventiveMaintenanceCheckListPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [documentInfo, setDocumentInfo] = useState(null)

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN' || session?.user?.role === 'super_admin' || session?.user?.role === 'admin'

  const weeks = ['1st Week', '2nd Week', '3rd Week', '4th Week']

  // Initialize content structure
  const initializeContent = (monthsList, checkPointsList) => {
    const maintenanceData = {}
    monthsList.forEach(month => {
      maintenanceData[month] = {}
      weeks.forEach(week => {
        maintenanceData[month][week] = {}
        checkPointsList.forEach(checkPoint => {
          maintenanceData[month][week][checkPoint] = ''
        })
      })
    })
    return maintenanceData
  }

  // Comprehensive check points list from images
  const defaultCheckPoints = [
    'Motor Temperature',
    'Motor Condition',
    'Hydraulic Oil Level',
    'Oil Leakage',
    'Oil Leakages',
    'Hydraulic Pressure Range',
    'Hydraulic Pressure',
    'All Bearing Condition',
    'Belt Condition',
    'Chain Condition',
    'Switch Condition',
    'Loose Wires / Cables',
    'Loose Wires/Cables',
    'Emergency Switch',
    'Water Status',
    'Greasing Circuit Level',
    'Grease Leakage',
    'Knife Blade Condition',
    'Conveyor Felt Condition',
    'Conveyor Cable Status',
    'Exhaust Status',
    'Spray Gun Working Status',
    'Air Leakages',
    'Dust Collector Condition',
    'Dust Collector Status',
    'Safety Guard Condition',
    'Blower Condition',
    'Radiator Level',
    'Coolant Oil Level',
    'Diesel Level',
    'Battery Condition',
    'Filter & Dust Bowl Condition',
    'Temperature Sensor Condition',
    'Tube Cleaning',
    'Fire Bars Cleaning',
    'Water Level',
    'Safety Valve Condition',
    'Steam Leakage Checking',
    'Bearing Lubrication',
    'Pipeline Connections',
    'Pressure Guage Status',
    'Air Filter Condition',
    'Oil Filter Condition',
    'Oil Seperator Condition',
    'Radiator Cleaning',
    'Hooks Condition',
    'Dog Chain Status',
    'Angle Status',
    'Oil Checking',
    'Chain Drive Oiling',
    'Wheel Status',
    'Woolen Roll Condition',
    'Proper Gauge Adjustment',
    'Steel Roller Status',
    'Support Roller Status',
    'Conveyor Felt Status',
    'Pump Condition',
    'Air Leakages',
    'Dryer Temperature',
    'Emery Paper Status',
    'Gearbox Oil Level',
    'Gear Box Oil Leakage',
    'Felt Condition',
    'Air Hose Condition',
    'Roller Status',
    'Shock Absorbers',
    'Proper Greasing',
    'Upper & Lower Conveyor Felt',
    'Gear Box Oil',
    'Air Leakage',
    'Hydraulic Oil Leakage',
    'Plate Safety Limit Switches',
    'Vacuum Pressure',
    'Plate Temperature',
    'Plate Gear Status',
    'Hot Water Condition',
    'Mesh Condition',
    'Water Level/Leakage',
    'Check the Hydraulic Pressure',
    'Cylinder Limit Switches',
    'Check the Bags for any tear and wear',
    'Check the motor rotating fan inside the drum',
    'Belt Status',
    'LED Display Status',
    'Check the Steam Supply',
    'Hydraulic Pressure Switch',
    'Electrical Heaters',
    'Loose Wires',
    'Others'
  ]

  // Comprehensive check points from all images - unique list
  const allCheckPoints = [
    // Common check points
    'Motor Temperature',
    'Motor Condition',
    'Switch Condition',
    'Loose Wires / Cables',
    'Loose Wires/Cables',
    'Loose Wires',
    'Emergency Switch',
    
    // Hydraulic related
    'Hydraulic Oil Level',
    'Hydraulic Oil Leakage',
    'Oil Leakage',
    'Oil Leakages',
    'Hydraulic Pressure Range',
    'Hydraulic Pressure',
    'Check the Hydraulic Pressure',
    'Check Hydraulic Pressure range',
    'Check Hydraulic Pressure Switch',
    'Hydraulic Pressure Switch',
    
    // Bearing and mechanical
    'All Bearing Condition',
    'Bearing Lubrication',
    
    // Belt and chain
    'Belt Condition',
    'Belt Status',
    'Chain Condition',
    'Chain Status',
    'Chain Drive Oiling',
    'Dog Chain Status',
    
    // Conveyor related
    'Conveyor Felt Condition',
    'Conveyor Felt Status',
    'Conveyor Cable Status',
    'Conveyor Status',
    'Upper & Lower Conveyor Felt',
    
    // Oil and lubrication
    'Oil Checking',
    'Greasing Circuit Level',
    'Grease Leakage',
    'Grease Leakages',
    'Proper Greasing',
    'Gearbox Oil Level',
    'Gear Box Oil Leakage',
    'Gear Box Oil',
    'Gear Oil Level',
    
    // Water and cooling
    'Water Status',
    'Water Level',
    'Water Level/Leakage',
    'Radiator Level',
    'Radiator Cleaning',
    'Coolant Oil Level',
    
    // Diesel generator specific
    'Diesel Level',
    'Battery Condition',
    'Filter & Dust Bowl Condition',
    
    // Boiler specific
    'Temperature Sensor Condition',
    'Tube Cleaning',
    'Fire Bars Cleaning',
    'Safety Valve Condition',
    'Steam Leakage Checking',
    'Check the Steam Supply',
    
    // Air compressor specific
    'Pipeline Connections',
    'Pressure Guage Status',
    'Air Filter Condition',
    'Oil Filter Condition',
    'Oil Seperator Condition',
    
    // Spray booth specific
    'Air Tube Status',
    'Exhaust Status',
    'Exhaust Air Checking',
    'Spray Gun Working Status',
    'Spray Gun Condition',
    'Air Leakages',
    'Air Leakage',
    'Air Hose Condition',
    
    // Dust and safety
    'Dust Collector Condition',
    'Dust Collector Status',
    'Dust Collector',
    'Safety Guard Condition',
    'Safety Guard',
    
    // Blower and fan
    'Blower Condition',
    'Check the motor rotating fan inside the drum',
    
    // Knife and cutting
    'Knife Blade Condition',
    
    // Hooks and mechanical parts
    'Hooks Condition',
    'Hooking Clips Conditions',
    'Angle Status',
    'Wheel Status',
    'Roller Status',
    'Steel Roller Status',
    'Support Roller Status',
    'Shock Absorbers',
    
    // Temperature and pressure
    'Temperature Meter',
    'Temperature Meter Checking',
    'Pressure Guage',
    'Proper Gauge Adjustment',
    'Vacuum Pressure',
    'Plate Temperature',
    
    // Vacuum dryer specific
    'Plate Safety Limit Switches',
    'Plate Gear Status',
    'Hot Water Condition',
    'Mesh Condition',
    
    // Pump and pressure
    'Pump Condition',
    'Dryer Temperature',
    
    // Material condition
    'Woolen Roll Condition',
    'Felt Condition',
    'Emery Paper Status',
    
    // Electrical
    'Electrical Heaters',
    'LED Display Status',
    'Sensor Status',
    'Sensor Condition',
    'Cylinder Limit Switches',
    
    // Briquetting machine specific
    'Check the Bags for any tear and wear',
    
    // Others
    'Others'
  ]

  // Preventive Maintenance Check List Data Structure
  const [content, setContent] = useState({
    machineName: 'SAMMYING',
    months: ['Oct-23', 'Nov-23', 'Dec-23'],
    checkPoints: allCheckPoints,
    maintenanceData: {},
    checkedBy: '',
    verifiedBy: ''
  })

  useEffect(() => {
    fetchDocumentContent()
  }, [])

  const fetchDocumentContent = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/organization/documents/content?documentName=PREVENTIVE MAINTENANCE CHECK LIST')
      const data = await res.json()
      
      if (res.ok) {
        if (data.data?.content) {
          const loadedData = data.data.content.content || content
          // Ensure months and checkPoints exist
          if (!loadedData.months || loadedData.months.length === 0) {
            loadedData.months = ['Oct-23', 'Nov-23', 'Dec-23']
          }
          if (!loadedData.checkPoints || loadedData.checkPoints.length === 0) {
            loadedData.checkPoints = allCheckPoints
          }
          // Ensure maintenanceData structure exists
          if (!loadedData.maintenanceData) {
            loadedData.maintenanceData = initializeContent(loadedData.months, loadedData.checkPoints)
          }
          setContent(loadedData)
          setDocumentInfo({
            docNo: data.data.document.docNo || 'SF-ANE-PM-01',
            revDate: data.data.document.revDate || '',
            revisionNo: data.data.content.revisionNo,
            revisionDate: data.data.content.revisionDate
          })
        } else {
          setDocumentInfo({
            docNo: 'SF-ANE-PM-01',
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

  const handleMaintenanceChange = (month, week, checkPoint, value) => {
    setContent(prev => ({
      ...prev,
      maintenanceData: {
        ...prev.maintenanceData,
        [month]: {
          ...prev.maintenanceData[month],
          [week]: {
            ...prev.maintenanceData[month][week],
            [checkPoint]: value
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

  const handleAddMonth = () => {
    const newMonth = prompt('Enter month (e.g., Nov 2024, Dec 2024):')
    if (newMonth && newMonth.trim()) {
      const monthName = newMonth.trim()
      const months = [...(content.months || []), monthName]
      setContent(prev => {
        const newMaintenanceData = { ...prev.maintenanceData }
        // Initialize data for the new month
        newMaintenanceData[monthName] = weeks.reduce((acc, week) => {
          acc[week] = (prev.checkPoints || []).reduce((cpAcc, cp) => {
            cpAcc[cp] = ''
            return cpAcc
          }, {})
          return acc
        }, {})
        return {
          ...prev,
          months,
          maintenanceData: newMaintenanceData
        }
      })
    }
  }

  const handleRemoveMonth = (monthToRemove) => {
    if (content.months.length <= 1) {
      alert('At least one month is required')
      return
    }
    const months = content.months.filter(m => m !== monthToRemove)
    const maintenanceData = { ...content.maintenanceData }
    delete maintenanceData[monthToRemove]
    setContent(prev => ({
      ...prev,
      months,
      maintenanceData
    }))
  }

  const handleAddCheckPoint = () => {
    const newCheckPoint = prompt('Enter check point name:')
    if (newCheckPoint && newCheckPoint.trim()) {
      const checkPoints = [...(content.checkPoints || []), newCheckPoint.trim()]
      setContent(prev => {
        const newMaintenanceData = { ...prev.maintenanceData }
        prev.months.forEach(month => {
          if (!newMaintenanceData[month]) {
            newMaintenanceData[month] = {}
          }
          weeks.forEach(week => {
            if (!newMaintenanceData[month][week]) {
              newMaintenanceData[month][week] = {}
            }
            newMaintenanceData[month][week][newCheckPoint.trim()] = ''
          })
        })
        return {
          ...prev,
          checkPoints,
          maintenanceData: newMaintenanceData
        }
      })
    }
  }

  const handleRemoveCheckPoint = (checkPointToRemove) => {
    if (content.checkPoints.length <= 1) {
      alert('At least one check point is required')
      return
    }
    const checkPoints = content.checkPoints.filter(cp => cp !== checkPointToRemove)
    const maintenanceData = { ...content.maintenanceData }
    content.months.forEach(month => {
      if (maintenanceData[month]) {
        weeks.forEach(week => {
          if (maintenanceData[month][week]) {
            delete maintenanceData[month][week][checkPointToRemove]
          }
        })
      }
    })
    setContent(prev => ({
      ...prev,
      checkPoints,
      maintenanceData
    }))
  }

  const handleEditMonth = (oldMonth, newMonth) => {
    if (!newMonth || !newMonth.trim()) return
    const months = content.months.map(m => m === oldMonth ? newMonth.trim() : m)
    const maintenanceData = { ...content.maintenanceData }
    if (maintenanceData[oldMonth]) {
      maintenanceData[newMonth.trim()] = maintenanceData[oldMonth]
      delete maintenanceData[oldMonth]
    }
    setContent(prev => ({
      ...prev,
      months,
      maintenanceData
    }))
  }

  const handleSaveAll = async () => {
    try {
      const res = await fetch('/api/organization/documents/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName: 'PREVENTIVE MAINTENANCE CHECK LIST',
          content: content,
          changeDescription: 'Updated Preventive Maintenance Check List'
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

      setToast({ type: 'success', message: 'Preventive Maintenance Check List saved successfully. Revision number incremented.' })
    } catch (error) {
      console.error('Error saving checklist:', error)
      setToast({ type: 'error', message: 'Failed to save changes. Please try again.' })
    }
  }

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'documents', label: 'Document Details', href: '/dashboard/organization/documents' },
    { key: 'preventive-maintenance', label: 'Preventive Maintenance Check List', href: '#' }
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
              ESF LEATHER CONSULTANCY
            </h1>
            <h2 className="text-xl font-bold text-gray-900 uppercase mt-2">
              MACHINERY PREVENTIVE MAINTENANCE
            </h2>
            <div className="mt-4 flex gap-6 text-sm text-gray-600">
              <div>
                <span className="font-medium">Machine Name:</span>{' '}
                {isAdmin ? (
                  <Input
                    type="text"
                    value={content.machineName}
                    onChange={(e) => handleInputChange('machineName', e.target.value)}
                    className="inline-block w-48 ml-2"
                  />
                ) : (
                  <span className="ml-2">{content.machineName}</span>
                )}
              </div>
              {documentInfo && (
                <>
                  <div>
                    <span className="font-medium">Doc No:</span> {documentInfo.docNo}
                  </div>
                  {documentInfo.revDate && (
                    <div>
                      <span className="font-medium">Rev/Date:</span> {documentInfo.revDate}
                    </div>
                  )}
                  {documentInfo.revisionNo && (
                    <div>
                      <span className="font-medium">Revision:</span> {documentInfo.revisionNo} ({new Date(documentInfo.revisionDate).toLocaleDateString()})
                    </div>
                  )}
                </>
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
          {/* Save Button and Controls */}
          {isAdmin && (
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleAddMonth}
                  className="px-4"
                >
                  + Add Month
                </Button>
                <Button
                  variant="outline"
                  onClick={handleAddCheckPoint}
                  className="px-4"
                >
                  + Add Check Point
                </Button>
              </div>
              <Button
                onClick={handleSaveAll}
                className="px-6"
              >
                Save All Changes
              </Button>
            </div>
          )}

          {/* Maintenance Check List Table */}
          <div className="relative w-full">
            <div className="w-full overflow-x-auto overflow-y-visible scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200" style={{ maxWidth: '100%', scrollbarWidth: 'thin' }}>
              <div className="border border-gray-300 rounded-md inline-block min-w-full">
                <table className="min-w-full" style={{ minWidth: 'max-content', tableLayout: 'auto' }}>
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700 sticky left-0 bg-gray-100 z-10 min-w-[200px]">
                      Check Points
                    </th>
                    {content.months?.map(month => (
                      <React.Fragment key={month}>
                        {weeks.map(week => (
                          <th key={`${month}-${week}`} className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold text-gray-700 relative group min-w-[80px]">
                            <div className="flex items-center justify-center gap-1">
                              {isAdmin && (
                                <button
                                  onClick={() => {
                                    const newMonth = prompt('Edit month:', month)
                                    if (newMonth) handleEditMonth(month, newMonth)
                                  }}
                                  className="opacity-0 group-hover:opacity-100 text-blue-600 hover:text-blue-800 text-xs"
                                  title="Edit month"
                                >
                                  ✎
                                </button>
                              )}
                              <div>{month}</div>
                              {isAdmin && content.months.length > 1 && (
                                <button
                                  onClick={() => handleRemoveMonth(month)}
                                  className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 text-xs ml-1"
                                  title="Remove month"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                            <div className="text-xs font-normal">{week}</div>
                          </th>
                        ))}
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {content.checkPoints?.map((checkPoint, index) => (
                    <tr key={`${checkPoint}-${index}`} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 sticky left-0 z-10 group min-w-[200px]">
                        <div className="flex items-center justify-between">
                          <span>{checkPoint}</span>
                          {isAdmin && content.checkPoints.length > 1 && (
                            <button
                              onClick={() => handleRemoveCheckPoint(checkPoint)}
                              className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 text-xs ml-2"
                              title="Remove check point"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </td>
                      {content.months?.map(month => (
                        <React.Fragment key={month}>
                          {weeks.map(week => (
                            <td key={`${month}-${week}`} className="border border-gray-300 px-1 py-1 text-center min-w-[80px]">
                              {isAdmin ? (
                                <Input
                                  type="text"
                                  value={content.maintenanceData[month]?.[week]?.[checkPoint] || ''}
                                  onChange={(e) => handleMaintenanceChange(month, week, checkPoint, e.target.value)}
                                  className="w-full text-xs text-center min-w-[60px]"
                                  placeholder="✓"
                                />
                              ) : (
                                <span className="text-xs">
                                  {content.maintenanceData[month]?.[week]?.[checkPoint] || '-'}
                                </span>
                              )}
                            </td>
                          ))}
                        </React.Fragment>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
            {content.months && content.months.length > 3 && (
              <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow-sm">
                Scroll horizontally to see more months →
              </div>
            )}
          </div>

          {/* Checked By and Verified By Section */}
          <div className="grid grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Checked By:
              </label>
              {isAdmin ? (
                <Input
                  type="text"
                  value={content.checkedBy}
                  onChange={(e) => handleInputChange('checkedBy', e.target.value)}
                  className="w-full"
                  placeholder="Enter name"
                />
              ) : (
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  <span className="text-sm text-gray-700">{content.checkedBy || '-'}</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verified By:
              </label>
              {isAdmin ? (
                <Input
                  type="text"
                  value={content.verifiedBy}
                  onChange={(e) => handleInputChange('verifiedBy', e.target.value)}
                  className="w-full"
                  placeholder="Enter name"
                />
              ) : (
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  <span className="text-sm text-gray-700">{content.verifiedBy || '-'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

