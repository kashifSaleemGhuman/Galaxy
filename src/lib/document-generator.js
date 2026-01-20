/**
 * Document Generator
 * 
 * Generates documents from templates by replacing placeholders with actual values
 */

/**
 * Replace placeholders in template content with field values
 * @param {string} template - Template content with placeholders like {{fieldName}}
 * @param {Object} fieldValues - Object with field values {fieldName: "value"}
 * @param {Object} employee - Employee object for additional context
 * @returns {string} Generated document content
 */
export function generateDocumentContent(template, fieldValues = {}, employee = {}) {
  let content = template

  // Merge employee data with field values (employee data takes precedence)
  const allValues = {
    ...employee,
    ...fieldValues,
    // Format dates
    dateOfJoining: employee.dateOfJoining 
      ? new Date(employee.dateOfJoining).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : '',
    dob: employee.dob
      ? new Date(employee.dob).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : '',
    currentDate: new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    currentYear: new Date().getFullYear()
  }

  // Replace all placeholders {{fieldName}} with values
  content = content.replace(/\{\{(\w+)\}\}/g, (match, fieldName) => {
    const value = allValues[fieldName] || ''
    return String(value)
  })

  // Also support {{fieldName|default}} syntax
  content = content.replace(/\{\{(\w+)\|([^}]+)\}\}/g, (match, fieldName, defaultValue) => {
    const value = allValues[fieldName] || defaultValue
    return String(value)
  })

  return content
}

/**
 * Convert HTML content to PDF using pdf-lib
 * 
 * @param {string} htmlContent - HTML content to convert
 * @param {Object} options - PDF generation options
 * @returns {Promise<Buffer>} PDF buffer
 */
export async function htmlToPdf(htmlContent, options = {}) {
  try {
    const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib')
    
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create()
    
    // A4 dimensions in points (1 inch = 72 points)
    const pageWidth = 595.28  // A4 width
    const pageHeight = 841.89 // A4 height
    const margin = 72 // 1 inch margin
    const contentWidth = pageWidth - (margin * 2)
    const contentHeight = pageHeight - (margin * 2)
    
    // Add a page
    let page = pdfDoc.addPage([pageWidth, pageHeight])
    let yPosition = pageHeight - margin
    const lineHeight = 14
    const paragraphSpacing = 8
    
    // Parse HTML and extract text content
    const textContent = extractTextFromHTML(htmlContent)
    const lines = textContent.split('\n').filter(line => line.trim())
    
    // Embed fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const helveticaObliqueFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)
    
    // Process lines and add to PDF
    for (const line of lines) {
      let trimmedLine = line.trim()
      if (!trimmedLine) {
        yPosition -= paragraphSpacing
        continue
      }
      
      // Check if we need a new page
      if (yPosition < margin + lineHeight) {
        page = pdfDoc.addPage([pageWidth, pageHeight])
        yPosition = pageHeight - margin
      }
      
      // Determine font based on line content
      let font = helveticaFont
      let fontSize = 12
      
      // Handle special markers from HTML parsing
      if (trimmedLine.startsWith('[HEADING1]')) {
        font = helveticaBoldFont
        fontSize = 20
        trimmedLine = trimmedLine.replace(/\[HEADING1\]|\/HEADING1\]/g, '').trim()
        yPosition -= 8 // Extra spacing for headings
      } else if (trimmedLine.startsWith('[HEADING2]')) {
        font = helveticaBoldFont
        fontSize = 18
        trimmedLine = trimmedLine.replace(/\[HEADING2\]|\/HEADING2\]/g, '').trim()
        yPosition -= 6
      } else if (trimmedLine.startsWith('[HEADING3]')) {
        font = helveticaBoldFont
        fontSize = 16
        trimmedLine = trimmedLine.replace(/\[HEADING3\]|\/HEADING3\]/g, '').trim()
        yPosition -= 4
      } else if (trimmedLine.includes('[TABLE_START]') || trimmedLine.includes('[TABLE_END]')) {
        // Skip table markers, they're handled by structure
        continue
      } else if (trimmedLine.includes('[ROW_START]') || trimmedLine.includes('[ROW_END]')) {
        // Table row separator
        yPosition -= lineHeight
        continue
      } else if (trimmedLine.startsWith('[HEADER]')) {
        font = helveticaBoldFont
        fontSize = 12
        trimmedLine = trimmedLine.replace(/\[HEADER\]|\/HEADER\]/g, '').trim()
      } else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
        font = helveticaBoldFont
        fontSize = 12
        trimmedLine = trimmedLine.replace(/\*\*/g, '').trim()
      } else if (trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length < 50 && trimmedLine.length > 3) {
        // All caps short lines are likely headings
        font = helveticaBoldFont
        fontSize = 14
        yPosition -= 4
      }
      
      // Wrap text if needed
      const wrappedLines = wrapText(trimmedLine, contentWidth, font, fontSize)
      
      for (const wrappedLine of wrappedLines) {
        if (yPosition < margin + lineHeight) {
          page = pdfDoc.addPage([pageWidth, pageHeight])
          yPosition = pageHeight - margin
        }
        
        page.drawText(wrappedLine, {
          x: margin,
          y: yPosition,
          size: fontSize,
          font: font,
          color: rgb(0, 0, 0),
        })
        
        yPosition -= lineHeight
      }
      
      yPosition -= paragraphSpacing
    }
    
    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save()
    
    return Buffer.from(pdfBytes)
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error(`PDF generation failed: ${error.message}`)
  }
}

/**
 * Extract text content from HTML with better formatting
 * @param {string} html - HTML content
 * @returns {string} Plain text content with structure preserved
 */
function extractTextFromHTML(html) {
  // Remove script and style tags
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  
  // Handle tables - preserve structure
  text = text.replace(/<table[^>]*>/gi, '\n[TABLE_START]\n')
  text = text.replace(/<\/table>/gi, '\n[TABLE_END]\n')
  text = text.replace(/<tr[^>]*>/gi, '\n[ROW_START]')
  text = text.replace(/<\/tr>/gi, '[ROW_END]\n')
  text = text.replace(/<th[^>]*>/gi, '[HEADER]')
  text = text.replace(/<\/th>/gi, '[/HEADER] | ')
  text = text.replace(/<td[^>]*>/gi, '')
  text = text.replace(/<\/td>/gi, ' | ')
  
  // Handle headings
  text = text.replace(/<h1[^>]*>/gi, '\n\n[HEADING1]')
  text = text.replace(/<\/h1>/gi, '[/HEADING1]\n\n')
  text = text.replace(/<h2[^>]*>/gi, '\n\n[HEADING2]')
  text = text.replace(/<\/h2>/gi, '[/HEADING2]\n\n')
  text = text.replace(/<h3[^>]*>/gi, '\n\n[HEADING3]')
  text = text.replace(/<\/h3>/gi, '[/HEADING3]\n\n')
  
  // Handle paragraphs and divs
  text = text.replace(/<\/p>/gi, '\n\n')
  text = text.replace(/<p[^>]*>/gi, '')
  text = text.replace(/<\/div>/gi, '\n')
  text = text.replace(/<div[^>]*>/gi, '')
  
  // Handle line breaks
  text = text.replace(/<br\s*\/?>/gi, '\n')
  text = text.replace(/<hr[^>]*>/gi, '\n---\n')
  
  // Handle strong and bold
  text = text.replace(/<(strong|b)[^>]*>/gi, '**')
  text = text.replace(/<\/(strong|b)>/gi, '**')
  
  // Handle emphasis and italic
  text = text.replace(/<(em|i)[^>]*>/gi, '_')
  text = text.replace(/<\/(em|i)>/gi, '_')
  
  // Remove all remaining HTML tags
  text = text.replace(/<[^>]+>/g, '')
  
  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ')
  text = text.replace(/&amp;/g, '&')
  text = text.replace(/&lt;/g, '<')
  text = text.replace(/&gt;/g, '>')
  text = text.replace(/&quot;/g, '"')
  text = text.replace(/&#39;/g, "'")
  text = text.replace(/&apos;/g, "'")
  text = text.replace(/&copy;/g, '©')
  text = text.replace(/&reg;/g, '®')
  text = text.replace(/&trade;/g, '™')
  
  // Clean up whitespace
  text = text.replace(/\n\s*\n\s*\n+/g, '\n\n')
  text = text.replace(/[ \t]+/g, ' ')
  text = text.replace(/\|\s*\|\s*\|/g, '|') // Clean up empty table cells
  
  return text.trim()
}

/**
 * Wrap text to fit within width
 * @param {string} text - Text to wrap
 * @param {number} maxWidth - Maximum width in points
 * @param {any} font - PDF font object
 * @param {number} fontSize - Font size
 * @returns {string[]} Array of wrapped lines
 */
function wrapText(text, maxWidth, font, fontSize) {
  // Handle table rows (text with | separators)
  if (text.includes('|') && !text.startsWith('[')) {
    // For tables, try to keep cells on same line if possible
    const cells = text.split('|').map(c => c.trim()).filter(c => c)
    if (cells.length > 1) {
      // Check if entire row fits
      const rowWidth = font.widthOfTextAtSize(text, fontSize)
      if (rowWidth <= maxWidth) {
        return [text]
      }
      
      // If row is too wide, try to wrap individual cells
      const cellWidth = maxWidth / cells.length
      const wrappedCells = []
      let needsWrapping = false
      
      for (const cell of cells) {
        const cellTextWidth = font.widthOfTextAtSize(cell, fontSize)
        if (cellTextWidth > cellWidth) {
          // Wrap this cell
          const wrapped = wrapText(cell, cellWidth, font, fontSize)
          wrappedCells.push(...wrapped)
          needsWrapping = true
        } else {
          wrappedCells.push(cell)
        }
      }
      
      if (needsWrapping) {
        // Return cells separated, caller will handle layout
        return wrappedCells
      }
    }
  }
  
  // Regular text wrapping
  const words = text.split(' ')
  const lines = []
  let currentLine = ''
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    // Approximate width calculation
    const width = font.widthOfTextAtSize(testLine, fontSize)
    
    if (width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }
  
  if (currentLine) {
    lines.push(currentLine)
  }
  
  return lines.length > 0 ? lines : [text]
}

/**
 * Get available template fields from employee data
 * @param {Object} employee - Employee object
 * @returns {Object} Available fields
 */
export function getEmployeeFields(employee) {
  return {
    employeeId: employee.employeeId || '',
    employeeName: employee.name || '',
    name: employee.name || '',
    designation: employee.designation || '',
    department: employee.department || '',
    dateOfJoining: employee.dateOfJoining || '',
    dob: employee.dob || '',
    address: employee.address || '',
    contactNumber: employee.contactNumber || '',
    email: employee.user?.email || '',
    salary: employee.salary ? employee.salary.toString() : '',
    gender: employee.gender || '',
    parentName: employee.parentName || '',
    idCardNumber: employee.idCardNumber || '',
    shift: employee.shift || '',
    process: employee.process || '',
    lastEmployment: employee.lastEmployment || '',
    currentDate: new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    currentYear: new Date().getFullYear()
  }
}

