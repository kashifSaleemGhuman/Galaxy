'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { Input } from '@/components/ui/Input'

export default function ChemicalRiskAssessmentPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [documentInfo, setDocumentInfo] = useState(null)

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN' || session?.user?.role === 'super_admin' || session?.user?.role === 'admin'

  // Initialize content structure
  const initializeContent = () => {
    return {
      preparedBy: 'ESF LEATHER CONSULTANCY - QUALIFIED PERSON',
      documentId: 'ESF-HS-RKA-01',
      date: '20/01/2023',
      generalSafetyRules: [
        'Never eat or drink anything near chemical products.',
        'Do not drink, smell, taste chemical products, and do not put them in containers with special features other than their original packaging.',
        'Never mix chlorinated and acidic products with each other.',
        'When working with chemicals, protective masks, glasses, gloves, aprons, etc. Use designated personal protective equipment.',
        'It should not be forgotten that all chemical products affect the skin negatively.',
        'Be sure to comply with the storage rules.'
      ],
      chemicalProducts: [
        {
          id: 1,
          productDescription: 'ACIDS - SULPHURIC & FORMIC',
          requiredPPE: 'Hand Protection: Use protective gloves specially produced for chemicals. Do not reuse dirty gloves for other tasks. Eye Protection: During the use of the product, it is necessary to use safety glasses due to the risk of splashing.',
          riskDefinitions: '*When exposed to heat and fire, the pressure will rise and the container may burst. *As a result of decomposition, carbon dioxide and carbon monoxide decompose. * Causes burns. * It irritates the skin.',
          firstAidMeasures: 'IF IN CONTACT WITH THE EYES: If you have contact lenses, remove them immediately. Immediately flush eyes with copious amounts of water for at least 10 minutes until clear. IF IN CONTACT WITH SKIN: Immediately wash the skin thoroughly with water. Thoroughly wash contaminated clothing. If symptoms worsen, consult a doctor. IF SWALLOWED: DO NOT vomit! Rinse your mouth thoroughly. Never give anything by mouth to an unconscious person. If conscious, give small amount of water. Get medical help. IF INHALED: Take the patient to fresh air. If the patient loses consciousness, move to the side position. Do not give mouth-to-mouth respiration (artificial respiration) provide oxygen.',
          fire: 'Suitable fire extinguishers: *Water in fog. *Foam, *KKT **Never use pressurized water!',
          handlingAndStorage: 'General protection and hygiene measures: * Keep away from foodstuffs, drinks. * Immediately remove contaminated clothing. * Immediately remove contaminated clothing. * Do not eat or drink any food while using this product. Storage conditions: Keep away from heat, sparks and open flame. Make sure the work area is well ventilated. It should be stored in a cool, dry place away from sources of ignition and direct sunlight.',
          accidentalReleaseMeasures: 'Cleaning method: Absorb with liquid-binding substances (sand, earth, diatomite, general binders, sawdust).',
          disposalInformation: 'Residual waste/unused products: It should not be disposed of together with household waste. Do not allow the product to reach the sewer system. Empty packaging Proposal: Dispose of in accordance with local regulations. Suitable cleaning agent: Clean with water, if necessary with cleaning agent.'
        },
        {
          id: 2,
          productDescription: 'PRESERVATIVE',
          requiredPPE: 'Protection: Chemical protective gloves and masks should be used.',
          riskDefinitions: '*Irritating to eyes, causing serious eye damage. *Suspected of damaging fertility and the unborn child.',
          firstAidMeasures: 'IN CONTACT WITH SKIN: Immediately wash the skin thoroughly with water. If symptoms worsen, consult a doctor. IF IN CONTACT WITH THE EYES: Flush eyes with plenty of water for 10 minutes with eyelids open. If symptoms worsen, seek medical advice. IF INHALED: Take the patient to fresh air. If patient loses consciousness, place in a stable side position for transport. Do not give mouth-to-mouth respiration (artificial respiration) provide oxygen. If the complaint persists, consult a doctor immediately. Keep under medical supervision for 48 hours. IF SWALLOWED: Rinse the patient\'s mouth with plenty of clean water. Do not induce vomiting. If vomiting occurs, keep the head to the right so that it does not enter the lungs.',
          fire: 'Suitable fire extinguishers: *Water in fog. *Foam, *KKT **Never use pressurized water!',
          handlingAndStorage: 'General protection and hygiene measures: Avoid contact with eyes. Keep away from food and drink. Remove contaminated clothing immediately. Avoid contact with eyes and skin. Do not eat or drink anything while using this product. Storage conditions: It should be stored in its original packaging, dry and at room temperature.',
          accidentalReleaseMeasures: 'Cleaning method: Absorb with liquid binders (sand, diatomite, general binders, sawdust).',
          disposalInformation: 'Residual waste/unused products: Do not dispose of together with household waste. Do not allow undiluted product to reach the sewer system. Empty packaging Proposal: Dispose of in accordance with official regulations. Suitable cleaning agent: Clean with water, if necessary with cleaning agent.'
        },
        {
          id: 3,
          productDescription: 'DYE STUFFS',
          requiredPPE: 'Protection: Chemical protective gloves and masks should be used.',
          riskDefinitions: '* Irritating to eyes and skin. *Can cause serious eye damage. *As a result of decomposition, carbon dioxide, carbon monoxide and nitrogen oxides decompose.',
          firstAidMeasures: 'IF INHALED: The exposed person should be taken to the open air. Provide oxygen if breathing is irregular or airways are obstructed. The exposed person should be kept under surveillance for 48 hours IF SWALLOWED: Mouth should be rinsed immediately, DO NOT induce vomiting. A doctor should be consulted immediately. A small amount of water may be given if the exposed person is conscious and is not vomiting. IN CASE OF SKIN CONTACT: The contact area should be washed with water. Washing should be continued with pressurized water for at least 10 minutes. IF IN CONTACT WITH THE EYES:Rinse the eye with copious amounts of water by lifting the eyelid. Continue washing for at least 10 minutes. Get medical help right away.',
          fire: 'Suitable fire extinguishers: *Water in fog. *Foam, *KKT **Never use pressurized water!',
          handlingAndStorage: 'General protection and hygiene measures: Avoid contact with eyes. Keep away from food and drink. Remove contaminated clothing immediately. Avoid contact with eyes and skin. Do not eat or drink anything while using this product.Storage conditions: Keep away from heat, sparks and open flame. Make sure the work area is well ventilated. It should be stored in a cool, dry place away from sources of ignition and direct sunlight.',
          accidentalReleaseMeasures: 'Cleaning method: Absorb with liquid binders such as sand, diatomite, general binders and sawdust.',
          disposalInformation: 'Residual waste/unused products: Do not dispose of together with household waste. Do not allow undiluted product to reach the sewer system.Empty packaging Proposal: Dispose of in accordance with official regulations. Suitable cleaning agent: Clean with water, if necessary with cleaning agent.'
        },
        {
          id: 4,
          productDescription: 'WATER BASED PIGMENT DISPERSION',
          requiredPPE: 'Protection: Chemical protective gloves and masks should be used.',
          riskDefinitions: '*Causes serious eye damage. * In a fire or heated, the pressure will rise and the container may burst. * When decomposition occurs, carbon dioxide, carbon monoxide and nitrogen oxides are formed.',
          firstAidMeasures: 'IN CONTACT WITH SKIN: Immediately wash the skin thoroughly with water. If symptoms worsen, consult a doctor. IF IN CONTACT WITH THE EYES: Flush eyes with plenty of water for several minutes with the eyelids open. If symptoms worsen, seek medical advice. IF INHALED: Take the patient to fresh air. If patient loses consciousness, place in a stable side position for transport. If the complaint persists, consult a doctor immediately. IF SWALLOWED: Rinse the patient\'s mouth with plenty of clean water and seek medical attention.',
          fire: 'Suitable fire extinguishers: *Water in fog. *Foam, *KKT **Never use pressurized water!',
          handlingAndStorage: 'General protection and hygiene measures: * Keep away from food and drink. *Remove contaminated clothing immediately. *Wash your hands when taking a break from work and at the end of work. *Avoid contact with eyes and skin. Storage conditions: Store in its original packaging. It must be protected from sunlight. It should be used in well ventilated environments. It should be protected against the danger of freezing. Storage temperature: 5-35 degrees Celsius.',
          accidentalReleaseMeasures: 'Cleaning method: Absorb with liquid-binding substances (sand, earth, diatomite, general binders, sawdust).',
          disposalInformation: 'Residual waste/unused products: Avoid mixing with surface waters and sewers. * It should not be disposed of with household waste.Empty packaging Proposal: Dispose of in accordance with official regulations. Suitable cleaning agent: Clean with water, if necessary with cleaning agent.'
        },
        {
          id: 5,
          productDescription: 'FAT LIQUORS',
          requiredPPE: 'Protection: Chemical protective gloves and masks should be used.',
          riskDefinitions: '*Causes serious eye damage. * In a fire or heated, the pressure will rise and the container may burst. * When decomposition occurs, carbon dioxide, carbon monoxide and nitrogen oxides are formed.',
          firstAidMeasures: 'IN CONTACT WITH SKIN: Immediately wash the skin thoroughly with water. If symptoms worsen, consult a doctor. IF IN CONTACT WITH THE EYES: Flush eyes with plenty of water for several minutes with the eyelids open. If symptoms worsen, seek medical advice. IF INHALED: Take the patient to fresh air. If patient loses consciousness, place in a stable side position for transport. If the complaint persists, consult a doctor immediately. IF SWALLOWED: Rinse the patient\'s mouth with plenty of clean water and seek medical attention.',
          fire: 'Suitable fire extinguishers: *Water in fog. *Foam, *KKT **Never use pressurized water!',
          handlingAndStorage: 'General protection and hygiene measures: * Keep away from food and drink. *Remove contaminated clothing immediately. *Wash your hands when taking a break from work and at the end of work. *Avoid contact with eyes and skin. Storage conditions: Store in its original packaging. It must be protected from sunlight. It should be used in well ventilated environments. It should be protected against the danger of freezing. Storage temperature: 5-35 degrees Celsius.',
          accidentalReleaseMeasures: 'Cleaning method: Absorb with liquid-binding substances (sand, earth, diatomite, general binders, sawdust).',
          disposalInformation: 'Residual waste/unused products: Avoid mixing with surface waters and sewers. * It should not be disposed of with household waste.Empty packaging Proposal: Dispose of in accordance with official regulations. Suitable cleaning agent: Clean with water, if necessary with cleaning agent.'
        },
        {
          id: 6,
          productDescription: 'SYNTANS',
          requiredPPE: 'Hand Protection: Use protective gloves specially produced for chemicals. Do not reuse dirty gloves for other tasks. Eye Protection: During the use of the product, it is necessary to use safety glasses due to the risk of splashing. Use the appropriate mask.',
          riskDefinitions: '*As a result of decomposition, carbon dioxide and carbon monoxide decompose.',
          firstAidMeasures: 'IF IN CONTACT WITH THE EYES: If you have contact lenses, remove them immediately. Immediately flush eyes with copious amounts of water until clear. IF IN CONTACT WITH SKIN: Immediately wash the skin thoroughly with water. Thoroughly wash contaminated clothing. If symptoms worsen, consult a doctor. IF SWALLOWED: DO NOT vomit! Rinse your mouth thoroughly. Never give anything by mouth to an unconscious person. If conscious, give small amount of water. Get medical help. IF INHALED: Take the patient to fresh air. If the patient loses consciousness, move to the side position. Get medical help.',
          fire: 'Suitable fire extinguishers: *Water in fog. *Foam, *KKT **Never use pressurized water!',
          handlingAndStorage: 'General protection and hygiene measures: * Keep away from foodstuffs, drinks. * Immediately remove contaminated clothing. * Immediately remove contaminated clothing. * Do not eat or drink any food while using this product. Storage conditions: Keep separate from oxidizing agents. Keep away from heat, sparks and open flame. Make sure the work area is well ventilated. It should be stored in a cool, dry place away from sources of ignition and direct sunlight.',
          accidentalReleaseMeasures: 'Cleaning method: Prevent it from entering the sewer.',
          disposalInformation: 'Residual waste/unused products: It should not be disposed of together with household waste. Do not allow the product to reach the sewer system. Empty packaging Proposal: Dispose of in accordance with local regulations. Suitable cleaning agent: Clean with water, if necessary with cleaning agent.'
        },
        {
          id: 7,
          productDescription: 'WETTING AGENT',
          requiredPPE: 'Protection: Chemical protective gloves, goggles and mask should be used.',
          riskDefinitions: '*As a result of decomposition, carbon dioxide, carbon monoxide and nitrogen oxides decompose.',
          firstAidMeasures: 'IN CONTACT WITH SKIN: Immediately wash the skin thoroughly with water. If symptoms worsen, consult a doctor. IF IN CONTACT WITH THE EYES: Flush eyes with plenty of water for 10 minutes with eyelids open. If symptoms worsen, seek medical advice. IF INHALED: Take the patient to fresh air. If patient loses consciousness, place in a stable side position for transport. Do not give mouth-to-mouth respiration (artificial respiration) provide oxygen. If the complaint persists, consult a doctor immediately. Keep under medical supervision for 48 hours. IF SWALLOWED: Rinse the patient\'s mouth with plenty of clean water. Do not induce vomiting. If vomiting occurs, keep the head to the right so that it does not enter the lungs.',
          fire: 'Suitable fire extinguishers: *Water in fog. *Foam, *KKT **Never use pressurized water!',
          handlingAndStorage: 'General protection and hygiene measures: Avoid contact with eyes. Keep away from food and drink. Remove contaminated clothing immediately. Avoid contact with eyes and skin. Do not eat or drink anything while using this product. Storage conditions:It should be stored in its original packaging, dry and at room temperature.',
          accidentalReleaseMeasures: 'Cleaning method: Absorb with liquid binders (sand, diatomite, general binders, sawdust).',
          disposalInformation: 'Residual waste/unused products: Do not dispose of together with household waste. Do not allow the product to reach the sewer system.Empty packaging Proposal: Dispose of in accordance with official regulations. Suitable cleaning agent: Clean with water, if necessary with cleaning agent.'
        },
        {
          id: 8,
          productDescription: 'VEG EXTRACT',
          requiredPPE: 'Protection: Chemical protective gloves, goggles and mask should be used.',
          riskDefinitions: 'Contains easily flammable liquid and vapor. * Harmful if inhaled. * Causes skin irritation. * Causes serious eye irritation. * May cause irritation to the respiratory tract.',
          firstAidMeasures: 'IF INHALED: The exposed person should be taken to the open air. Provide oxygen if breathing is irregular or airways are obstructed. The exposed person should be kept under surveillance for 48 hours. IF SWALLOWED: Mouth should be rinsed immediately, DO NOT induce vomiting. A doctor should be consulted immediately. A small amount of water may be given if the exposed person is conscious and is not vomiting. IN CASE OF SKIN CONTACT: The contact area should be washed with water. Washing should be continued with pressurized water for at least 10 minutes. IF IN CONTACT WITH THE EYES: Rinse the eye with copious amounts of water by lifting the eyelid. Continue washing for at least 10 minutes. Get medical help right away.',
          fire: 'Suitable fire extinguishers: *Water in fog. *Foam, *KKT **Never use pressurized water!',
          handlingAndStorage: 'General protection and hygiene measures: Avoid contact with eyes. Keep away from food and drink. Remove contaminated clothing immediately. Avoid contact with eyes and skin. Do not eat or drink anything while using this product.Storage conditions: Keep away from heat, sparks and open flame. Make sure the work area is well ventilated. It should be stored in a cool, dry place away from sources of ignition and direct sunlight.',
          accidentalReleaseMeasures: 'Cleaning method: Absorb with liquid binders such as sand, diatomite, general binders and sawdust.',
          disposalInformation: 'Residual waste/unused products: Do not dispose of together with household waste. Do not allow undiluted product to reach the sewer system.Empty packaging Proposal: Dispose of in accordance with official regulations. Suitable cleaning agent: Clean with water, if necessary with cleaning agent.'
        },
        {
          id: 9,
          productDescription: 'AUXILERIES',
          requiredPPE: 'Hand Protection: Use protective gloves. Do not breathe the vapour, Eye Protection:It is recommended to use safety glasses during use of the product due to the risk of splashing. It should be worked with the appropriate mask.',
          riskDefinitions: '* Contains flammable liquid and vapour, * Causes serious eye irritation. * May cause drowsiness and dizziness. * Irritating to eyes. * Causes skin irritation. * In case of decomposition, carbon dioxide, carbon monoxide, nitrogen oxide, sulfur oxide and metal oxides are formed. * Hazardous reactions may occur if storage conditions are not observed.',
          firstAidMeasures: 'IN CONTACT WITH SKIN: Immediately wash the skin thoroughly with water. If symptoms worsen, consult a doctor. IF IN CONTACT WITH THE EYES:Flush eyes with plenty of water for 10 minutes with eyelids open. If symptoms worsen, seek medical advice. IF INHALED: Take the patient to fresh air. If patient loses consciousness, place in a stable side position for transport. If the complaint persists, consult a doctor immediately. IF SWALLOWED: Rinse the patient\'s mouth with plenty of clean water and seek medical attention.',
          fire: 'Suitable fire extinguishers: *Water in fog. *Foam, *KKT **Never use pressurized water!',
          handlingAndStorage: 'General protection and hygiene measures: Keep away from food and drink. Remove contaminated clothing immediately. Avoid contact with eyes and skin. Do not eat or drink anything while using this product. Storage conditions: Store in its original packaging. It must be protected from sunlight. It should be used in well ventilated environments. It should be protected against the danger of freezing. Storage temperature: 5-35 degrees Celsius.',
          accidentalReleaseMeasures: 'Cleaning method: * Clean with dry sand or similar inert material. *Keep away from sparks, fire, heat sources.',
          disposalInformation: 'Residual waste/unused products:Dispose of in accordance with official regulations. Empty packaging Proposal:Dispose of in accordance with official regulations. Suitable cleaning agent: If necessary, the water should be cleaned together with the cleaning agent.'
        },
        {
          id: 10,
          productDescription: 'PENETRATOR',
          requiredPPE: 'Hand Protection: Use protective gloves specially produced for chemicals, Do not reuse dirty gloves for other tasks. Eye Protection: During the use of the product, it is necessary to use safety glasses due to the risk of splashing.',
          riskDefinitions: 'Contains flammable liquid and vapour. Irritating to eyes. *',
          firstAidMeasures: 'IF INHALED: Move the patient to fresh air. If patient loses consciousness, place in a stable side position for transport. If the complaint persists, consult a doctor immediately. In case of inhalation of decomposed products in fire, the exposed person should be kept under surveillance for 48 hours. IN CONTACT WITH SKIN: Immediately wash the skin thoroughly with water. Thoroughly wash contaminated clothing. If symptoms worsen, consult a doctor. EYE CONTACT: If you have contact lenses, remove them immediately. Flush eyes with plenty of water for several minutes with eyelids open. If symptoms worsen, seek medical advice.IF SWALLOWED: Rinse the patient\'s mouth with clean water and, if conscious, give a small amount of water, seek medical attention immediately.',
          fire: 'Suitable fire extinguishers: *Water in fog. *Foam, *KKT **Never use pressurized water!',
          handlingAndStorage: 'General protection and hygiene measures: Keep away from food and drink. Remove contaminated clothing immediately. Avoid contact with eyes and skin. Do not eat or drink anything while using this product. Storage conditions: *Keep away from sparks, fire, heat sources. * Protect against the danger of freezing. * Store in original containers.',
          accidentalReleaseMeasures: 'Cleaning method: *Clean up with dry sand, earth or similar inert material. *Keep away from sparks, fire, heat sources.',
          disposalInformation: 'Residual waste/unused products: * Avoid mixing with surface waters and sewers. * It should not be disposed of with household waste. Empty packaging Proposal:Dispose of in accordance with official regulations. Suitable cleaning agent: If necessary, the water should be cleaned together with the cleaning agent.'
        },
        {
          id: 11,
          productDescription: 'CASEIN',
          requiredPPE: 'Hand Protection: Use protective gloves specially produced for chemicals. Do not reuse dirty gloves for other tasks. Eye Protection:During the use of the product, it is necessary to use safety glasses due to the risk of splashing.',
          riskDefinitions: '*Contains chlorocresol, May cause an allergic reaction. *Formulate in closed or ventilated mixing vessels.',
          firstAidMeasures: 'IF INHALED: Move the patient to fresh air. If patient loses consciousness, place in a stable side position for transport. If the complaint persists, consult a doctor immediately. In case of inhalation of decomposed products in fire, the exposed person should be kept under surveillance for 48 hours. IN CONTACT WITH SKIN:Immediately wash the skin thoroughly with water. Thoroughly wash contaminated clothing. If symptoms worsen, consult a doctor. EYE CONTACT: If you have contact lenses, remove them immediately. Flush eyes with plenty of water for several minutes with eyelids open. If symptoms worsen, seek medical advice. IF SWALLOWED: Rinse the patient\'s mouth with clean water and, if conscious, give a small amount of water, seek medical attention immediately.',
          fire: 'Suitable fire extinguishers: *Water in fog. Carbon dioxide, KKT. Storage conditions: *Keep away from sparks, fire, heat sources. *Protect against the danger of freezing. *Store in original containers.',
          handlingAndStorage: 'General protection and hygiene measures: Keep away from food and drink. Remove contaminated clothing immediately. Avoid contact with eyes and skin. Do not eat or drink anything while using this product.',
          accidentalReleaseMeasures: 'Cleaning method: *Clean up with dry sand, earth or similar inert material. *Keep away from sparks, fire, heat sources, sewers. It should not be disposed of with household waste.',
          disposalInformation: 'Residual waste/unused products: *Avoid mixing with surface waters and sewers. It should not be disposed of with household waste. Empty packaging Proposal:Dispose of in accordance with official regulations. Suitable cleaning agent: If necessary, the water should be cleaned together with the cleaning agent.'
        },
        {
          id: 12,
          productDescription: 'COMPACT BINDER',
          requiredPPE: 'Hand Protection: Use protective gloves specially produced for chemicals. Do not reuse dirty gloves for other tasks. Eye Protection: During the use of the product, it is necessary to use safety glasses due to the risk of splashing.',
          riskDefinitions: 'Do not expose to heat and fire. Irritating to skin and eyes.',
          firstAidMeasures: 'IF IN CONTACT WITH THE EYES: If you have contact lenses, remove them immediately. Immediately flush eyes with copious amounts of water for at least 10 minutes until clear. IF IN CONTACT WITH SKIN: Immediately wash the skin thoroughly with water. Thoroughly wash contaminated clothing. If symptoms worsen, consult a doctor. IF SWALLOWED: DO NOT vomit! Rinse your mouth thoroughly. Never give anything by mouth to an unconscious person. Get medical help. IF INHALED: Take the patient to fresh air. If the patient loses consciousness, move to the side position. Provide oxygen.',
          fire: 'Suitable fire extinguishers: *Water in fog. *Foam, KKT. **Never use pressurized water! The water jet is only used to cool the outer surface of pressure vessels exposed to fire. Storage conditions: *Keep away from heat, sparks and open flame. Make sure the work area is well ventilated. It should be stored in a cool, dry place from sources of ignition and direct sunlight.',
          handlingAndStorage: 'General protection and hygiene measures: Keep away from foodstuffs, drinks. Immediately remove contaminated clothing. Do not eat or drink any food while using this product.',
          accidentalReleaseMeasures: 'Cleaning method: Absorb with liquid-binding substances (sand, earth, diatomite... general binders, sawdust).',
          disposalInformation: 'Residual waste/unused products: It should not be disposed of together with household waste. Do not allow the product to reach the sewer system. Empty packaging Proposal: Dispose of in accordance with local regulations. Suitable cleaning agent: Clean with water, if necessary with cleaning agent.'
        },
        {
          id: 13,
          productDescription: 'LACQUER',
          requiredPPE: 'Protection: Chemical protective gloves, goggles and mask should be used.',
          riskDefinitions: 'Irritating to eyes, causing serious eye damage. Do not expose to heat and fire.',
          firstAidMeasures: 'IN CONTACT WITH SKIN: Immediately wash the skin thoroughly with water. If symptoms worsen, consult a doctor. IF IN CONTACT WITH THE EYES: Rinse carefully with water for a few minutes. Immediately call the NATIONAL POISON ADVICE CENTER PHONE 114 or the doctor. IF INHALED:Take the patient to fresh air. If patient loses consciousness, place in a stable side position for transport. Do not give mouth-to-mouth respiration (artificial respiration) provide oxygen. If the complaint persists, consult a doctor immediately. IF SWALLOWED: Rinse the patient\'s mouth with plenty of clean water. Do not induce vomiting. If vomiting occurs, keep the head to the right so that it does not enter the lungs.',
          fire: 'Suitable fire extinguishers: *Water in fog. *Carbon dioxide, KKT **Never use pressurized water! Storage conditions: It should be stored in its original packaging, dry and at room temperature.',
          handlingAndStorage: 'General protection and hygiene measures: Avoid contact with eyes. Keep away from food and drink. Remove contaminated clothing immediately. Avoid contact with eyes and skin. Do not eat or drink anything while using this product.',
          accidentalReleaseMeasures: 'Cleaning method: Absorb with liquid binders (sand, diatomite, general binders, sawdust).',
          disposalInformation: 'Residual waste/unused products: Do not dispose of together with household waste. Do not allow undiluted product to reach the sewer system. Empty packaging Proposal: Dispose of in accordance with official regulations. Suitable cleaning agent: Clean with water, if necessary with cleaning agent.'
        },
        {
          id: 14,
          productDescription: 'BINDER',
          requiredPPE: 'Hand Protection: Use protective gloves. Do not breathe the vapour. Eye Protection:It is recommended to use safety glasses during use of the product due to the risk of splashing.',
          riskDefinitions: 'Contains 1,2-benzisothiazol-3(2H)-one, May cause allergic reactions. In a fire or heated, the pressure will rise and the container may burst. Due to its long-lasting effects, this substance is harmful to aquatic life.',
          firstAidMeasures: 'IF INHALED: Move the patient to fresh air. If patient loses consciousness, place in a stable side position for transport. If the complaint persists, consult a doctor immediately. IN CONTACT WITH SKIN: Immediately wash the skin thoroughly with water. Thoroughly wash contaminated clothing. If symptoms worsen, consult a doctor.',
          fire: 'Suitable fire extinguishers: *Water in fog. *Foam, *KKI',
          handlingAndStorage: 'General protection and hygiene measures: Keep away from food and drink. Remove contaminated clothing immediately. Avoid contact with eyes and skin. Do not eat or drink anything while using this product. Storage conditions: *Keep away from sparks, fire, heat sources. Protect against the danger of freezing. Store in original containers.',
          accidentalReleaseMeasures: 'Cleaning method: * If there is no risk, stop the leak. Move containers from spill area. Dilute with water and wipe if soluble in water. Alternatively, or if water soluble, absorb in an inert dry material and place in a suitable waste disposal container.',
          disposalInformation: 'Residual waste/unused products:Dispose of in accordance with official regulations. Empty packaging Proposal:Dispose of in accordance with official regulations. Suitable cleaning agent: If necessary, the water should be cleaned together with the cleaning agent. Firefighting water contaminated with this substance must be collected and prevented from entering any waterway, sewer or drain.'
        },
        {
          id: 15,
          productDescription: 'WAX',
          requiredPPE: 'Protection: Chemical protective gloves, goggles and mask should be used.',
          riskDefinitions: 'Irritating to skin and breathing. There is a risk of eye damage. May cause allergy in contact with skin.',
          firstAidMeasures: 'IF IN CONTACT WITH THE EYES: Rinse, remove contact lenses, seek medical help for chemical burns. IF SWALLOWED: Seek medical help, rinse mouth, remove dentures, fresh air, comfortable position, small amount of water if conscious, do not induce vomiting. IN CONTACT WITH SKIN: Wash thoroughly, consult doctor if symptoms worsen. IF IN CONTACT WITH THE EYES: Flush with water, seek medical help. IF INHALED: Move to fresh air, stable side position if unconscious, oxygen if not breathing, 48-hour surveillance. IF SWALLOWED: Rinse mouth with clean water, seek medical help.',
          fire: 'Store in original containers protected from direct sunlight, in a dry, cool and well-ventilated area, away from incompatible materials, foodstuffs and beverages. Eliminate all ignition sources. Keep separate from oxidizing agents. Do not store in unlabeled containers. Keep under shade.',
          handlingAndStorage: 'Keep away from food and drink. Remove contaminated clothing immediately. Wash your hands when taking a break from work and at the end of work. Avoid contact with eyes and skin. Storage conditions: Store in its original packaging. It must be protected from sunlight. It should be used in well ventilated environments. It should be protected against the danger of freezing. Storage temperature: 5-35 degrees Celsius.',
          accidentalReleaseMeasures: 'Absorb with liquid-binding substances (sand, earth, diatomite, general binders, sawdust).',
          disposalInformation: 'Empty packaging Proposal: Dispose of in accordance with official regulations. Suitable cleaning agent: surround and collect with non-combustible absorbent materials such as sand, earth, vermiculite, diatomaceous earth. Residual waste/unused products: Avoid mixing with surface waters and sewers. It should not be disposed of with household waste. Empty packaging Proposal: Dispose of in accordance with official regulations. Suitable cleaning agent: Clean with water, if necessary with cleaning agent.'
        },
        {
          id: 16,
          productDescription: 'FEEL MODIFIERS',
          requiredPPE: 'Protection: Chemical protective gloves, goggles and mask should be used.',
          riskDefinitions: 'Causes serious eye and respiratory damage. Keep away from heat, hot surfaces, sparks, open flames and other sources of ignition.',
          firstAidMeasures: 'IN CONTACT WITH SKIN: Wash skin immediately with water. Immediately remove contaminated clothing. If symptoms worsen, seek medical advice. IN CONTACT WITH THE EYES: Flush eyes with plenty of water for several minutes with the eyelids open. If symptoms worsen, seek medical advice. IF INHALED: Take the patient to fresh air. If patient loses consciousness, place in a stable side position for transport. Do not give mouth-to-mouth respiration (artificial respiration) provide oxygen. If the complaint persists, consult a doctor immediately. IF SWALLOWED: Rinse the patient\'s mouth with plenty of clean water and seek medical attention.',
          fire: 'CO2, extinguishing powder, foam or spray water.',
          handlingAndStorage: 'General protection and hygiene measures: Keep away from food and drink. *Remove contaminated clothing immediately. *Wash your hands when taking a break from work and at the end of work. *Avoid contact with eyes and skin. Storage conditions: Store in its original packaging. It should be protected from sunlight. It should be used in well ventilated environments. It should be protected against the danger of freezing. Storage temperature: 5-20 degrees Celsius.',
          accidentalReleaseMeasures: 'Absorb with liquid-binding substances (sand, earth, diatomite, general binders, sawdust).',
          disposalInformation: 'Residual waste/unused products: Avoid mixing with surface waters and sewers. It should not be disposed of with household waste. Empty packaging Proposal: Dispose of in accordance with official regulations. Suitable cleaning agent: Clean with water, if necessary with cleaning agent.'
        },
        {
          id: 17,
          productDescription: 'SOLVENT BASED FEEL MODIFIER',
          requiredPPE: 'Hand Protection: Use protective gloves. Do not breathe the vapour, Eye Protection:Use safety glasses during use of the product due to the risk of splashing. Chemical protective gloves, goggles and mask should be used.',
          riskDefinitions: '*Keep away from heat, hot surfaces, sparks, open flames and other sources of ignition. Flammable liquid and vapour, in a fire of when heated, the pressure rises and then the container may rupture, risking an explosion. May cause respiratory irritation. May cause drowsiness and dizziness. Decomposition products may include the following substances: - carbon dioxide - carbon monoxide - nitrogen oxides - metal oxide/oxides. Irritating to skin and breathing. There is a risk of eye damage.',
          firstAidMeasures: 'IF INHALED: Take the patient to fresh air. If patient loses consciousness, place in a stable side position for transport. Do not give mouth-to-mouth respiration (artificial respiration) provide oxygen. If the complaint persists, consult a doctor immediately. IN CONTACT WITH SKIN: Immediately wash the skin thoroughly with water. If symptoms worsen, consult a doctor. IF IN CONTACT WITH THE EYES: Flush eyes with plenty of water for several minutes with the eyelids open. If symptoms worsen, seek medical advice. IF SWALLOWED: Rinse the patient\'s mouth with plenty of clean water and seek medical attention. IN CONTACT WITH SKIN: Immedi wash the skin thoroughly with water. If symptoms worsen consult a doctor.',
          fire: '*Water in fog. *Carbon dioxide, *KKT, *Foam **Never use pressurized water!',
          handlingAndStorage: 'General protection and hygiene measures: Keep away from food and drink. Remove contaminated clothing immediately. Avoid contact with eyes and skin. Do not eat or drink anything while using this product. Storage conditions:Store in original containers protected from direct sunlight, in a dry, cool and well-ventilated area, away from incompatible materials, foodstuffs and beverages. * Eliminate all ignition sources. Keep separate from oxidizing agents. * Do not store in unlabeled containers. * Keep under shade.',
          accidentalReleaseMeasures: 'If there is no risk, stop the leak. Move containers from spill area. Dilute with water and wipe if soluble in water. Alternatively, or if water soluble, absorb in an inert dry material and place in a suitable waste disposal container.',
          disposalInformation: 'Residual waste/unused products:Dispose of in accordance with official regulations. Empty packaging Proposal: Dispose of in accordance with official regulations. Suitable cleaning agent:surround and collect with non-combustible absorbent materials such as sand, earth, vermiculite, diatomaceous earth'
        },
        {
          id: 18,
          productDescription: 'METAL COMPLEX DYES',
          requiredPPE: 'Hand Protection: Use protective gloves. Do not breathe the vapour Eye Protection: Use safety glasses during use of the product due to the risk of splashing.',
          riskDefinitions: 'Keep away from heat, hot surfaces, sparks, open flames and other sources of ignition. Flammable liquid and vapour, In a fire or when heated, the pressure rises and then the container may rupture, risking an explosion. May cause respiratory irritation. May cause drowsiness and dizziness.',
          firstAidMeasures: 'IF IN CONTACT WITH THE EYES: If you have contact lenses, remove them immediately. Flush eyes with plenty of water for at least 10 minutes with eyelids open. If symptoms worsen, seek medical advice. IF SWALLOWED: Rinse the patient\'s mouth with clean water. If the substance has been swallowed and the exposed person is not unconscious, give a small amount of water. Do not induce vomiting. Seek immediate medical attention. IN CONTACT WITH SKIN: Immediately wash the skin thoroughly with water symptoms worsen, consult a doctor. IF IN CONTACT WITH THE EYES: Flush eyes with plenty of water for several minutes with the eyelids open. If symptoms worsen, seek medical advice. IF INHALED: Take the patient to fresh air. If patient loses consciousness, place in a stable side position for transport. If the complaint persists, consult a doctor immediately. IF SWALLOWED: Rinse the patient\'s mouth with plenty of clean water and seek medical attention.',
          fire: 'Suitable fire extinguishers: *Water in fog. *Carbon dioxide, *KKT, *Foam **Never use pressurized water!',
          handlingAndStorage: 'Storage conditions: *Store in original containers protected from direct sunlight, in a dry, cool and well-ventilated area, away from incompatible materials, foodstuffs and beverages. *Eliminate all ignition sources. *Keep separate from oxidizing agents. *Do not store in unlabeled containers. *Keep under shade. *Mix before use. Keep away from food and drink. Remove contaminated clothing immediately. Avoid contact with eyes and skin. Do not eat or drink anything while using this product.',
          accidentalReleaseMeasures: 'If there is no risk, stop the leak. Move containers from spill area. Dilute with water and wipe if soluble in water. Alternatively, or if water soluble, absorb in an inert dry material and place in a suitable waste disposal container.',
          disposalInformation: 'Empty packaging Proposal: Dispose of in accordance with official regulations. Suitable cleaning agent: surround and collect with non-combustible absorbent materials such as sand, earth, vermiculite, diatomaceous earth. Residual waste/unused products: Dispose of in accordance with official regulations.'
        },
        {
          id: 19,
          productDescription: 'SOLVENT BASED lacquer',
          requiredPPE: 'Hand Protection: Use protective gloves. Do not breathe the vapour, Eye Protection: Use safety glasses during use of the product due to the risk of splashing.',
          firstAidMeasures: 'IF INHALED: Take the patient to fresh air. If patient loses consciousness, place in a stable side position for transport. If the complaint persists, consult a doctor immediately. IN CONTACT WITH SKIN: Wash skin immediately with water. Immediately remove contaminated clothing. If symptoms worsen, seek medical advice.',
          riskDefinitions: 'Keep away from heat, hot surfaces, sparks, open flames and other sources of ignition. Flammable liquid and vapour, In a fire or when heated, the pressure rises and then the container may rupture, risking an explosion. May cause respiratory irritation. May cause drowsiness and dizziness.',
          fire: 'Water in fog. Carbon dioxide, KKT. Never use pressurized water!',
          handlingAndStorage: 'Keep away from food and drink. Remove contaminated clothing immediately. Avoid contact with eyes and skin. Do not eat or drink anything while using this product.',
          accidentalReleaseMeasures: 'If there is no risk, stop the leak. Move containers from spill area. Dilute with water and wipe if soluble in water. Alternatively, or if water soluble, absorb in an inert dry material and place in a suitable waste disposal container.',
          disposalInformation: 'Dispose of in accordance with official regulations.'
        },
        {
          id: 20,
          productDescription: 'WATER BASED POLYURETHANE',
          requiredPPE: 'Hand Protection: Use protective gloves. Do not breathe the vapour. Eye Protection: recommended to use safety glasses during use of the product due to the risk of splashing.',
          riskDefinitions: '*Decomposition products may include the following substances: - carbon dioxide - carbon monoxide - nitrogen oxides - sulfur oxides *In a fire or if heated, a pressure increase will occur and the container may burst.',
          firstAidMeasures: 'IF INHALED: Take the patient to fresh air. If patient loses consciousness, place in a stable side position for transport. Do not give mouth-to-mouth respiration (artificial respiration) provide oxygen. If the complaint persists, consult a doctor immediately. IN CONTACT WITH SKIN: Wash skin immediately with water. Immediately remove contaminated clothing. If symptoms worsen, seek medical advice.',
          fire: 'Suitable fire extinguishers: *Water in fog. *Carbon dioxide, *SIST',
          handlingAndStorage: 'Storage conditions: *Keep away from sparks, fire, heat sources. *Protect against the danger of freezing.',
          accidentalReleaseMeasures: 'If there is no risk, stop the leak. Move containers from spill area. Absorb with an inert dry material and place in a suitable waste disposal container.',
          disposalInformation: 'Dispose of in accordance with official regulations. Empty packaging Proposal: Dispose of in accordance with official regulations.'
        },
        {
          id: 21,
          productDescription: 'PIGMENTS',
          requiredPPE: 'Protection: Chemical protective gloves, goggles and mask should be used.',
          riskDefinitions: 'Causes serious damage. In a fire or heated, the pressure will rise and there container may burst. When decomposition occurs, carbon dioxide, carbon monoxide and nitrogen oxides are formed.',
          firstAidMeasures: 'IF IN CONTACT WITH THE EYES: If you have contact lenses, remove them immediately. Flush eyes with plenty of water for at least 10 minutes with eyelids open. If symptoms worsen, seek medical advice. IF SWALLOWED: Rinse the patient\'s mouth with clean water. If the substance has been swallowed and the exposed person is not unconscious, give a small amount of water. Do not induce vomiting. Seek immediate medical attention. IN CONTACT WITH SKIN: Immediately wash the skin thoroughly with water symptoms worsen, consult a doctor. IF IN CONTACT WITH THE EYES: Flush eyes with plenty of water for several minutes with the eyelids open. If symptoms worsen, seek medical advice. IF INHALED: Take the patient to fresh air. If patient loses consciousness, place in a stable side position for transport. If the complaint persists, consult a doctor immediately. IF SWALLOWED: Rinse the patient\'s mouth with plenty of clean water and seek medical attention.',
          fire: 'Water in fog. Foam, KKT. Carbon dioxide.',
          handlingAndStorage: 'Keep away from food and drink. Remove contaminated clothing immediately. Wash your hands when taking a break from work and at the end of work. Avoid void contact with eyes and skin. Storage conditions: Store in its original packaging. It must be protected from sunlight. It should be used in well ventilated environments. It should be protected against the danger of freezing. Storage temperature: 5-35 degrees Celsius.',
          accidentalReleaseMeasures: 'Absorb with liquid-binding substances (sand, earth, diatomite, general binders, sawdust).',
          disposalInformation: 'Avoid mixing with surface waters and sewers. It should not be disposed of with household waste. Empty packaging Proposal: Dispose of in accordance with official regulations. Suitable cleaning agent: Clean with water, if necessary with cleaning agent.'
        },
        {
          id: 22,
          productDescription: 'OIL',
          requiredPPE: 'Protection: Chemical protective gloves, goggles and mask should be used.',
          riskDefinitions: 'Causes serious eye damage. * In a fire or heated, the pressure will rise and the container may burst. * When decomposition occurs, carbon dioxide, carbon monoxide and nitrogen oxides are formed.',
          firstAidMeasures: 'IN CONTACT WITH SKIN: Immed wash the skin thoroughly with water. If symptoms worsen, consult a doctor. IF IN CONTACT WITH THE EYES: Flush eyes with plenty of water for several minutes with the eyelids open. If symptoms worsen, seek medical advice. IF INHALED: Take the patient to fresh air. If patient loses consciousness, place in a stable side position for transport. If the complaint persists, consult a doctor immediately. IF SWALLOWED: Rinse the patient\'s mouth with plenty of clean water and seek medical attention.',
          fire: 'Suitable fire extinguishers: Water in fog. Foam, KKT, Carbon dioxide.',
          handlingAndStorage: 'General protection and hygiene measures: Keep away from food and drink. Remove contaminated clothing immediately. Wash your hands when taking a break from work and at the end of work. Avoid contact with eyes and skin. Storage conditions: Store in its original packaging. It must be protected from sunlight. It should be used in well ventilated environments. It should be protected against the danger of freezing. Storage temperature: 5-35 degrees Celsius.',
          accidentalReleaseMeasures: 'Cleaning method: Absorb with liquid-binding substances (sand, earth, diatomite, general binders, sawdust).',
          disposalInformation: 'Residual waste/unused products: Avoid mixing with surface waters and sewers. It should not be disposed of with household waste. Empty packaging Proposal: Dispose of in accordance with official regulations. Suitable cleaning agent: Clean with water, if necessary with cleaning agent.'
        },
        {
          id: 23,
          productDescription: 'SOLVENT BASED OIL',
          requiredPPE: 'Protection: Chemical protective gloves, goggles and mask should be used.',
          riskDefinitions: 'Causes serious eye damage. * In a fire or heated, the pressure will rise and the container may burst. * When decomposition occurs, carbon dioxide, carbon monoxide and nitrogen oxides are formed.',
          firstAidMeasures: 'IN CONTACT WITH SKIN: Immed wash the skin thoroughly with water. If symptoms worsen, consult a doctor. IF IN CONTACT WITH THE EYES: Flush eyes with plenty of water for several minutes with the eyelids open. If symptoms worsen, seek medical advice. IF INHALED: Take the patient to fresh air. If patient loses consciousness, place in a stable side position for transport. If the complaint persists, consult a doctor immediately. IF SWALLOWED: Rinse the patient\'s mouth with plenty of clean water and seek medical attention.',
          fire: 'Suitable fire extinguishers: Water in fog. Foam, KKT, Carbon dioxide.',
          handlingAndStorage: 'General protection and hygiene measures: Keep away from food and drink. Remove contaminated clothing immediately. Wash your hands when taking a break from work and at the end of work. Avoid contact with eyes and skin. Storage conditions: Store in its original packaging. It must be protected from sunlight. It should be used in well ventilated environments. It should be protected against the danger of freezing. Storage temperature: 5-35 degrees Celsius.',
          accidentalReleaseMeasures: 'Cleaning method: Absorb with liquid-binding substances (sand, earth, diatomite, general binders, sawdust).',
          disposalInformation: 'Residual waste/unused products: Avoid mixing with surface waters and sewers. It should not be disposed of with household waste. Empty packaging Proposal: Dispose of in accordance with official regulations. Suitable cleaning agent: Clean with water, if necessary with cleaning agent.'
        }
      ]
    }
  }

  // Chemical Risk Assessment Data Structure
  const [content, setContent] = useState(initializeContent())

  useEffect(() => {
    fetchDocumentContent()
  }, [])

  const fetchDocumentContent = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/organization/documents/content?documentName=CHEMICAL RISK ASSESSMENT')
      const data = await res.json()
      
      if (res.ok) {
        if (data.data?.content) {
          const loadedData = data.data.content.content || content
          // Ensure structure exists
          if (!loadedData.chemicalProducts) {
            loadedData.chemicalProducts = initializeContent().chemicalProducts
          }
          if (!loadedData.generalSafetyRules) {
            loadedData.generalSafetyRules = initializeContent().generalSafetyRules
          }
          setContent(loadedData)
          setDocumentInfo({
            docNo: data.data.document.docNo || 'ESF-HS-RKA-01',
            revDate: data.data.document.revDate || '',
            revisionNo: data.data.content.revisionNo,
            revisionDate: data.data.content.revisionDate
          })
        } else {
          setDocumentInfo({
            docNo: 'ESF-HS-RKA-01',
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

  const handleProductChange = (productId, field, value) => {
    setContent(prev => ({
      ...prev,
      chemicalProducts: prev.chemicalProducts.map(product =>
        product.id === productId
          ? { ...product, [field]: value }
          : product
      )
    }))
  }

  const handleAddProduct = () => {
    const newProduct = {
      id: Date.now(),
      productDescription: '',
      requiredPPE: '',
      riskDefinitions: '',
      firstAidMeasures: '',
      fire: '',
      handlingAndStorage: '',
      accidentalReleaseMeasures: '',
      disposalInformation: ''
    }
    setContent(prev => ({
      ...prev,
      chemicalProducts: [...prev.chemicalProducts, newProduct]
    }))
  }

  const handleDeleteProduct = (productId) => {
    if (content.chemicalProducts.length <= 1) {
      alert('At least one product is required')
      return
    }
    setContent(prev => ({
      ...prev,
      chemicalProducts: prev.chemicalProducts.filter(p => p.id !== productId)
    }))
  }

  const handleSafetyRuleChange = (index, value) => {
    setContent(prev => ({
      ...prev,
      generalSafetyRules: prev.generalSafetyRules.map((rule, i) => i === index ? value : rule)
    }))
  }

  const handleAddSafetyRule = () => {
    setContent(prev => ({
      ...prev,
      generalSafetyRules: [...prev.generalSafetyRules, '']
    }))
  }

  const handleDeleteSafetyRule = (index) => {
    if (content.generalSafetyRules.length <= 1) {
      alert('At least one safety rule is required')
      return
    }
    setContent(prev => ({
      ...prev,
      generalSafetyRules: prev.generalSafetyRules.filter((_, i) => i !== index)
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
          documentName: 'CHEMICAL RISK ASSESSMENT',
          content: content,
          changeDescription: 'Updated Chemical Risk Assessment'
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

      setToast({ type: 'success', message: 'Chemical Risk Assessment saved successfully. Revision number incremented.' })
    } catch (error) {
      console.error('Error saving assessment:', error)
      setToast({ type: 'error', message: 'Failed to save changes. Please try again.' })
    }
  }

  const breadcrumbs = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'organization', label: 'Organization', href: '/dashboard/organization' },
    { key: 'documents', label: 'Document Details', href: '/dashboard/organization/documents' },
    { key: 'chemical-risk-assessment', label: 'Chemical Risk Assessment', href: '#' }
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
              CHEMICAL RISK ASSESSMENT
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
          {/* Save Button and Controls */}
          {isAdmin && (
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handleAddProduct}
                className="px-4"
              >
                + Add Chemical Product
              </Button>
              <Button
                onClick={handleSaveAll}
                className="px-6"
              >
                Save All Changes
              </Button>
            </div>
          )}

          {/* Chemical Products Table */}
          <div className="relative w-full">
            <div className="w-full overflow-x-auto overflow-y-visible scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200" style={{ maxWidth: '100%', scrollbarWidth: 'thin' }}>
              <div className="border border-gray-300 rounded-md inline-block min-w-full">
                <table className="min-w-full" style={{ minWidth: 'max-content', tableLayout: 'auto' }}>
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700 sticky left-0 bg-gray-100 z-10 min-w-[200px]">
                        PRODUCT DESCRIPTION
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700 min-w-[250px]">
                        REQUIRED PPE
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700 min-w-[250px]">
                        (R) RISK DEFINITIONS
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700 min-w-[300px]">
                        FIRST AID MEASURES
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700 min-w-[200px]">
                        FIRE
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700 min-w-[300px]">
                        HANDLING and STORAGE
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700 min-w-[250px]">
                        ACCIDENTAL RELEASE MEASURES
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700 min-w-[250px]">
                        DISPOSAL INFORMATION
                      </th>
                      {isAdmin && (
                        <th className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700 min-w-[100px] sticky right-0 bg-gray-100 z-10">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {content.chemicalProducts?.map((product, index) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 sticky left-0 z-10 min-w-[200px]">
                          {isAdmin ? (
                            <Input
                              type="text"
                              value={product.productDescription}
                              onChange={(e) => handleProductChange(product.id, 'productDescription', e.target.value)}
                              className="w-full text-sm font-medium"
                              placeholder="Product name"
                            />
                          ) : (
                            <span>{product.productDescription || '-'}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 min-w-[250px]">
                          {isAdmin ? (
                            <textarea
                              value={product.requiredPPE}
                              onChange={(e) => handleProductChange(product.id, 'requiredPPE', e.target.value)}
                              className="w-full text-sm rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows={4}
                              placeholder="Required PPE information"
                            />
                          ) : (
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{product.requiredPPE || '-'}</p>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 min-w-[250px]">
                          {isAdmin ? (
                            <textarea
                              value={product.riskDefinitions}
                              onChange={(e) => handleProductChange(product.id, 'riskDefinitions', e.target.value)}
                              className="w-full text-sm rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows={4}
                              placeholder="Risk definitions"
                            />
                          ) : (
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{product.riskDefinitions || '-'}</p>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 min-w-[300px]">
                          {isAdmin ? (
                            <textarea
                              value={product.firstAidMeasures}
                              onChange={(e) => handleProductChange(product.id, 'firstAidMeasures', e.target.value)}
                              className="w-full text-sm rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows={6}
                              placeholder="First aid measures"
                            />
                          ) : (
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{product.firstAidMeasures || '-'}</p>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 min-w-[200px]">
                          {isAdmin ? (
                            <textarea
                              value={product.fire}
                              onChange={(e) => handleProductChange(product.id, 'fire', e.target.value)}
                              className="w-full text-sm rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows={3}
                              placeholder="Fire extinguisher information"
                            />
                          ) : (
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{product.fire || '-'}</p>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 min-w-[300px]">
                          {isAdmin ? (
                            <textarea
                              value={product.handlingAndStorage}
                              onChange={(e) => handleProductChange(product.id, 'handlingAndStorage', e.target.value)}
                              className="w-full text-sm rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows={6}
                              placeholder="Handling and storage information"
                            />
                          ) : (
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{product.handlingAndStorage || '-'}</p>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 min-w-[250px]">
                          {isAdmin ? (
                            <textarea
                              value={product.accidentalReleaseMeasures}
                              onChange={(e) => handleProductChange(product.id, 'accidentalReleaseMeasures', e.target.value)}
                              className="w-full text-sm rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows={4}
                              placeholder="Accidental release measures"
                            />
                          ) : (
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{product.accidentalReleaseMeasures || '-'}</p>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 min-w-[250px]">
                          {isAdmin ? (
                            <textarea
                              value={product.disposalInformation}
                              onChange={(e) => handleProductChange(product.id, 'disposalInformation', e.target.value)}
                              className="w-full text-sm rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows={4}
                              placeholder="Disposal information"
                            />
                          ) : (
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{product.disposalInformation || '-'}</p>
                          )}
                        </td>
                        {isAdmin && (
                          <td className="border border-gray-300 px-2 py-2 text-center sticky right-0 bg-white z-10 min-w-[100px]">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id)}
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
            {content.chemicalProducts && content.chemicalProducts.length > 0 && (
              <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow-sm">
                Scroll horizontally to see all columns →
              </div>
            )}
          </div>

          {/* General Safety Rules Section */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">General Safety Rules</h3>
              {isAdmin && (
                <Button
                  variant="outline"
                  onClick={handleAddSafetyRule}
                  className="px-4"
                >
                  + Add Safety Rule
                </Button>
              )}
            </div>
            <div className="space-y-3">
              {content.generalSafetyRules?.map((rule, index) => (
                <div key={index} className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mt-1">
                    <span className="text-red-600 font-bold">!</span>
                  </div>
                  {isAdmin ? (
                    <div className="flex-1 flex items-center gap-2">
                      <Input
                        type="text"
                        value={rule}
                        onChange={(e) => handleSafetyRuleChange(index, e.target.value)}
                        className="flex-1"
                        placeholder="Enter safety rule"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSafetyRule(index)}
                        className="text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100"
                      >
                        ×
                      </Button>
                    </div>
                  ) : (
                    <p className="flex-1 text-sm text-gray-700">{rule}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

