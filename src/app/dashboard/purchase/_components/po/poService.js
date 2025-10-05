// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const poService = {
  // Generate PO from RFQ
  async generatePO(rfq) {
    try {
      await delay(1000);
      
      // Generate PO number
      const poNumber = `PO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
      
      return {
        success: true,
        message: 'Purchase Order generated successfully',
        data: {
          poNumber,
          rfqId: rfq.id,
          vendor: rfq.vendor,
          vendorId: rfq.vendorId,
          orderDate: new Date().toISOString(),
          expectedDeliveryDate: rfq.vendorQuote.expectedDeliveryDate,
          items: rfq.products.map(product => {
            const unitPrice = parseFloat(rfq.vendorQuote.vendorPrice) || 0;
            return {
              ...product,
              unitPrice,
              total: unitPrice * parseInt(product.quantity)
            };
          }),
          totalAmount: rfq.products.reduce((sum, product) => {
            const unitPrice = parseFloat(rfq.vendorQuote.vendorPrice) || 0;
            return sum + (unitPrice * parseInt(product.quantity));
          }, 0),
          terms: rfq.vendorQuote.vendorNotes || 'Standard terms and conditions apply',
          status: 'draft'
        }
      };
    } catch (error) {
      console.error('Error generating PO:', error);
      throw new Error('Failed to generate Purchase Order');
    }
  },

  // Send PO to vendor
  async sendToVendor(po) {
    try {
      await delay(1500);
      
      // In real implementation:
      // 1. Generate PDF
      // 2. Send email to vendor
      // 3. Store communication history
      // 4. Update PO status
      
      return {
        success: true,
        message: 'Purchase Order sent to vendor successfully',
        data: {
          ...po,
          status: 'sent',
          sentDate: new Date().toISOString(),
          emailSent: true
        }
      };
    } catch (error) {
      console.error('Error sending PO:', error);
      throw new Error('Failed to send Purchase Order to vendor');
    }
  },

  // Record vendor confirmation
  async recordVendorConfirmation(po, confirmationDetails) {
    try {
      await delay(1000);
      
      return {
        success: true,
        message: 'Vendor confirmation recorded successfully',
        data: {
          ...po,
          status: 'confirmed',
          confirmationDate: new Date().toISOString(),
          confirmationDetails
        }
      };
    } catch (error) {
      console.error('Error recording vendor confirmation:', error);
      throw new Error('Failed to record vendor confirmation');
    }
  },

  // Update PO status
  async updateStatus(po, newStatus, details = {}) {
    try {
      await delay(1000);
      
      return {
        success: true,
        message: 'Purchase Order status updated successfully',
        data: {
          ...po,
          status: newStatus,
          statusUpdateDate: new Date().toISOString(),
          ...details
        }
      };
    } catch (error) {
      console.error('Error updating PO status:', error);
      throw new Error('Failed to update Purchase Order status');
    }
  }
};
