'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { Toast } from '@/components/ui/Toast'
import EditableSection from '@/components/documents/EditableSection'

export default function CrIVPreventionPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [documentInfo, setDocumentInfo] = useState(null)

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN' || session?.user?.role === 'super_admin' || session?.user?.role === 'admin'

  // Cr IV Prevention Data Structure
  const [content, setContent] = useState({
    section1: 'Chromium is a tasteless, odorless inorganic substance naturally occurring in rocks, plants & soils. Chromium VI referred to as hexavalent chromium, is often a component in dyes and other chemical agents used to color leather and textile materials used in footwear, handbags and fashion products.\n\nHexavalent chromium VI is the hazardous form of chromium. It can be formed when trivalent chromium is oxidized. This usually occurs in the presence of oxygen combined with other factors such as extremes in pH. The salts have a characteristic yellow color and are classified as carcinogens. Chromium VI is not used for tanning leather, but chromium III can potentially convert to chromium VI under very specific conditions.\n\nHowever, exposure to chromium VI through either inhalation, ingestion, or direct contact with the skin, has been associated with numerous health effects. Depending on extent and duration of exposure, chromium VI can produce skin irritations and rashes, skin allergies. Furthermore, chromium VI has also been associated with fertility and reproductive issues, as well as increased risk of lung cancer.',
    
    section2: 'Chromium III salts are used during the tanning process for most leather that is produced around the world. Chromium III tanned leather can generate traces of Chromium VI when exposed to certain environmental conditions (heat, UV radiation, changes in pH) or in the presence of unsaturated organic compounds and oxidizing agents. Often several of these factors need to be present at the same time to generate Chromium VI.\n\nThe formation of Chromium VI from Chromium III can take place over time, which means that leather that is free of Chromium VI when it is manufactured may develop traces of Chromium VI later in its life, though this is only likely when the product is exposed to the harsh conditions described above.\n\nUnder well-managed production conditions, chrome tanned leather poses a low risk for Chromium VI formation. Tight process control, high quality raw material and the correct storage conditions can ensure that the risk of hexavalent chromium formation in leather is extremely low.\n\nIt is essential to identify the possible sources of Cr (VI) and the possible generation of the same during the leather and product manufacturing process. The possible direct sources of Cr (VI) are the Basic Chromium Sulphate (BCS) used as a tanning agent, certain class of metal complex dyes and inorganic pigments. Particularly in the case of pigments based on lead chromate is a possible source of hexavalent chromium.\n\nFactors contributing to the conversion of trivalent chromium into hexavalent chromium include neutralisation, ammonia treatment, thermal and photo ageing, fat liquors, and adhesives. Oxidation of Cr (III) to Cr (VI) by oxygen in air at higher pH is also a cause.\n\nCr (VI) contamination occurs from external sources or internal formation within the leather hide. Potential outside sources of production-related chromium (VI) contamination include:\n• Contaminated chromium tanning salts from new production.\n• Contaminated chromium tanning salts produced through the recycling or recovery of previously used chromium (III); or\n• Contaminated tanning liquors containing chromium (VI).\n\nIn Dyeing process:\n• Usage of Ammonia\n• Usage of Ammonia Bicarbonate\n• Usage of Fish Oil\n• Improper fixing process of chromium\n• Drying of leather in Sunlight.\n\nProduction-related chromium contamination from outside sources can also include the use of certain pigments and dyes that contain chromium (VI), contaminated water used in the tanning process, and unclean tanning tubs that have been contaminated with chromium (VI) from previous tanning operations.\n\nChromium (VI) contamination can also result from chemical processes during tanning, specifically an oxidizing effect that converts chromium (III) salts to chromium (VI), exacerbated by pH fluctuations.',
    
    section3: 'Chromium (VI) can be introduced into leather materials during the tanning process, but the formation of chromium (VI) can also occur during normal transportation and storage of materials that have already been processed. According to the German footwear manufacturers\' association CADS3 leather tanneries and manufacturers can try to minimize the potential introduction or formation of chromium (VI) during the entire lifecycle of leather materials and products made of leather by taking some or all the following specific steps:\n\n• Raw skins/hides - Carefully degrease raw skins and raw hides to remove all traces of tanning agents\n• Bleaching agents - avoid or reduce the use of bleaching agents prior to the tanning process. Never use bleaching agents after leather has been tanned\n• Chromium (VI) - free agents - Use chromium (VI)-free tanning agents and chemicals\n• pH values - Neutralize leather materials to the lowest possible pH values\n• Avoid pH peaks during neutralization\n• Wet blue preservation - Preserve wet blues with enough biocidal agents that have been certified for the purpose\n• Vegetable tanning agents - Use 1-3 percent vegetable tanning agents to provide additional protection against oxidation\n• Neutralizing agents - Use neutralizing auxiliaries with reduction capability in neutralization and wetting back of crusts\n• Oxidation-stable fat liquors - Use fat liquors that are oxidation-stable rather than polyunsaturated fat liquors\n• Reducing agents - Use reducing agents such as sodium bisulphite, sodium met bisulphite may be used in the final washing of leather. However, it may please be noted that such treatments may alter the shade and colour intensity of the leather and hence accordingly the process of dyeing needs to be re-standardised\n• Pigments - Do not use pigments or dyes that contain chromium\n• Ammonia - Avoid ammonia or chemicals containing ammonia when neutralizing and purging or dyeing. Use dispersing dyes instead\n• Finishing - Finish the wet finishing at pH values of between 3.5-4.0\n• Supplemental washing - Where feasible, carry out an additional washing procedure\n• Mould formation - Avoid the formation of mould throughout the entire tanning process\n• Post-production checks - after prolonged periods of storage, check leather for post-production formation of chromium (VI)\n• Proper documentation of the processes involving the use of chemicals, batch/log numbers of production and other forms of identification, to provide efficient traceability when required and to help ensure complete transparency\n• Thorough training for production employees on the safe use of all chemicals used in leather production, along with information on the potential hazards associated with misuse. Easy access to current material safety data sheets for all chemicals used\n• Rigorous management of chemicals used in leather production processes or stored in inventory. Regular inventory audits to ensure that chemicals are not stored or used past their expiration date\n• Periodic internal audits and inspections of production processes to ensure that established quality processes are being maintained and that overall quality objectives are being fulfilled\n• Regularly scheduled, formal audits of production facilities and suppliers conducted by independent third parties, and follow-up action plans to address quality system gaps and non-conformities\n• Proactive procurement policies to reduce or eliminate the use of chemicals containing chromium (VI) or chemicals that contribute to the formation of chromium (VI) in leather during or after production\n• In Dyeing Process,\n• Usage of Neutrigon\n• Present of Neutral Syntan. E.g., Tamol XNL\n• Present of Vegetable Syntan, E.g., Tara Powder\n• Present of Waterproof based fat liquors for easy penetration of chromium',
    
    section4: 'There are two types of testing methods for chromium VI.\n\n1) ISO 17075-1:2017\n2) ISO 17075-2:2017\n3) ISO 10195:2018 (A2)',
    
    section5: 'Leather articles being exposed to the skin shall not be placed on the market where they contain chromium VI in concentrations equal to or greater than 3 mg/kg (0, 0003 % by weight) of the total dry weight of the leather.\n\n• ECHA (European Chemical Agency) - <3 ppm\n• REACH (Registration, Authorisation And Restriction of Chemicals) - <3 ppm\n• AFIRM RSL - <3 ppm\n• ZDHC MRSL - <3 ppm',
    
    section6: 'If the Chromium VI in leather is failed, ensure that by testing in another recognised laboratory.\n\nChromium VI failure in Wet Leathers:\n• Neutral Syntan e.g., Tamol XNL can be added in the re-process for minimising the chrome content in the leather\n• For minimising the chrome content, Sodium Bisulphate added in the process\n• Neutrigon can also be added for better penetration of chromium in the leather\n\nChromium VI failure in Finished Leathers:\n• Neutrigon and Sodium Bisulphate can be mixed with water properly and spraying process should be done on the flesh area for minimising and better chromium content result.\n• After the Spraying process, leather must be in ageing process for 24 hrs.\n• After these two processes done, leather can be tested again for chromium present.\n\nIn Dyeing Process:\n• After Re-Chroming process, Ph value must be maintained between 3.8 to 4.2\n• After Tanning / Fixing Process, Ph value must be maintained between 3.6 to 3.8'
  })

  useEffect(() => {
    fetchDocumentContent()
  }, [])

  const fetchDocumentContent = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/organization/documents/content?documentName=Cr IV Prevention')
      const data = await res.json()
      
      if (res.ok) {
        if (data.data?.content) {
          const loadedData = data.data.content.content || content
          setContent(loadedData)
          setDocumentInfo({
            docNo: data.data.document.docNo || 'ESF-RSL-PRO-02',
            revDate: data.data.document.revDate || '',
            revisionNo: data.data.content.revisionNo,
            revisionDate: data.data.content.revisionDate
          })
        } else {
          setDocumentInfo({
            docNo: 'ESF-RSL-PRO-02',
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
          documentName: 'Cr IV Prevention',
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
      throw error
    }
  }

  const handleSaveAll = async () => {
    try {
      const res = await fetch('/api/organization/documents/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName: 'Cr IV Prevention',
          content: content,
          changeDescription: 'Updated Cr IV Prevention'
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

      setToast({ type: 'success', message: 'Cr IV Prevention saved successfully. Revision number incremented.' })
    } catch (error) {
      console.error('Error saving procedure:', error)
      setToast({ type: 'error', message: 'Failed to save changes. Please try again.' })
    }
  }

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'documents', label: 'Document Details', href: '/dashboard/organization/documents' },
    { key: 'cr-iv-prevention', label: 'Cr IV Prevention', href: '#' }
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
              CHROMIUM VI PREVENTION
            </h2>
            {documentInfo && (
              <div className="mt-4 flex gap-6 text-sm text-gray-600">
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
              </div>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/organization/documents')}
          >
            Back to Documents
          </Button>
        </div>

        <div className="p-6 space-y-8">
          {/* Save Button */}
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

          {/* Section 1: What is Chromium VI */}
          <EditableSection
            title="1. WHAT IS CHROMIUM VI?"
            content={content.section1}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="section1"
            contentType="text"
          />

          {/* Section 2: Why Does Leather Become Contaminated */}
          <EditableSection
            title="2. WHY DOES LEATHER BECOME CONTAMINATED WITH CHROME VI?"
            content={content.section2}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="section2"
            contentType="text"
          />

          {/* Section 3: Procedure for Preventing Formation */}
          <EditableSection
            title="3. PROCEDURE FOR PREVENTING THE FORMATION OF CHROMIUM VI"
            content={content.section3}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="section3"
            contentType="text"
          />

          {/* Section 4: Testing Methods */}
          <EditableSection
            title="4. CHROMIUM VI TESTING METHODS"
            content={content.section4}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="section4"
            contentType="text"
          />

          {/* Section 5: Chromium VI Limits */}
          <EditableSection
            title="5. CHROMIUM VI LIMITS"
            content={content.section5}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="section5"
            contentType="text"
          />

          {/* Section 6: Failure Procedure */}
          <EditableSection
            title="6. CHROMIUM VI FAILURE PROCEDURE"
            content={content.section6}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="section6"
            contentType="text"
          />
        </div>
      </div>
    </div>
  )
}

