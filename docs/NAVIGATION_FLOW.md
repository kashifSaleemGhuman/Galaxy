# Updated Navigation Flow Documentation

## Overview

The purchase module now uses a polling-first approach where users start at a polling page and are automatically redirected to appropriate dashboard pages based on their role and pending tasks.

## Navigation Flow

### 🏠 **Entry Point**
- **URL**: `/dashboard/purchase`
- **Action**: Automatically redirects to `/dashboard/purchase/polling`
- **Purpose**: Central entry point that routes to polling

### 📡 **Polling Page** (`/dashboard/purchase/polling`)
- **Purpose**: Smart polling page that detects user role and monitors for pending tasks
- **Manager**: Monitors for pending RFQ approvals
- **User**: Monitors for pending RFQs
- **Auto-redirect**: When pending tasks are found

### 👨‍💼 **Manager Flow**

#### **1. Polling → Approvals**
- **Trigger**: When pending RFQ approvals are found
- **Redirect**: `/dashboard/purchase/approvals`
- **Purpose**: Handle RFQ approvals and rejections

#### **2. Polling → Manager Dashboard**
- **Manual**: Click "Go to Manager Dashboard"
- **Redirect**: `/dashboard/purchase/manager-dashboard`
- **Purpose**: Manager overview and tools

### 👤 **User Flow**

#### **1. Polling → User Dashboard**
- **Trigger**: When user has pending RFQs
- **Redirect**: `/dashboard/purchase/user-dashboard`
- **Purpose**: User RFQ management interface

#### **2. Polling → RFQ Creation**
- **Manual**: Click "Create New RFQ"
- **Redirect**: `/dashboard/purchase` (main RFQ interface)
- **Purpose**: Create and manage RFQs

## Page Structure

### **📡 Polling Page** (`/dashboard/purchase/polling`)
```javascript
// Smart role detection
const isManager = ['super_admin', 'admin', 'purchase_manager'].includes(session?.user?.role);

// Manager: Monitors for pending approvals
// User: Monitors for pending RFQs
```

### **👨‍💼 Manager Dashboard** (`/dashboard/purchase/manager-dashboard`)
- **Purpose**: Manager-specific overview
- **Features**: Quick actions, statistics, manager tools
- **Navigation**: Back to polling, approvals, all RFQs

### **👤 User Dashboard** (`/dashboard/purchase/user-dashboard`)
- **Purpose**: User-specific overview
- **Features**: My RFQs status, quick actions, user tools
- **Navigation**: Back to polling, create RFQ, view all RFQs

### **✅ Approvals Page** (`/dashboard/purchase/approvals`)
- **Purpose**: Handle RFQ approvals
- **Features**: Pending approvals list, approve/reject actions
- **Auto-redirect**: Back to polling when complete

## Auto-Redirect Logic

### **Manager Redirects**
```javascript
// Check for pending approvals
const approvalsData = await api.get('/api/rfqs/approvals', { status: 'pending' });
if (approvalsData.rfqs.length > 0) {
  router.push('/dashboard/purchase/approvals');
}
```

### **User Redirects**
```javascript
// Check for pending RFQs
const userRfqs = allRfqs.filter(rfq => rfq.createdById === session?.user?.id);
const pendingRfqs = userRfqs.filter(rfq => ['sent', 'received'].includes(rfq.status));
if (pendingRfqs.length > 0) {
  router.push('/dashboard/purchase/user-dashboard');
}
```

## Complete User Journey

### **🔄 Manager Journey**
1. **Start**: Click "Purchase" → Redirects to polling page
2. **Monitor**: Polling page monitors for pending approvals
3. **Redirect**: When approvals needed → Redirect to approvals page
4. **Action**: Approve/reject RFQs
5. **Complete**: When done → Redirect back to polling page
6. **Dashboard**: Manual access to manager dashboard

### **🔄 User Journey**
1. **Start**: Click "Purchase" → Redirects to polling page
2. **Monitor**: Polling page monitors for pending RFQs
3. **Redirect**: When RFQs need attention → Redirect to user dashboard
4. **Action**: Manage RFQs (create, view, update)
5. **Complete**: When no pending RFQs → Redirect back to polling page
6. **Creation**: Manual access to RFQ creation

## Navigation URLs

| Page | URL | Purpose |
|------|-----|---------|
| **Entry Point** | `/dashboard/purchase` | Redirects to polling |
| **Smart Polling** | `/dashboard/purchase/polling` | Main polling page |
| **Manager Dashboard** | `/dashboard/purchase/manager-dashboard` | Manager overview |
| **User Dashboard** | `/dashboard/purchase/user-dashboard` | User overview |
| **Approvals** | `/dashboard/purchase/approvals` | Handle approvals |
| **RFQ Management** | `/dashboard/purchase` | Create/manage RFQs |

## Benefits

### **✅ User Experience**
- **Single Entry Point**: All users start at the same place
- **Role-Based Routing**: Automatic detection and appropriate redirects
- **Task-Focused**: Users are directed to relevant tasks
- **Seamless Flow**: No manual navigation needed

### **✅ System Efficiency**
- **Polling-First**: Real-time monitoring of pending tasks
- **Smart Redirects**: Only redirect when tasks are pending
- **Role Optimization**: Different interfaces for different roles
- **Task Completion**: Automatic return to monitoring

### **✅ Management**
- **Centralized Entry**: Single point of entry for all users
- **Role Separation**: Clear distinction between manager and user interfaces
- **Task Tracking**: Easy monitoring of pending tasks
- **Workflow Optimization**: Streamlined approval and management processes

This navigation flow ensures that users are always directed to the most relevant page based on their role and current tasks, providing an efficient and intuitive user experience.
