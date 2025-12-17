# Polling-Based User Flow Documentation

## Overview

This document describes the new polling-based user flow for RFQ approval/rejection system. The system automatically redirects users between polling pages and dashboard pages based on their role and pending tasks.

## User Flow Architecture

### 🔄 **Smart Polling System**

The system uses intelligent polling to monitor for updates and automatically redirect users to the appropriate pages:

1. **Polling Pages**: Monitor for new tasks
2. **Dashboard Pages**: Handle pending tasks
3. **Auto-redirect**: Seamless navigation between pages

## User Roles & Flows

### 👨‍💼 **Manager Flow**

#### **1. Polling Page** (`/dashboard/purchase/polling`)
- **Purpose**: Monitor for new RFQ approvals
- **Polling**: Every 5 seconds
- **Redirect Trigger**: When pending approvals are found
- **Redirect Destination**: `/dashboard/purchase/approvals`

#### **2. Approvals Page** (`/dashboard/purchase/approvals`)
- **Purpose**: Handle pending RFQ approvals
- **Actions**: Approve or reject RFQs
- **Auto-redirect**: When all approvals are completed
- **Redirect Destination**: `/dashboard/purchase/polling`

### 👤 **Purchase User Flow**

#### **1. Polling Page** (`/dashboard/purchase/polling`)
- **Purpose**: Monitor user's RFQ status
- **Polling**: Every 10 seconds
- **Redirect Trigger**: When pending RFQs are found
- **Redirect Destination**: `/dashboard/purchase`

#### **2. Dashboard Page** (`/dashboard/purchase`)
- **Purpose**: View and manage RFQs
- **Actions**: Create, view, and manage RFQs
- **Auto-redirect**: When no pending RFQs
- **Redirect Destination**: `/dashboard/purchase/polling`

## Implementation Details

### **📡 Polling Pages**

#### **Smart Polling Page** (`/dashboard/purchase/polling`)
```javascript
// Auto-detects user role and shows appropriate interface
const isManager = ['super_admin', 'admin', 'purchase_manager'].includes(session?.user?.role);

// Manager: Monitors for pending approvals
// User: Monitors for pending RFQs
```

#### **Manager-Specific Polling** (`/dashboard/purchase/manager-polling`)
- Dedicated manager interface
- Blue color scheme
- Approval-focused messaging

#### **User-Specific Polling** (`/dashboard/purchase/user-polling`)
- Dedicated user interface
- Green color scheme
- RFQ-focused messaging

### **🔄 Auto-Redirect Logic**

#### **Manager Redirects**
```javascript
// Check for pending approvals
const approvalsData = await api.get('/api/rfqs/approvals', { status: 'pending' });
if (approvalsData.rfqs.length > 0) {
  router.push('/dashboard/purchase/approvals');
}
```

#### **User Redirects**
```javascript
// Check for pending RFQs
const userRfqs = allRfqs.filter(rfq => rfq.createdById === session?.user?.id);
const pendingRfqs = userRfqs.filter(rfq => ['sent', 'received'].includes(rfq.status));
if (pendingRfqs.length > 0) {
  router.push('/dashboard/purchase');
}
```

### **📱 User Interface Features**

#### **Polling Status Indicators**
- **Active Polling**: Spinning indicator with "Checking for updates..."
- **Last Check Time**: Shows when last check occurred
- **Error Handling**: Displays connection errors
- **Redirect Messages**: Shows when redirecting

#### **Smart Navigation**
- **Role Detection**: Automatically detects user role
- **Color Coding**: Blue for managers, green for users
- **Manual Navigation**: Buttons to navigate manually
- **User Info**: Shows logged-in user and role

#### **Floating Navigation** (`PollingNavigation`)
- **Fixed Position**: Bottom-right corner
- **Role Indicator**: Shows current mode (Manager/User)
- **Quick Access**: Direct links to polling and dashboard pages
- **User Info**: Shows current user

## Complete User Flow

### **🔄 Manager Workflow**

1. **Start**: Manager lands on polling page
2. **Monitor**: System polls every 5 seconds for pending approvals
3. **Redirect**: When new RFQ needs approval → Redirect to approvals page
4. **Action**: Manager approves/rejects RFQs
5. **Complete**: When all approvals done → Redirect back to polling page
6. **Repeat**: Cycle continues

### **🔄 User Workflow**

1. **Start**: User lands on polling page
2. **Monitor**: System polls every 10 seconds for pending RFQs
3. **Redirect**: When RFQ needs attention → Redirect to dashboard
4. **Action**: User manages RFQs (create, view, update)
5. **Complete**: When no pending RFQs → Redirect back to polling page
6. **Repeat**: Cycle continues

## Technical Implementation

### **Polling Configuration**

```javascript
// Manager polling (more frequent)
const { isPolling, error } = usePolling(
  checkForPendingApprovals,
  5000, // 5 seconds
  true
);

// User polling (less frequent)
const { isPolling, error } = usePolling(
  checkForMyRfqs,
  10000, // 10 seconds
  true
);
```

### **Redirect Logic**

```javascript
// Check for redirect conditions
useEffect(() => {
  const checkForRedirect = async () => {
    // Check pending items
    if (shouldRedirect) {
      setTimeout(() => {
        window.location.href = '/dashboard/purchase/polling';
      }, 2000);
    }
  };
}, []);
```

### **Error Handling**

- **Connection Errors**: Display error messages
- **Retry Logic**: Automatic retry on failures
- **Fallback Navigation**: Manual navigation buttons
- **User Feedback**: Clear status messages

## Benefits

### **✅ User Experience**
- **Automatic**: No manual navigation needed
- **Real-time**: Updates within 5-10 seconds
- **Intuitive**: Clear visual indicators
- **Efficient**: Focused on pending tasks

### **✅ System Performance**
- **Efficient Polling**: Configurable intervals
- **Smart Redirects**: Only when needed
- **Error Recovery**: Graceful failure handling
- **Resource Optimization**: Minimal server load

### **✅ Role-Based**
- **Manager Focus**: Approval-centric workflow
- **User Focus**: RFQ management workflow
- **Automatic Detection**: No manual configuration
- **Consistent Experience**: Same flow for all users

## Testing Scenarios

### **Manager Testing**
1. Create RFQ as user
2. Verify manager polling page shows pending count
3. Verify auto-redirect to approvals page
4. Approve/reject RFQ
5. Verify auto-redirect back to polling page

### **User Testing**
1. Create RFQ as user
2. Verify user polling page shows pending count
3. Verify auto-redirect to dashboard
4. Complete RFQ actions
5. Verify auto-redirect back to polling page

## Navigation URLs

- **Smart Polling**: `/dashboard/purchase/polling`
- **Manager Polling**: `/dashboard/purchase/manager-polling`
- **User Polling**: `/dashboard/purchase/user-polling`
- **Approvals**: `/dashboard/purchase/approvals`
- **Dashboard**: `/dashboard/purchase`

This polling-based system provides a seamless, real-time user experience that automatically guides users through their workflow without manual navigation.
