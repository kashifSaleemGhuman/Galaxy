'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { Toast } from '@/components/ui/Toast'
import EditableSection from '@/components/documents/EditableSection'

export default function RSLProcedurePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [documentInfo, setDocumentInfo] = useState(null)

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN' || session?.user?.role === 'super_admin' || session?.user?.role === 'admin'

  // RSL Procedure Data Structure - Complete with all sections
  const [content, setContent] = useState({
    // Procedure Sections (Text-based, editable)
    section91: 'To ensure that the products produced by the company are within the scope of safe use and do not harm to the environment and consumers, in accordance with the requirements of customers and laws, the restricted substances are controlled to meet the requirements of customers and laws.\n\nWe are committed to ensuring that all our leather complies to customer requirements and/or our internal specifications whichever is more stringent. Also, for specific product lines of those customers who require stricter requirements.\n\nOur tannery is committed to sustainable business practices and pursuit of continual improvement ensuring to comply with customer requirements.\n\nThe purpose that we make this RSL policy is to make sure our products will not be harmful to the environment and the customers, we strictly control the restricted substance according to customer and legal requirements.',
    
    section92: 'The Policy and Specification will be communicated to all existing and new Clients, when changes are made to the policy and specifications informal and formal communication by Hardcopy or e-mail will be sent out within two months from the revision date.\n\nCustomers will be contacted once in 6 months / beginning of every season to check for RSL re-evaluation. For customers/Traders who do not specify their RSL the tannery will use REACH restricted substance requirements or own RSL for their customers.',
    
    section93: 'Tannery will collect the Restricted Substance Requirements from all the customers for each season or every six months.\n\nOnce all the customer RSLs are obtained, tannery will make their own restricted substance list according to the required substance limits for testing.\n\nTannery will make sure that they will mention the lowest substance limits from among the customers RSL at the time of own RSL preparation.\n\nIf any of the customers who have not already made known their restricted substance requirements, the tannery will use REACH restricted substance requirements or own RSL for their customers.\n\nTannery must include all the specifications required from the clients in their own Restricted Substance List.\n\nIf the tannery produces leather that it will be used for child products, the tannery must include child specifications in their own RSL',
    
    section94: 'Tannery will record the compliance from all the clients to monitor their restricted substance requirements.\n\nTannery will also make a clients\' compliance register to up-to date about clients\' specifications.\n\nClients\' compliance register record must include Annex - 2:\n• Date Contacted\n• Means of contact (Telephone, Emails, etc.,)\n• Date response received from the client\n• Clients\' specification reference number / code\n• Acceptance of tannery\'s own RSL if any client who is not having their RSL\n• Review Date',
    
    section95: 'The tannery will check with customers in the beginning of each season or once in 6 months for any change in RSL leather specifications.\n\nThe company will select suppliers of chemicals to meet the RSL specifications ultimately comply with MRSL specifications with commitment with stakeholders of the enterprise supply chain.\n\nTesting of newly developed products: new products must be tested for restricted substances before mass production.\n\nTesting of chemical material replacement products: When the company adopts new chemical materials, the development department must make a sample first, and conduct a test of restricted substances before mass production.',
    
    section97a: 'Testing is done at least one time per year for at least 3 major articles and articles that constitute more than 50% of the total annual output as a minimum requirement, for conformance to the restricted substances limits set out in Annexure 1.\n\nIf a customer requires its purchases from ESF LEATHER to conform to more stringent limits for certain product lines, additional restricted substances testing will be done for those product lines. If a product line does not meet customer requirements, the tanning process will be further improved to meet the requirements or will be discontinued/ suspended if they fail to meet the customer requirements.\n\nThe tannery will review its restricted substances once in 6 months.',
    
    section97b: 'Our commitment is to work with ISO 17025-1 or -2 certified testing laboratories or customer approved certified laboratories.\n\nIf the customer has a designated testing organization, the testing organization shall be selected according to the customer\'s requirements.\n\nIf the customer does not specify it, the testing organization that has passed ISO17025 certification shall be selected. Currently, the testing organizations recommended by the company are: TUV, SGS, Intertek & BV,\n\nTannery will select the third-party laboratories according to the requirement of testing needed:\n• Ageing Method must be ISO 10195:2018 (A2)\n• Chromium VI testing must be ISO 17075-1 or -2',
    
    section97c: 'The determination of a product line is done by a tannery with their maximum percentage of total output of an article leather produced during a year or season for a customer.\n\nThe multiple leather articles names can be merged into one article based upon their article production flow with same recipes but different article names for different customers.',
    
    section910: 'Tannery must identify top three articles for a year or top product lines which constitute of more than 50% of articles for a season for complete RSL testing.\n\n0.5% or more of batches of crust and finished leather produced are tested in a third-party laboratory. Refer Annex - 3.\n\nEach product line is at least tested quarterly, with artificial testing method for Chrome VI.\n\nMore than 3% of outgoing crust and finished leather produced are tested for CrVI with ageing method by tannery\'s own client approved laboratory or third-party laboratory.\n\nTannery must test CrV testing for tanned leather at least four tests per year.',
    
    section913: 'Tannery must test the outgoing finished/crust leather for Chrome VI with ageing method for more than 3% of batches produced during two years in a third-party laboratory. Refer Annex - 4.\n\nOne batch is one production drum, small & development samples may be ignored.',
    
    section914: 'Tannery should test the tanned leather quarterly or batch wise for sale.\n\n4 tests per year each quarter test or batch wise testing.\n\nRecord must be maintained for the incidence of Chrome VI testing.\n\nIf the testing is failed in Chrome VI, then immediate Chrome VI failure procedure must be followed and take immediate corrective action to resolve and find the cause of failure.',
    
    section915: 'Chromium (VI) can be introduced into leather materials during the tanning process, but the formation of chromium (VI) can also occur during normal transportation and storage of materials that have already been processed. According to the German footwear manufacturers\' association CADS3 leather tanneries and manufacturers can try to minimize the potential introduction or formation of chromium (VI) during the entire lifecycle of leather materials and products made of leather by taking some or all the following specific steps:\n\n• Raw skins/hides - Carefully degrease raw skins and raw hides to remove all traces of tanning agents\n• Bleaching agents - avoid or reduce the use of bleaching agents prior to the tanning process. Never use bleaching agents after leather has been tanned\n• Chromium (VI) - free agents - Use chromium (VI)-free tanning agents and chemicals\n• pH values - Neutralize leather materials to the lowest possible pH values\n• Avoid pH peaks during neutralization\n• Wet blue preservation - Preserve wet blues with enough biocidal agents that have been certified for the purpose\n• Vegetable tanning agents - Use 1-3 percent vegetable tanning agents to provide additional protection against oxidation\n• Neutralizing agents - Use neutralizing auxiliaries with reduction capability in neutralization and wetting back of crusts\n• Oxidation-stable fat liquors - Use fat liquors that are oxidation-stable rather than polyunsaturated fat liquors\n• Reducing agents - Use reducing agents such as sodium bisulphite, sodium met bisulphite may be used in the final washing of leather. However, it may please be noted that such treatments may alter the shade and colour intensity of the leather and hence accordingly the process of dyeing needs to be re-standardised\n• Pigments - Do not use pigments or dyes that contain chromium\n• Ammonia - Avoid ammonia or chemicals containing ammonia when neutralizing and purging or dyeing. Use dispersing dyes instead\n• Finishing - Finish the wet finishing at pH values of between 3.5-4.0\n• Supplemental washing - Where feasible, carry out an additional washing procedure\n• Mould formation - Avoid the formation of mould throughout the entire tanning process\n• Post-production checks - after prolonged periods of storage, check leather for post-production formation of chromium (VI)\n• Proper documentation of the processes involving the use of chemicals, batch/log numbers of production and other forms of identification, to provide efficient traceability when required and to help ensure complete transparency\n• Thorough training for production employees on the safe use of all chemicals used in leather production, along with information on the potential hazards associated with misuse. Easy access to current material safety data sheets for all chemicals used\n• Rigorous management of chemicals used in leather production processes or stored in inventory. Regular inventory audits to ensure that chemicals are not stored or used past their expiration date\n• Periodic internal audits and inspections of production processes to ensure that established quality processes are being maintained and that overall quality objectives are being fulfilled\n• Regularly scheduled, formal audits of production facilities and suppliers conducted by independent third parties, and follow-up action plans to address quality system gaps and non-conformities\n• Proactive procurement policies to reduce or eliminate the use of chemicals containing chromium (VI) or chemicals that contribute to the formation of chromium (VI) in leather during or after production',
    
    section915Failures: 'The testing limit of Chrome VI specification must be less than 3ppm or 3 mg/kg.\n\nChrome VI testing must be Ageing method with ISO 10195:2018 (A2).\n\nIf the Chromium VI in leather is failed, ensure that by testing in another laboratory.\n\nIf Chrome VI is failure in wet leather, then appropriate chemicals must be added in recipe sheet in the re-process.\n\nSuitable chemicals must be added for better penetration of chrome in the leather.\n\nIf the Chrome VI failure occurs in finishing leather, then check with the chemicals which reduces the chrome content and can be mixed with water and then spraying operation must be done. After the process is done, leather must be in ageing process for 24 hours.\n\nAfter these two processes have been done if Chrome VI failure occurs in wet leathers and dry leathers, the processed leather can be re-tested again for Chrome VI.\n\nRecord the failure in the spreadsheet with corrective action taken, root cause for the failure for better understanding and to minimize the future Chrome VI failures.',
    
    section916: 'All outgoing leather must be tested at least quarterly. Refer Annex - 4.\n\nChrome VI testing must be done with artificial ageing method.\n\nEach product line should be testing.\n\nChrome VI conforms the industry standard irrespective of whether by client or tannery RS Specifications.\n\nThere have been no CrVI failure in the past two years.\n\nTesting incidence should be greater than 5% of batches of crust and/or finished leather produced.',
    
    section919: 'The tannery will make an own RSL Specifications for incoming part-processed leather\n\nTannery must include all the specifications required for incoming part-processed leather. Refer Annex - 5',
    
    section920: 'The tannery will not use a part processed material unless it is supported by evidence supplied twice a year (e.g., test report) that it conforms to the tannery\'s RSL.\n\nTannery will also make a supplier compliance register to up-to date about incoming part processed & chemical that conform the tannery RSL specifications.\n\nSupplier compliance register record must include Annex - 7:\n• Date Contacted\n• Means of contact (Telephone, Emails, etc.,)\n• Date response received from the client\n• Amount of material used annually\n• Acceptance of tannery\'s own RSL\n• Review Date',
    
    section922: 'If a new chemical is substituted or new process introduced, the supplier of chemicals is expected to declare the chemical at the time of supply, risk analysis will be done.\n\nIf risk seems high, the product line will be tested after approval from management.\n\nAll chemical suppliers are expected to declare REACH declaration, Tannery RSL specifications and all Materials Safety Data Sheets (MSDS) for the safe handling of their products.\n\nRisk Analysis must be done by testing the leather after chemical change and compare the results with previous test with old chemical recipe.\n\nIf the results are pass in both the chemical recipes, then the chemical recipe change is approved and granted for the usage in the production.',
    
    section924: 'Tannery must ensure that each supplier of part processed leather provides Chrome VI test reports at least annually.\n\nChrome VI testing must be artificial ageing method.\n\nChrome testing must be ISO 17075 standard.\n\nAll incoming chrome tanned material conforms to the industry standard of less than 3ppm.\n\nAll incoming chromium containing chemicals (chrome tanning salts, dyes & pigments) contain less than 10 ppm CrVI.',
    
    section926: 'Tannery must not use incoming wet blue unless it is supported by a compliance declaration\n\nFat content in incoming wet blue must be less than 3% that are unlikely to contribute the formation of CrVI.\n\nFat content in own produced wet blue leathers must be less than 3% and weekly test must be done.\n\nIn house / third party testing must be carried weekly for fat content in incoming wet blue leathers.',

    // Annex 1: ESF RSL Requirements
    annex1: [
      {
        id: 1,
        siNo: 1,
        property: 'Chrome VI without ageing (optional)',
        testMethod: 'EN ISO 17075-1:2007',
        requirement: '<3 ppm'
      },
      {
        id: 2,
        siNo: 1,
        property: 'Chrome 6 with ageing',
        testMethod: 'ISO 10195:2018',
        requirement: '<3 ppm'
      },
      {
        id: 3,
        siNo: 2,
        property: 'Formaldehyde',
        testMethod: 'CEN ISO 17226-1:2008 / Analysis using HPLC-RAD',
        requirement: '<75 ppm'
      },
      {
        id: 4,
        siNo: 3,
        property: 'Chlorinated paraffins (C10-C13)',
        testMethod: '',
        requirement: '<1000 ppm'
      },
      {
        id: 5,
        siNo: 4,
        property: 'Alkyl phenol Total',
        testMethod: 'ISO 18218-1:2015 / Analysis was conducted by HPLC-MS/GC-MS',
        requirement: '<100 mg/kg'
      },
      {
        id: 6,
        siNo: 5,
        property: 'Alkyl phenol ethoxylate (APEO)',
        testMethod: '',
        requirement: '<100 mg/kg'
      },
      {
        id: 7,
        siNo: 6,
        property: 'Dimethyl fumarate (DMF)',
        testMethod: 'Solvent Extraction / Analysis by GC-MS',
        requirement: '<0.1 ppm'
      },
      {
        id: 8,
        siNo: 7,
        property: 'Chlorinated fungicides (TeCP, PCP, TCP)',
        testMethod: 'EN ISO 17075:2015',
        requirement: '<0.5 PCP, <0.1 TeCP, <0.5 TCP'
      },
      {
        id: 9,
        siNo: 8,
        property: 'Azo dyestuffs',
        testMethod: 'CEN ISO 17234:-1:2015',
        requirement: '<20 ppm'
      }
    ],
    // Heavy Metals
    heavyMetals: [
      { id: 1, siNo: 1, property: 'Antimony (extractable)', testMethod: 'EN ISO 17072-1:2011 / Analysis by ICP - MS', requirement: '<30' },
      { id: 2, siNo: 2, property: 'Arsenic (extractable)', testMethod: 'EN ISO 17072-1:2011 / Analysis by ICP - MS', requirement: '<0.2' },
      { id: 3, siNo: 3, property: 'Barium (extractable)', testMethod: 'EN ISO 17072-1:2011 / Analysis by ICP - MS', requirement: '<1000' },
      { id: 4, siNo: 4, property: 'Cadmium extractable', testMethod: 'EN ISO 17072-1:2011 / Analysis by ICP - MS', requirement: '<0.1' },
      { id: 5, siNo: 5, property: 'Cobalt extractable', testMethod: 'EN ISO 17072-1:2011 / Analysis by ICP - MS', requirement: '<4' },
      { id: 6, siNo: 6, property: 'Copper extractable', testMethod: 'EN ISO 17072-1:2011 / Analysis by ICP - MS', requirement: '<50' },
      { id: 7, siNo: 7, property: 'Lead extractable', testMethod: 'EN ISO 17072-1:2011 / Analysis by ICP - MS', requirement: '<1' },
      { id: 8, siNo: 8, property: 'Mercury extractable', testMethod: 'EN ISO 17072-1:2011 / Analysis by ICP - MS', requirement: '<0.02' },
      { id: 9, siNo: 9, property: 'Nickel', testMethod: 'EN ISO 17072-1:2011 / Analysis by ICP - MS', requirement: '<1' },
      { id: 10, siNo: 10, property: 'Selenium', testMethod: 'EN ISO 17072-1:2011 / Analysis by ICP - MS', requirement: '<500' }
    ],
    // Annex 2: Clients' Compliance Register Format
    annex2: [],
    // Annex 3: Outgoing Leather Testing Register Format
    annex3: [],
    // Annex 4: Chrome VI Testing Register Format
    annex4: [],
    // Annex 5: RSL Specifications for Incoming Wet Blue Format
    annex5: [
      {
        id: 1,
        substanceGroup: 'Biocides',
        itemNo: 1,
        substance: 'Di methyl Fumarate [DMF]',
        testMethod: 'DIN CEN ISO TS 16186:2012',
        babyChildPPM: '<0.1',
        adultPPM: ''
      },
      {
        id: 2,
        substanceGroup: 'Biocides',
        itemNo: 2,
        substance: 'Triclosan',
        testMethod: '',
        babyChildPPM: '10',
        adultPPM: '10'
      },
      {
        id: 3,
        substanceGroup: 'Chromium',
        itemNo: 1,
        substance: 'Chrome VI',
        testMethod: 'BS EN ISO 17075',
        babyChildPPM: '<3',
        adultPPM: '<3'
      },
      {
        id: 4,
        substanceGroup: 'Chlorinated Phenols',
        itemNo: 1,
        substance: 'Penta Chloro Phenol [PCP]',
        testMethod: '',
        babyChildPPM: '0.5',
        adultPPM: '0.5'
      },
      {
        id: 5,
        substanceGroup: 'Chlorinated Phenols',
        itemNo: 2,
        substance: 'Tetra Chloro Phenol [TeCP]',
        testMethod: 'DIN EN ISO 17070',
        babyChildPPM: '0.5',
        adultPPM: '0.5'
      },
      {
        id: 6,
        substanceGroup: 'Chlorinated Phenols',
        itemNo: 3,
        substance: 'Tri Chloro Phenol [TriCP]',
        testMethod: '',
        babyChildPPM: '0.5',
        adultPPM: '0.5'
      },
      {
        id: 7,
        substanceGroup: 'Phenols / Phenol Ethoxylates',
        itemNo: 1,
        substance: 'Nonylphenols [NP]',
        testMethod: '',
        babyChildPPM: '10',
        adultPPM: '10'
      },
      {
        id: 8,
        substanceGroup: 'Phenols / Phenol Ethoxylates',
        itemNo: 2,
        substance: 'Nonylphenol Ethoxylates [NPEO]',
        testMethod: 'EN ISO 18218, EN ISO 18254',
        babyChildPPM: '<100',
        adultPPM: '<100'
      },
      {
        id: 9,
        substanceGroup: 'Phenols / Phenol Ethoxylates',
        itemNo: 3,
        substance: 'Octylphenols [OP]',
        testMethod: '',
        babyChildPPM: '10',
        adultPPM: '10'
      }
    ],
    // Annex 6: RSL Specifications for Incoming Chemicals
    annex6: [
      {
        id: 1,
        substanceGroup: 'Azo Dyes',
        substance: 'Aromatic Amines [24 Substances]',
        testMethod: 'DIN EN ISO 17234 2:2011',
        babyChildPPM: '150',
        adultPPM: '150'
      },
      {
        id: 2,
        substanceGroup: 'Biocides',
        substance: 'Triclosan',
        testMethod: '',
        babyChildPPM: '250',
        adultPPM: '250'
      },
      {
        id: 3,
        substanceGroup: 'Chromium',
        substance: 'Chrome VI',
        testMethod: 'BS EN ISO 17075',
        babyChildPPM: '<10',
        adultPPM: '<10'
      },
      {
        id: 4,
        substanceGroup: 'Chlorinated Phenols',
        substance: 'Penta chlorophenol',
        testMethod: 'DIN EN ISO 17070',
        babyChildPPM: '20',
        adultPPM: '20'
      },
      {
        id: 5,
        substanceGroup: 'Chlorinated Phenols',
        substance: 'Tetrachlorophenol',
        testMethod: 'DIN EN ISO 17070',
        babyChildPPM: '20',
        adultPPM: '20'
      },
      {
        id: 6,
        substanceGroup: 'Chlorinated Phenols',
        substance: 'Trichlorophenol',
        testMethod: 'DIN EN ISO 17070',
        babyChildPPM: '50',
        adultPPM: '50'
      },
      {
        id: 7,
        substanceGroup: 'Chlorinated Phenols',
        substance: 'Di Chlorophenol',
        testMethod: 'DIN EN ISO 17070',
        babyChildPPM: '50',
        adultPPM: '50'
      },
      {
        id: 8,
        substanceGroup: 'Phenols / Phenol Ethoxylates',
        substance: 'Nonylphenols [NP]',
        testMethod: 'EN ISO 18218, EN ISO 18254',
        babyChildPPM: '250',
        adultPPM: '250'
      },
      {
        id: 9,
        substanceGroup: 'Phenols / Phenol Ethoxylates',
        substance: 'Nonylphenol Ethoxylates [NPEO]',
        testMethod: 'EN ISO 18218, EN ISO 18254',
        babyChildPPM: '500',
        adultPPM: '500'
      },
      {
        id: 10,
        substanceGroup: 'Phenols / Phenol Ethoxylates',
        substance: 'Octylphenols [OP]',
        testMethod: 'EN ISO 18218, EN ISO 18254',
        babyChildPPM: '250',
        adultPPM: '250'
      },
      {
        id: 11,
        substanceGroup: 'Phenols / Phenol Ethoxylates',
        substance: 'Octylphenol Ethoxylates [OPEO]',
        testMethod: 'EN ISO 18218, EN ISO 18254',
        babyChildPPM: '500',
        adultPPM: '500'
      },
      {
        id: 12,
        substanceGroup: 'Metals - Total content',
        substance: 'Arsenic (As)',
        testMethod: 'DIN EN ISO 17072-2:2011',
        babyChildPPM: '50',
        adultPPM: '50'
      },
      {
        id: 13,
        substanceGroup: 'Metals - Total content',
        substance: 'Cadmium(Cd)',
        testMethod: 'DIN EN ISO 17072-2:2011',
        babyChildPPM: '20/50',
        adultPPM: '20/50'
      },
      {
        id: 14,
        substanceGroup: 'Metals - Total content',
        substance: 'Lead (Pb)',
        testMethod: 'EN ISO 105-E04',
        babyChildPPM: '100',
        adultPPM: '100'
      },
      {
        id: 15,
        substanceGroup: 'Metals - Total content',
        substance: 'Mercury (Hg)',
        testMethod: 'EN ISO 105-E04',
        babyChildPPM: '4/25',
        adultPPM: '4/25'
      },
      {
        id: 16,
        substanceGroup: 'Metals - Total content',
        substance: 'Antimony (Sb)',
        testMethod: 'EN ISO 105-E04',
        babyChildPPM: '50/250',
        adultPPM: '50/250'
      },
      {
        id: 17,
        substanceGroup: 'Metals - Total content',
        substance: 'Cobalt (Co)',
        testMethod: 'EN ISO 105-E04',
        babyChildPPM: '500',
        adultPPM: '500'
      },
      {
        id: 18,
        substanceGroup: 'Metals - Total content',
        substance: 'Silver (Ag)',
        testMethod: '',
        babyChildPPM: '100',
        adultPPM: '100'
      },
      {
        id: 19,
        substanceGroup: 'Metals - Total content',
        substance: 'Barium (Ba)',
        testMethod: '',
        babyChildPPM: '100',
        adultPPM: '100'
      },
      {
        id: 20,
        substanceGroup: 'Metals - Total content',
        substance: 'Copper (Cu)',
        testMethod: '',
        babyChildPPM: '250',
        adultPPM: '250'
      },
      {
        id: 21,
        substanceGroup: 'Metals - Total content',
        substance: 'Chromium (Cr)',
        testMethod: '',
        babyChildPPM: '100',
        adultPPM: '100'
      },
      {
        id: 22,
        substanceGroup: 'Metals - Total content',
        substance: 'Nickel (Ni)',
        testMethod: '',
        babyChildPPM: '250',
        adultPPM: '250'
      },
      {
        id: 23,
        substanceGroup: 'Metals - Total content',
        substance: 'Selenium (Se)',
        testMethod: '',
        babyChildPPM: '20/100',
        adultPPM: '20/100'
      },
      {
        id: 24,
        substanceGroup: 'Metals - Total content',
        substance: 'Tin (Sn)',
        testMethod: '',
        babyChildPPM: '250',
        adultPPM: '250'
      },
      {
        id: 25,
        substanceGroup: 'Short Chain Chlorinated paraffins (C10-C13) SCCP',
        substance: 'Short Chain Chlorinated paraffins (C10-C13) SCCP',
        testMethod: 'EN 18219',
        babyChildPPM: '250',
        adultPPM: '250'
      }
    ],
    // Annex 7: Supplier Compliance Register Format
    annex7: []
  })

  useEffect(() => {
    fetchDocumentContent()
  }, [])

  const fetchDocumentContent = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/organization/documents/content?documentName=RSL PROCEDURE')
      const data = await res.json()
      
      if (res.ok) {
        if (data.data?.content) {
          const loadedData = data.data.content.content || content
          setContent(loadedData)
          setDocumentInfo({
            docNo: data.data.document.docNo || 'ESF-RSL-PRO-02',
            revDate: data.data.document.revDate || 'Rev.No-03/Date-16-10-2023',
            revisionNo: data.data.content.revisionNo,
            revisionDate: data.data.content.revisionDate
          })
        } else {
          setDocumentInfo({
            docNo: 'ESF-RSL-PRO-02',
            revDate: 'Rev.No-03/Date-16-10-2023',
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
          documentName: 'RSL PROCEDURE',
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

  const handleTableChange = (tableName, index, field, value) => {
    const updatedContent = {
      ...content,
      [tableName]: content[tableName].map((row, i) => 
        i === index ? { ...row, [field]: value } : row
      )
    }
    setContent(updatedContent)
  }

  const handleAddTableRow = (tableName, defaultRow) => {
    const updatedContent = {
      ...content,
      [tableName]: [...content[tableName], defaultRow]
    }
    setContent(updatedContent)
  }

  const handleDeleteTableRow = (tableName, index) => {
    if (content[tableName].length > 0) {
      const updatedContent = {
        ...content,
        [tableName]: content[tableName].filter((_, i) => i !== index)
      }
      setContent(updatedContent)
    }
  }

  const handleSaveAll = async () => {
    try {
      const res = await fetch('/api/organization/documents/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName: 'RSL PROCEDURE',
          content: content,
          changeDescription: 'Updated RSL Procedure'
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

      setToast({ type: 'success', message: 'RSL Procedure saved successfully. Revision number incremented.' })
    } catch (error) {
      console.error('Error saving procedure:', error)
      setToast({ type: 'error', message: 'Failed to save changes. Please try again.' })
    }
  }

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'documents', label: 'Document Details', href: '/dashboard/organization/documents' },
    { key: 'rsl-procedure', label: 'RSL Procedure', href: '#' }
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

  // Render table section
  const renderTableSection = (title, tableName, columns, getDefaultRow) => (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-green-600 pb-2">
          {title}
        </h2>
        {isAdmin && (
          <Button
            variant="outline"
            onClick={() => handleAddTableRow(tableName, getDefaultRow())}
            className="px-4"
          >
            + Add Row
          </Button>
        )}
      </div>
      <div className="overflow-x-auto border border-gray-300 rounded-md mt-4">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100">
              {columns.map((col, idx) => (
                <th key={idx} className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                  {col.label}
                </th>
              ))}
              {isAdmin && (
                <th className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {content[tableName].map((row, index) => (
              <tr key={row.id || index} className="hover:bg-gray-50">
                {columns.map((col, idx) => (
                  <td key={idx} className="border border-gray-300 px-2 py-1">
                    {isAdmin ? (
                      <Input
                        type={col.type || 'text'}
                        value={row[col.field] || ''}
                        onChange={(e) => handleTableChange(tableName, index, col.field, col.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value)}
                        className="w-full text-sm"
                        placeholder={col.placeholder}
                      />
                    ) : (
                      <span className="text-sm">{row[col.field] || '-'}</span>
                    )}
                  </td>
                ))}
                {isAdmin && (
                  <td className="border border-gray-300 px-2 py-1 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTableRow(tableName, index)}
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
  )

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
              RSL Procedure
            </h1>
            {documentInfo && (
              <div className="mt-4 flex gap-6 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Doc No:</span> {documentInfo.docNo}
                </div>
                <div>
                  <span className="font-medium">Rev/Date:</span> {documentInfo.revDate}
                </div>
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

          {/* OUTGOING MATERIAL PROCEDURES */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900">OUTGOING MATERIAL PROCEDURES</h2>
          </div>

          <EditableSection
            title="9.1 WRITTEN INSTRUCTIONS FOR RSL MANAGEMENT"
            content={content.section91}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="section91"
            contentType="text"
          />

          <EditableSection
            title="9.2 INSTRUCTIONS FOR COMMUNICATION WITH CLIENTS FOR RSL REQUIREMENTS"
            content={content.section92}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="section92"
            contentType="text"
          />

          <EditableSection
            title="9.3, 9.6A, B DETERMINING OF INTERNAL RSL SPECIFICATION IN CONJUNCTION WITH CUSTOMER REQUIREMENTS"
            content={content.section93}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="section93"
            contentType="text"
          />

          <EditableSection
            title="9.4 CUSTOMER RSL COMPLIANCE REGISTER FOR MONITORING UP TO DATE CLIENT SPECIFICATIONS"
            content={content.section94}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="section94"
            contentType="text"
          />

          <EditableSection
            title="9.5 PROCEDURE TO DETERMINE FREQUENCY OF RSL SPECIFICATION REVIEW"
            content={content.section95}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="section95"
            contentType="text"
          />

          <EditableSection
            title="9.7a FREQUENCY OF TESTING"
            content={content.section97a}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="section97a"
            contentType="text"
          />

          <EditableSection
            title="9.7b PROCEDURE TO APPROVE TESTING LAB ACCORDING TO CLIENT SPECIFICATION OR INTERNAL POLICY"
            content={content.section97b}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="section97b"
            contentType="text"
          />

          <EditableSection
            title="9.7c DETERMINATION OF PRODUCT LINE"
            content={content.section97c}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="section97c"
            contentType="text"
          />

          <EditableSection
            title="9.10 & 9.12 INCIDENCE OF TESTING FOR OUTGOING CRUST AND FINISHED LEATHER"
            content={content.section910}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="section910"
            contentType="text"
          />

          <EditableSection
            title="9.13 PROCEDURE TO TEST OUTGOING LEATHER FOR CHROME VI"
            content={content.section913}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="section913"
            contentType="text"
          />

          <EditableSection
            title="9.14 PROCEDURE FOR CHROME VI TESTING FOR SALES OF WETBLUE LEATHER"
            content={content.section914}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="section914"
            contentType="text"
          />

          <EditableSection
            title="9.15 PROCEDURE FOR PREVENTING THE FORMATION OF CHROME VI"
            content={content.section915}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="section915"
            contentType="text"
          />

          <EditableSection
            title="9.15 PROCEDURE FOR CHROME VI FAILURES"
            content={content.section915Failures}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="section915Failures"
            contentType="text"
          />

          <EditableSection
            title="9.16 INCIDENT OF CRVI FAILURE REPORTING PROCEDURE"
            content={content.section916}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="section916"
            contentType="text"
          />

          {/* Annex 1: ESF RSL Requirements */}
          {renderTableSection(
            'ANNEX 1: ESF RSL REQUIREMENTS',
            'annex1',
            [
              { label: 'SI.No', field: 'siNo', type: 'number' },
              { label: 'Property', field: 'property' },
              { label: 'Test Method', field: 'testMethod' },
              { label: 'Requirement Of ESF Leather', field: 'requirement' }
            ],
            () => ({
              id: Date.now(),
              siNo: content.annex1.length + 1,
              property: '',
              testMethod: '',
              requirement: ''
            })
          )}

          {/* Heavy Metals RSL limits */}
          {renderTableSection(
            'Heavy Metals RSL limits and RSL requirements',
            'heavyMetals',
            [
              { label: 'SI.No', field: 'siNo', type: 'number' },
              { label: 'Property', field: 'property' },
              { label: 'Test Method', field: 'testMethod' },
              { label: 'Requirement Of ESF Leather', field: 'requirement' }
            ],
            () => ({
              id: Date.now(),
              siNo: content.heavyMetals.length + 1,
              property: '',
              testMethod: '',
              requirement: ''
            })
          )}

          {/* Annex 2: Clients' Compliance Register Format */}
          {renderTableSection(
            'ANNEX 2: CLIENTS\' COMPLIANCE REGISTER FORMAT',
            'annex2',
            [
              { label: 'SL.No', field: 'slNo', type: 'number' },
              { label: 'Cus', field: 'cus' },
              { label: 'Date Contacted', field: 'dateContacted' },
              { label: 'Type Of Communication', field: 'typeOfCommunication' },
              { label: 'Date of Response', field: 'dateOfResponse' },
              { label: 'Client Specification Reference Number', field: 'clientSpecRefNo' },
              { label: 'Client Acceptance to Tannery Rsl', field: 'clientAcceptance' },
              { label: 'Next Review Date', field: 'nextReviewDate' },
              { label: 'Review Frequency Number', field: 'reviewFrequency' }
            ],
            () => ({
              id: Date.now(),
              slNo: content.annex2.length + 1,
              cus: '',
              dateContacted: '',
              typeOfCommunication: '',
              dateOfResponse: '',
              clientSpecRefNo: '',
              clientAcceptance: '',
              nextReviewDate: '',
              reviewFrequency: ''
            })
          )}

          {/* Annex 3: Outgoing Leather Testing Register Format */}
          {renderTableSection(
            'ANNEX 3: OUTGOING LEATHER TESTING REGISTER FORMAT',
            'annex3',
            [
              { label: 'SL.NO', field: 'slNo', type: 'number' },
              { label: 'DATE', field: 'date' },
              { label: 'TEST REPORT NO', field: 'testReportNo' },
              { label: 'TEST HOUSE/LAB', field: 'testHouseLab' },
              { label: 'TEST METHOD', field: 'testMethod' },
              { label: 'BATCH REFERENCE NO', field: 'batchRefNo' },
              { label: 'ARTICLE NAME', field: 'articleName' },
              { label: 'TOP 3 ARTICLES', field: 'top3Articles' },
              { label: 'CUSTOMER', field: 'customer' },
              { label: 'RESULT', field: 'result' },
              { label: 'SUBSTANCE FAILED', field: 'substanceFailed' },
              { label: 'SUBSTANCE LIMIT', field: 'substanceLimit' },
              { label: 'ROOT CAUSE IDENTIFIED', field: 'rootCause' },
              { label: 'RE-TESTING', field: 'reTesting' },
              { label: 'REFERENCE NO', field: 'referenceNo' }
            ],
            () => ({
              id: Date.now(),
              slNo: content.annex3.length + 1,
              date: '',
              testReportNo: '',
              testHouseLab: '',
              testMethod: '',
              batchRefNo: '',
              articleName: '',
              top3Articles: '',
              customer: '',
              result: '',
              substanceFailed: '',
              substanceLimit: '',
              rootCause: '',
              reTesting: '',
              referenceNo: ''
            })
          )}

          {/* Annex 4: Chrome VI Testing Register Format */}
          {renderTableSection(
            'ANNEX 4: CHROME VI TESTING REGISTER FORMAT',
            'annex4',
            [
              { label: 'SL.NO', field: 'slNo', type: 'number' },
              { label: 'DATE', field: 'date' },
              { label: 'TEST REPORT NO', field: 'testReportNo' },
              { label: 'TEST HOUSE/LAB', field: 'testHouseLab' },
              { label: 'TEST METHOD', field: 'testMethod' },
              { label: 'BATCH REFERENCE NO', field: 'batchRefNo' },
              { label: 'ARTICLE NAME', field: 'articleName' },
              { label: 'CUSTOMER', field: 'customer' },
              { label: 'RESULT', field: 'result' },
              { label: 'Cr VI LIMIT <3 PPM', field: 'crVILimit' },
              { label: 'AGEING / WITHOUT AGEING', field: 'ageing' },
              { label: 'Cr VI > 3 PPM', field: 'crVIOver3PPM' },
              { label: 'ROOT CAUSE IDENTIFIED', field: 'rootCause' },
              { label: 'RE- TESTING', field: 'reTesting' },
              { label: 'REFERENCE NO', field: 'referenceNo' }
            ],
            () => ({
              id: Date.now(),
              slNo: content.annex4.length + 1,
              date: '',
              testReportNo: '',
              testHouseLab: '',
              testMethod: '',
              batchRefNo: '',
              articleName: '',
              customer: '',
              result: '',
              crVILimit: '',
              ageing: '',
              crVIOver3PPM: '',
              rootCause: '',
              reTesting: '',
              referenceNo: ''
            })
          )}

          {/* Annex 5: RSL Specifications for Incoming Wet Blue Format */}
          {renderTableSection(
            'ANNEX 5: RSL SPECIFICATIONS FOR INCOMING WET BLUE FORMAT',
            'annex5',
            [
              { label: 'Substance Group', field: 'substanceGroup' },
              { label: 'Item No', field: 'itemNo', type: 'number' },
              { label: 'Substance', field: 'substance' },
              { label: 'Test Method', field: 'testMethod' },
              { label: 'Baby Child/PPM', field: 'babyChildPPM' },
              { label: 'Adult PPM', field: 'adultPPM' }
            ],
            () => ({
              id: Date.now(),
              substanceGroup: '',
              itemNo: content.annex5.length + 1,
              substance: '',
              testMethod: '',
              babyChildPPM: '',
              adultPPM: ''
            })
          )}

          {/* Annex 6: RSL Specifications for Incoming Chemicals */}
          {renderTableSection(
            'ANNEX 6: RSL SPECIFICATIONS FOR INCOMING CHEMICALS',
            'annex6',
            [
              { label: 'Substance Group', field: 'substanceGroup' },
              { label: 'Substance', field: 'substance' },
              { label: 'Test Method', field: 'testMethod' },
              { label: 'Baby Child/PPM', field: 'babyChildPPM' },
              { label: 'Adult PPM', field: 'adultPPM' }
            ],
            () => ({
              id: Date.now(),
              substanceGroup: '',
              substance: '',
              testMethod: '',
              babyChildPPM: '',
              adultPPM: ''
            })
          )}

          {/* INCOMING MATERIAL PROCEDURES */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 mt-8">
            <h2 className="text-xl font-bold text-gray-900">INCOMING MATERIAL PROCEDURES</h2>
          </div>

          <EditableSection
            title="9.19 OWN RSL SPECIFICATIONS FOR INCOMING PART PROCESSED LEATHER"
            content={content.section919}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="section919"
            contentType="text"
          />

          <EditableSection
            title="9.20, 9.21 SUPPLIER COMPLIANCE REGISTER FOR INCOMING PART PROCESSED LEATHER"
            content={content.section920}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="section920"
            contentType="text"
          />

          <EditableSection
            title="9.22 PROCEDURE FOR CHEMICAL CHANGES DOCUMENTATION AND RISK ANALYSIS"
            content={content.section922}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="section922"
            contentType="text"
          />

          <EditableSection
            title="9.24, 9.25 CHROME VI FOR INCOMING PART PROCESSED LEATHER & CHEMICALS"
            content={content.section924}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="section924"
            contentType="text"
          />

          <EditableSection
            title="9.26 PROCEDURE FOR ENSURING FAT CONTENT IN WET BLUE LEATHER"
            content={content.section926}
            onSave={handleSaveSection}
            canEdit={isAdmin}
            sectionKey="section926"
            contentType="text"
          />

          {/* Annex 7: Supplier Compliance Register Format */}
          {renderTableSection(
            'ANNEX 7: SUPPLIER COMPLIANCE REGISTER FORMAT',
            'annex7',
            [
              { label: 'SL. No', field: 'slNo', type: 'number' },
              { label: 'Cus', field: 'cus' },
              { label: 'Date Contacted', field: 'dateContacted' },
              { label: 'Type Of Communication', field: 'typeOfCommunication' },
              { label: 'Date of Response', field: 'dateOfResponse' },
              { label: 'Client Specification Reference Number', field: 'clientSpecRefNo' },
              { label: 'Client Acceptance to Tannery Rsl', field: 'clientAcceptance' },
              { label: 'Next Review Date', field: 'nextReviewDate' },
              { label: 'Review Frequency Number', field: 'reviewFrequency' }
            ],
            () => ({
              id: Date.now(),
              slNo: content.annex7.length + 1,
              cus: '',
              dateContacted: '',
              typeOfCommunication: '',
              dateOfResponse: '',
              clientSpecRefNo: '',
              clientAcceptance: '',
              nextReviewDate: '',
              reviewFrequency: ''
            })
          )}
        </div>
      </div>
    </div>
  )
}
