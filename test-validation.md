# Customer Form Validation Test Guide

## 🧪 Testing the Enhanced Validation System

### **Required Fields (Marked with Red *)**
- **Company Name** - Must be filled, 2-100 characters
- **Contact Person** - Must be filled, 2-100 characters  
- **Email** - Must be filled, valid email format

### **Field-Specific Validations**

#### **Company Name**
- ✅ Valid: "Acme Corporation", "Tech Solutions Inc", "Global Industries (LLC)"
- ❌ Invalid: "A" (too short), "A".repeat(101) (too long), "Company@#$%" (invalid characters)

#### **Contact Person**
- ✅ Valid: "John Doe", "Mary-Jane Smith", "O'Connor"
- ❌ Invalid: "J" (too short), "A".repeat(101) (too long), "John123" (numbers not allowed)

#### **Email**
- ✅ Valid: "user@example.com", "john.doe@company.co.uk"
- ❌ Invalid: "invalid-email", "user@", "@domain.com", "user@domain"

#### **Phone**
- ✅ Valid: "+1 (555) 123-4567", "555-123-4567", "+44 20 7946 0958"
- ❌ Invalid: "123", "abc-def-ghij", "555-123" (too short)

#### **Website**
- ✅ Valid: "https://example.com", "http://www.company.co.uk", "https://subdomain.example.org/path"
- ❌ Invalid: "example.com", "ftp://example.com", "not-a-url"

#### **Value**
- ✅ Valid: "1000", "2500.50", "0"
- ❌ Invalid: "-100" (negative), "9999999999" (too large), "abc" (not a number)

#### **Last Contact**
- ✅ Valid: Any date up to today
- ❌ Invalid: Future dates

### **Validation Behavior**

#### **Real-time Validation**
- Fields are validated when user leaves the field (onBlur)
- Errors appear below the field immediately
- Red border appears around invalid fields

#### **Submit Validation**
- All fields are validated when clicking "Create Customer"
- All fields are marked as "touched" to show errors
- Form won't submit until all validation passes

#### **Error Display**
- Errors appear below each field in red text
- Field borders turn red when invalid
- Required fields marked with red asterisk (*)

### **Test Scenarios**

#### **1. Empty Form Submission**
1. Click "Add Customer"
2. Click "Create Customer" without filling anything
3. **Expected**: Red borders and error messages for Company Name, Contact Person, and Email

#### **2. Invalid Email Format**
1. Fill Company Name and Contact Person
2. Enter "invalid-email" in Email field
3. Click outside the field or submit
4. **Expected**: Error message "Please enter a valid email address (e.g., user@example.com)"

#### **3. Future Date Selection**
1. Fill required fields
2. Select a future date in Last Contact
3. **Expected**: Error message "Last contact date cannot be in the future"

#### **4. Invalid Phone Number**
1. Fill required fields
2. Enter "123" in Phone field
3. Click outside the field
4. **Expected**: Error message "Please enter a valid phone number (e.g., +1 (555) 123-4567)"

#### **5. Invalid Website URL**
1. Fill required fields
2. Enter "example.com" in Website field
3. Click outside the field
4. **Expected**: Error message "Please enter a valid website URL (e.g., https://example.com)"

#### **6. Value Range Validation**
1. Fill required fields
2. Enter "9999999999" in Value field
3. Click outside the field
4. **Expected**: Error message "Value must be no more than 999,999,999.99"

### **Success Scenarios**

#### **Valid Customer Creation**
1. Fill Company Name: "Test Company"
2. Fill Contact Person: "John Doe"
3. Fill Email: "john@testcompany.com"
4. Fill Phone: "+1 (555) 123-4567"
5. Select Industry: "Technology"
6. Fill Value: "50000"
7. Select Status: "Active"
8. Select Last Contact: Today's date
9. Click "Create Customer"
10. **Expected**: Form submits successfully, success toast appears

### **Accessibility Features**

- **Required Field Indicators**: Red asterisks (*) for required fields
- **Error Messages**: Clear, descriptive error messages below each field
- **Visual Feedback**: Red borders for invalid fields, green focus rings
- **Keyboard Navigation**: Tab through fields, Enter to submit
- **Screen Reader Support**: Proper labels and error associations

### **Mobile Responsiveness**

- **Touch-Friendly**: Large input fields and buttons
- **Date Picker**: Native mobile date picker integration
- **Form Layout**: Responsive grid that stacks on mobile
- **Error Display**: Errors are clearly visible on all screen sizes

---

## 🎯 **Key Benefits of New Validation System**

1. **Immediate Feedback** - Users see errors as they type/leave fields
2. **Comprehensive Validation** - Covers all field types with specific rules
3. **User-Friendly Messages** - Clear examples and explanations
4. **Professional UX** - Red borders, error messages, required indicators
5. **Mobile Optimized** - Works perfectly on all devices
6. **Accessibility** - Screen reader friendly with proper labeling

The validation system now provides a professional, user-friendly experience that prevents form submission errors and guides users to correct input! 🚀 