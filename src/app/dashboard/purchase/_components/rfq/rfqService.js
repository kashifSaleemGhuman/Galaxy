// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock email template for vendor
const generateVendorEmail = (rfq) => {
  const formatProductDetails = (product) => {
    let details = `- ${product.name}: ${product.quantity} ${product.unit}`;
    
    // Add custom attributes if available
    if (product.attributes && typeof product.attributes === 'object') {
      const attributeEntries = Object.entries(product.attributes);
      if (attributeEntries.length > 0) {
        const attrStrings = attributeEntries.map(([key, value]) => `${key}: ${value || 'N/A'}`);
        details += `\n  Specifications: ${attrStrings.join(', ')}`;
      }
    }
    
    // Add traceability questions if available
    if (Array.isArray(product.traceabilityQuestions) && product.traceabilityQuestions.length > 0) {
      const questions = product.traceabilityQuestions.map(q => q.prompt).join(', ');
      details += `\n  Please provide: ${questions}`;
    }
    
    return details;
  };

  return `
Dear ${rfq.vendor},

We are requesting quotations for the following items:

${(rfq.products || rfq.items || []).map(product => 
  formatProductDetails(product)
).join('\n\n')}

Please provide your best quote by: ${new Date(rfq.orderDeadline).toLocaleDateString()}

Best regards,
Procurement Team
`;
};

export const rfqService = {
  // Send RFQ to vendor
  async sendToVendor(rfq) {
    try {
      // Simulate API call delay
      await delay(1500);

      // Simulate email sending
      const emailContent = generateVendorEmail(rfq);
      console.log('Sending email to vendor:', emailContent);

      // In a real implementation, this would be an API call
      // return await fetch('/api/rfq/send', { method: 'POST', body: JSON.stringify(rfq) });
      
      // For now, just return a success response
      return {
        success: true,
        message: 'RFQ sent successfully',
        data: {
          ...rfq,
          sentDate: new Date().toISOString(),
          emailSent: true,
          emailContent
        }
      };
    } catch (error) {
      console.error('Error sending RFQ:', error);
      throw new Error('Failed to send RFQ to vendor');
    }
  },

  // Generate vendor portal link
  async generateVendorPortalLink(rfq) {
    try {
      await delay(500);
      
      // In real implementation, this would:
      // 1. Generate a secure unique token
      // 2. Create a time-limited access link
      // 3. Send email to vendor with the link
      
      const portalLink = `https://vendor.yourcompany.com/quote/${rfq.id}?token=sample-token`;
      
      return {
        success: true,
        message: 'Vendor portal link generated and sent',
        data: {
          portalLink,
          emailSent: true,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
      };
    } catch (error) {
      console.error('Error generating vendor portal link:', error);
      throw new Error('Failed to generate vendor portal link');
    }
  },

  // Record vendor quote (manual entry)
  async recordQuote(rfq, quoteDetails, isPortalSubmission = false) {
    try {
      await delay(1000);
      
      // Additional validation for portal submissions
      if (isPortalSubmission) {
        // Verify token, check expiry, etc.
        await delay(500); // Simulate token verification
      }

      // In real implementation:
      // 1. Validate quote details
      // 2. Store in database
      // 3. Send notifications
      // 4. Update audit trail
      
      return {
        success: true,
        message: 'Quote recorded successfully',
        data: {
          ...rfq,
          quoteReceivedDate: new Date().toISOString(),
          vendorQuote: quoteDetails,
          submissionMethod: isPortalSubmission ? 'vendor_portal' : 'manual_entry',
          submissionDate: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error recording quote:', error);
      throw new Error('Failed to record vendor quote');
    }
  },

  // Accept quote
  async acceptQuote(rfq) {
    try {
      await delay(1000);
      
      return {
        success: true,
        message: 'Quote accepted successfully',
        data: {
          ...rfq,
          acceptedDate: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error accepting quote:', error);
      throw new Error('Failed to accept quote');
    }
  },

  // Reject quote
  async rejectQuote(rfq, reason) {
    try {
      await delay(1000);
      
      return {
        success: true,
        message: 'Quote rejected successfully',
        data: {
          ...rfq,
          rejectedDate: new Date().toISOString(),
          rejectionReason: reason
        }
      };
    } catch (error) {
      console.error('Error rejecting quote:', error);
      throw new Error('Failed to reject quote');
    }
  }
};
