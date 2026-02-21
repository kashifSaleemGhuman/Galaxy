/**
 * Document Templates
 * 
 * Pre-defined HTML templates for various HR documents
 * These templates use placeholders like {{fieldName}} that will be replaced with actual values
 */

// Base HTML template wrapper with colorful styling
const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 12pt;
      line-height: 1.8;
      color: #2d3748;
      padding: 40px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      min-height: 100vh;
    }
    .document-container {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      border-radius: 12px;
      overflow: hidden;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding: 30px 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-bottom: 4px solid #5a67d8;
    }
    .company-name {
      font-size: 24pt;
      font-weight: bold;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
      letter-spacing: 1px;
    }
    .company-address {
      font-size: 11pt;
      color: rgba(255, 255, 255, 0.95);
      font-weight: 300;
    }
    .document-title {
      text-align: center;
      font-size: 20pt;
      font-weight: bold;
      margin: 40px 0;
      padding: 20px;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      text-transform: uppercase;
      letter-spacing: 2px;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }
    .content {
      margin: 30px 40px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 5px solid #667eea;
    }
    .content p {
      margin-bottom: 15px;
      text-align: justify;
      color: #2d3748;
    }
    .content strong {
      color: #667eea;
      font-weight: 600;
    }
    .signature-section {
      margin-top: 60px;
      padding: 30px 40px;
      display: flex;
      justify-content: space-between;
      background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
      border-top: 3px solid #667eea;
    }
    .signature-box {
      width: 45%;
      text-align: center;
    }
    .signature-line {
      border-top: 2px solid #667eea;
      margin-top: 60px;
      padding-top: 10px;
      text-align: center;
      font-size: 11pt;
      font-weight: 600;
      color: #4a5568;
    }
    .date {
      text-align: right;
      margin: 20px 40px;
      padding: 10px 20px;
      background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
      border-radius: 6px;
      display: inline-block;
      float: right;
      font-weight: 600;
      color: #2d3748;
    }
    .footer {
      margin-top: 30px;
      padding: 20px 40px;
      text-align: center;
      font-size: 9pt;
      color: #718096;
      background: linear-gradient(135deg, #e8ecf1 0%, #d1d9e0 100%);
      border-top: 2px solid #cbd5e0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    table td {
      padding: 12px 15px;
      border: 1px solid #e2e8f0;
    }
    table td:first-child {
      font-weight: bold;
      width: 35%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    table tr:nth-child(even) td:not(:first-child) {
      background: #f7fafc;
    }
    table tr:hover td:not(:first-child) {
      background: #edf2f7;
    }
    .highlight-box {
      background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
      padding: 15px;
      border-radius: 8px;
      margin: 15px 0;
      border-left: 4px solid #f39c12;
    }
    .info-box {
      background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
      padding: 15px;
      border-radius: 8px;
      margin: 15px 0;
      border-left: 4px solid #00b894;
    }
    .warning-box {
      background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
      padding: 15px;
      border-radius: 8px;
      margin: 15px 0;
      border-left: 4px solid #e17055;
    }
  </style>
</head>
<body>
  <div class="document-container">
    ${content}
  </div>
</body>
</html>
`

// Offer Letter Template
export const offerLetterTemplate = `
<div class="header">
  <div class="company-name">{{companyName|Galaxy ERP Solutions}}</div>
  <div class="company-address">{{companyAddress|123 Business Street, City, Country}}</div>
</div>

<div class="document-title">OFFER LETTER</div>

<div class="date">
  <strong>Date:</strong> {{currentDate}}
</div>

<div class="content">
  <p>Dear {{employeeName}},</p>
  
  <p>We are pleased to offer you the position of <strong>{{designation}}</strong> in our <strong>{{department}}</strong> department, effective from <strong>{{dateOfJoining}}</strong>.</p>
  
  <p>Your employment will be subject to the following terms and conditions:</p>
  
  <table>
    <tr>
      <td>Employee ID</td>
      <td>{{employeeId}}</td>
    </tr>
    <tr>
      <td>Designation</td>
      <td>{{designation}}</td>
    </tr>
    <tr>
      <td>Department</td>
      <td>{{department}}</td>
    </tr>
    <tr>
      <td>Date of Joining</td>
      <td>{{dateOfJoining}}</td>
    </tr>
    <tr>
      <td>Salary</td>
      <td>{{salary|To be discussed}}</td>
    </tr>
    <tr>
      <td>Shift</td>
      <td>{{shift|Standard Business Hours}}</td>
    </tr>
  </table>
  
  <p>We believe that your skills and experience will be a valuable addition to our team. We look forward to welcoming you aboard.</p>
  
  <p>Please confirm your acceptance of this offer by signing and returning a copy of this letter.</p>
  
  <p>We wish you a successful career with us.</p>
</div>

<div class="signature-section">
  <div class="signature-box">
    <div class="signature-line">Employee Signature</div>
  </div>
  <div class="signature-box">
    <div class="signature-line">HR Manager</div>
  </div>
</div>

<div class="footer">
  This is a system-generated document. For any queries, please contact HR Department.
</div>
`

// Employment Contract Template
export const employmentContractTemplate = `
<div class="header">
  <div class="company-name">{{companyName|Galaxy ERP Solutions}}</div>
  <div class="company-address">{{companyAddress|123 Business Street, City, Country}}</div>
</div>

<div class="document-title">EMPLOYMENT CONTRACT</div>

<div class="date">
  <strong>Date:</strong> {{currentDate}}
</div>

<div class="content">
  <p><strong>THIS EMPLOYMENT CONTRACT</strong> is made on <strong>{{currentDate}}</strong> between:</p>
  
  <p><strong>Employer:</strong> {{companyName|Galaxy ERP Solutions}}<br>
  <strong>Address:</strong> {{companyAddress|123 Business Street, City, Country}}</p>
  
  <p><strong>Employee:</strong> {{employeeName}}<br>
  <strong>Employee ID:</strong> {{employeeId}}<br>
  <strong>Address:</strong> {{address}}</p>
  
  <p><strong>1. POSITION AND DUTIES</strong></p>
  <p>The Employee agrees to serve as <strong>{{designation}}</strong> in the <strong>{{department}}</strong> department. The Employee shall perform all duties assigned by the Employer in a professional and diligent manner.</p>
  
  <p><strong>2. COMMENCEMENT DATE</strong></p>
  <p>The employment shall commence on <strong>{{dateOfJoining}}</strong>.</p>
  
  <p><strong>3. REMUNERATION</strong></p>
  <p>The Employee shall receive a monthly salary of <strong>{{salary}}</strong>, payable on the last working day of each month.</p>
  
  <p><strong>4. WORKING HOURS</strong></p>
  <p>The Employee's working hours shall be as per the company's standard schedule: <strong>{{shift|Standard Business Hours}}</strong>.</p>
  
  <p><strong>5. TERMINATION</strong></p>
  <p>Either party may terminate this contract by giving {{noticePeriod|30 days}} notice in writing, or payment in lieu of notice.</p>
  
  <p><strong>6. CONFIDENTIALITY</strong></p>
  <p>The Employee agrees to maintain confidentiality of all company information and trade secrets during and after employment.</p>
  
  <p>By signing below, both parties agree to the terms and conditions outlined in this contract.</p>
</div>

<div class="signature-section">
  <div class="signature-box">
    <div class="signature-line">Employee Signature</div>
    <div style="margin-top: 10px; text-align: center;">{{employeeName}}</div>
  </div>
  <div class="signature-box">
    <div class="signature-line">Authorized Signatory</div>
    <div style="margin-top: 10px; text-align: center;">{{companyName|Galaxy ERP Solutions}}</div>
  </div>
</div>

<div class="footer">
  This is a system-generated document. For any queries, please contact HR Department.
</div>
`

// Appointment Letter Template
export const appointmentLetterTemplate = `
<div class="header">
  <div class="company-name">{{companyName|Galaxy ERP Solutions}}</div>
  <div class="company-address">{{companyAddress|123 Business Street, City, Country}}</div>
</div>

<div class="document-title">APPOINTMENT LETTER</div>

<div class="date">
  <strong>Date:</strong> {{currentDate}}
</div>

<div class="content">
  <p>Dear {{employeeName}},</p>
  
  <p>We are pleased to inform you that you have been appointed to the position of <strong>{{designation}}</strong> in our <strong>{{department}}</strong> department.</p>
  
  <p><strong>Your appointment details are as follows:</strong></p>
  
  <table>
    <tr>
      <td>Employee ID</td>
      <td>{{employeeId}}</td>
    </tr>
    <tr>
      <td>Name</td>
      <td>{{employeeName}}</td>
    </tr>
    <tr>
      <td>Designation</td>
      <td>{{designation}}</td>
    </tr>
    <tr>
      <td>Department</td>
      <td>{{department}}</td>
    </tr>
    <tr>
      <td>Date of Appointment</td>
      <td>{{dateOfJoining}}</td>
    </tr>
    <tr>
      <td>Salary</td>
      <td>{{salary}}</td>
    </tr>
    <tr>
      <td>Reporting To</td>
      <td>{{reportingManager|Department Head}}</td>
    </tr>
  </table>
  
  <p>Your appointment is subject to the company's policies and procedures. You are expected to report to work on <strong>{{dateOfJoining}}</strong>.</p>
  
  <p>We welcome you to our organization and look forward to a successful association.</p>
</div>

<div class="signature-section">
  <div class="signature-box">
    <div class="signature-line">HR Manager</div>
  </div>
  <div class="signature-box">
    <div class="signature-line">Managing Director</div>
  </div>
</div>

<div class="footer">
  This is a system-generated document. For any queries, please contact HR Department.
</div>
`

// Promotion Letter Template
export const promotionLetterTemplate = `
<div class="header">
  <div class="company-name">{{companyName|Galaxy ERP Solutions}}</div>
  <div class="company-address">{{companyAddress|123 Business Street, City, Country}}</div>
</div>

<div class="document-title">PROMOTION LETTER</div>

<div class="date">
  <strong>Date:</strong> {{currentDate}}
</div>

<div class="content">
  <p>Dear {{employeeName}},</p>
  
  <p>We are pleased to inform you that based on your outstanding performance and dedication, you have been promoted to the position of <strong>{{newDesignation|{{designation}}}}</strong> in the <strong>{{department}}</strong> department, effective from <strong>{{promotionDate|{{currentDate}}}}</strong>.</p>
  
  <p><strong>Your new position details:</strong></p>
  
  <table>
    <tr>
      <td>Employee ID</td>
      <td>{{employeeId}}</td>
    </tr>
    <tr>
      <td>Previous Designation</td>
      <td>{{previousDesignation|{{designation}}}}</td>
    </tr>
    <tr>
      <td>New Designation</td>
      <td>{{newDesignation|{{designation}}}}</td>
    </tr>
    <tr>
      <td>Department</td>
      <td>{{department}}</td>
    </tr>
    <tr>
      <td>Previous Salary</td>
      <td>{{previousSalary|{{salary}}}}</td>
    </tr>
    <tr>
      <td>New Salary</td>
      <td>{{newSalary|{{salary}}}}</td>
    </tr>
    <tr>
      <td>Effective Date</td>
      <td>{{promotionDate|{{currentDate}}}}</td>
    </tr>
  </table>
  
  <p>This promotion reflects our confidence in your abilities and our commitment to recognizing and rewarding excellence. We are confident that you will continue to excel in your new role.</p>
  
  <p>Congratulations on your promotion!</p>
</div>

<div class="signature-section">
  <div class="signature-box">
    <div class="signature-line">HR Manager</div>
  </div>
  <div class="signature-box">
    <div class="signature-line">Department Head</div>
  </div>
</div>

<div class="footer">
  This is a system-generated document. For any queries, please contact HR Department.
</div>
`

// Experience Letter Template
export const experienceLetterTemplate = `
<div class="header">
  <div class="company-name">{{companyName|Galaxy ERP Solutions}}</div>
  <div class="company-address">{{companyAddress|123 Business Street, City, Country}}</div>
</div>

<div class="document-title">EXPERIENCE CERTIFICATE</div>

<div class="date">
  <strong>Date:</strong> {{currentDate}}
</div>

<div class="content">
  <p><strong>TO WHOM IT MAY CONCERN</strong></p>
  
  <p>This is to certify that <strong>{{employeeName}}</strong> (Employee ID: <strong>{{employeeId}}</strong>) was employed with {{companyName|Galaxy ERP Solutions}} from <strong>{{dateOfJoining}}</strong> to <strong>{{dateOfLeaving|{{currentDate}}}}</strong>.</p>
  
  <p>During the tenure of employment, {{employeeName}} served as <strong>{{designation}}</strong> in the <strong>{{department}}</strong> department.</p>
  
  <table>
    <tr>
      <td>Employee Name</td>
      <td>{{employeeName}}</td>
    </tr>
    <tr>
      <td>Employee ID</td>
      <td>{{employeeId}}</td>
    </tr>
    <tr>
      <td>Designation</td>
      <td>{{designation}}</td>
    </tr>
    <tr>
      <td>Department</td>
      <td>{{department}}</td>
    </tr>
    <tr>
      <td>Date of Joining</td>
      <td>{{dateOfJoining}}</td>
    </tr>
    <tr>
      <td>Date of Leaving</td>
      <td>{{dateOfLeaving|{{currentDate}}}}</td>
    </tr>
    <tr>
      <td>Total Service Period</td>
      <td>{{servicePeriod|Calculated automatically}}</td>
    </tr>
  </table>
  
  <p>{{employeeName}} has performed duties with dedication and professionalism. {{employeeName}}'s conduct during the employment period was satisfactory.</p>
  
  <p>We wish {{employeeName}} all the best for future endeavors.</p>
  
  <p>This certificate is issued at the request of the employee and without any liability on the part of the company.</p>
</div>

<div class="signature-section">
  <div class="signature-box">
    <div class="signature-line">HR Manager</div>
  </div>
  <div class="signature-box">
    <div class="signature-line">Authorized Signatory</div>
  </div>
</div>

<div class="footer">
  This is a system-generated document. For any queries, please contact HR Department.
</div>
`

// Salary Certificate Template
export const salaryCertificateTemplate = `
<div class="header">
  <div class="company-name">{{companyName|Galaxy ERP Solutions}}</div>
  <div class="company-address">{{companyAddress|123 Business Street, City, Country}}</div>
</div>

<div class="document-title">SALARY CERTIFICATE</div>

<div class="date">
  <strong>Date:</strong> {{currentDate}}
</div>

<div class="content">
  <p><strong>TO WHOM IT MAY CONCERN</strong></p>
  
  <p>This is to certify that <strong>{{employeeName}}</strong> (Employee ID: <strong>{{employeeId}}</strong>) is currently employed with {{companyName|Galaxy ERP Solutions}} as <strong>{{designation}}</strong> in the <strong>{{department}}</strong> department.</p>
  
  <p><strong>Employment Details:</strong></p>
  
  <table>
    <tr>
      <td>Employee Name</td>
      <td>{{employeeName}}</td>
    </tr>
    <tr>
      <td>Employee ID</td>
      <td>{{employeeId}}</td>
    </tr>
    <tr>
      <td>Designation</td>
      <td>{{designation}}</td>
    </tr>
    <tr>
      <td>Department</td>
      <td>{{department}}</td>
    </tr>
    <tr>
      <td>Date of Joining</td>
      <td>{{dateOfJoining}}</td>
    </tr>
    <tr>
      <td>Current Salary (Monthly)</td>
      <td>{{salary}}</td>
    </tr>
    <tr>
      <td>Annual Salary</td>
      <td>{{annualSalary|Calculated from monthly salary}}</td>
    </tr>
  </table>
  
  <p>This certificate is issued for the purpose of {{purpose|official use}} and is valid as of <strong>{{currentDate}}</strong>.</p>
  
  <p>For any verification, please contact the HR Department.</p>
</div>

<div class="signature-section">
  <div class="signature-box">
    <div class="signature-line">HR Manager</div>
  </div>
  <div class="signature-box">
    <div class="signature-line">Finance Manager</div>
  </div>
</div>

<div class="footer">
  This is a system-generated document. For any queries, please contact HR Department.
</div>
`

// Warning Letter Template
export const warningLetterTemplate = `
<div class="header">
  <div class="company-name">{{companyName|Galaxy ERP Solutions}}</div>
  <div class="company-address">{{companyAddress|123 Business Street, City, Country}}</div>
</div>

<div class="document-title">WARNING LETTER</div>

<div class="date">
  <strong>Date:</strong> {{currentDate}}
</div>

<div class="content">
  <p>Dear {{employeeName}},</p>
  
  <p>This letter serves as a <strong>{{warningType|formal warning}}</strong> regarding your conduct/performance at {{companyName|Galaxy ERP Solutions}}.</p>
  
  <p><strong>Employee Details:</strong></p>
  
  <table>
    <tr>
      <td>Employee ID</td>
      <td>{{employeeId}}</td>
    </tr>
    <tr>
      <td>Name</td>
      <td>{{employeeName}}</td>
    </tr>
    <tr>
      <td>Designation</td>
      <td>{{designation}}</td>
    </tr>
    <tr>
      <td>Department</td>
      <td>{{department}}</td>
    </tr>
  </table>
  
  <p><strong>Reason for Warning:</strong></p>
  <p>{{warningReason|Please specify the reason for this warning}}</p>
  
  <p><strong>Incident Details:</strong></p>
  <p>{{incidentDetails|Please provide details of the incident}}</p>
  
  <p><strong>Date of Incident:</strong> {{incidentDate|{{currentDate}}}}</p>
  
  <p>We expect you to improve your {{improvementArea|performance/conduct}} immediately. Failure to do so may result in further disciplinary action, up to and including termination of employment.</p>
  
  <p>You are required to acknowledge receipt of this warning letter by signing below.</p>
</div>

<div class="signature-section">
  <div class="signature-box">
    <div class="signature-line">Employee Signature</div>
    <div style="margin-top: 10px; text-align: center;">{{employeeName}}</div>
    <div style="margin-top: 5px; text-align: center; font-size: 9pt;">Date: _______________</div>
  </div>
  <div class="signature-box">
    <div class="signature-line">HR Manager</div>
  </div>
</div>

<div class="footer">
  This is a system-generated document. For any queries, please contact HR Department.
</div>
`

// Notice Letter Template
export const noticeLetterTemplate = `
<div class="header">
  <div class="company-name">{{companyName|Galaxy ERP Solutions}}</div>
  <div class="company-address">{{companyAddress|123 Business Street, City, Country}}</div>
</div>

<div class="document-title">NOTICE LETTER</div>

<div class="date">
  <strong>Date:</strong> {{currentDate}}
</div>

<div class="content">
  <p>Dear {{employeeName}},</p>
  
  <p>This letter serves as a <strong>{{noticeType|formal notice}}</strong> regarding your employment with {{companyName|Galaxy ERP Solutions}}.</p>
  
  <p><strong>Employee Details:</strong></p>
  
  <table>
    <tr>
      <td>Employee ID</td>
      <td>{{employeeId}}</td>
    </tr>
    <tr>
      <td>Name</td>
      <td>{{employeeName}}</td>
    </tr>
    <tr>
      <td>Designation</td>
      <td>{{designation}}</td>
    </tr>
    <tr>
      <td>Department</td>
      <td>{{department}}</td>
    </tr>
  </table>
  
  <p><strong>Subject:</strong> {{noticeSubject|Please specify the subject of this notice}}</p>
  
  <p><strong>Notice Details:</strong></p>
  <p>{{noticeDetails|Please provide details of the notice}}</p>
  
  <p><strong>Effective Date:</strong> {{effectiveDate|{{currentDate}}}}</p>
  
  <p><strong>Action Required:</strong></p>
  <p>{{actionRequired|Please specify any action required from the employee}}</p>
  
  <p>Please acknowledge receipt of this notice by signing below.</p>
</div>

<div class="signature-section">
  <div class="signature-box">
    <div class="signature-line">Employee Signature</div>
    <div style="margin-top: 10px; text-align: center;">{{employeeName}}</div>
    <div style="margin-top: 5px; text-align: center; font-size: 9pt;">Date: _______________</div>
  </div>
  <div class="signature-box">
    <div class="signature-line">HR Manager</div>
  </div>
</div>

<div class="footer">
  This is a system-generated document. For any queries, please contact HR Department.
</div>
`

// Template map for easy access
export const documentTemplates = {
  OFFER_LETTER: baseTemplate(offerLetterTemplate),
  EMPLOYMENT_CONTRACT: baseTemplate(employmentContractTemplate),
  APPOINTMENT_LETTER: baseTemplate(appointmentLetterTemplate),
  PROMOTION_LETTER: baseTemplate(promotionLetterTemplate),
  EXPERIENCE_LETTER: baseTemplate(experienceLetterTemplate),
  SALARY_CERTIFICATE: baseTemplate(salaryCertificateTemplate),
  WARNING_LETTER: baseTemplate(warningLetterTemplate),
  NOTICE_LETTER: baseTemplate(noticeLetterTemplate)
}

// Get template by category
export function getTemplateByCategory(category) {
  return documentTemplates[category] || null
}

// Get all available template categories
export function getAvailableCategories() {
  return Object.keys(documentTemplates)
}

