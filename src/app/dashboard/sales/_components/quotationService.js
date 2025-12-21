import api from '@/lib/api/service';

export const quotationService = {
  // Create new quotation
  async createQuotation(data) {
    return await api.post('/api/sales/quotations', data);
  },

  // Get all quotations
  async getQuotations(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.customer) params.append('customer', filters.customer);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    return await api.get(`/api/sales/quotations?${params.toString()}`);
  },

  // Get single quotation
  async getQuotation(id) {
    return await api.get(`/api/sales/quotations/${id}`);
  },

  // Update quotation
  async updateQuotation(id, data) {
    return await api.put(`/api/sales/quotations/${id}`, data);
  },

  // Submit quotation for approval
  async submitForApproval(id) {
    return await api.post(`/api/sales/quotations/${id}/submit`);
  },

  // Approve/reject quotation
  async approveQuotation(id, action, comments) {
    return await api.post(`/api/sales/quotations/${id}/approve`, {
      action,
      comments
    });
  },

  // Send quotation to customer
  async sendQuotation(id) {
    return await api.post(`/api/sales/quotations/${id}/send`);
  },

  // Get my quotations (for sales users)
  async getMyQuotations(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.limit) params.append('limit', filters.limit);
    
    return await api.get(`/api/sales/quotations/my-quotations?${params.toString()}`);
  },

  // Get pending approvals (for managers)
  async getPendingApprovals(filters = {}) {
    const params = new URLSearchParams();
    params.append('status', 'pending');
    if (filters.limit) params.append('limit', filters.limit);
    
    return await api.get(`/api/sales/quotations/approvals?${params.toString()}`);
  }
};

export default quotationService;

