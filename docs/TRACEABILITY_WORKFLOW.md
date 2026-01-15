# Incoming Traceability Workflow Guide

## Complete Workflow Overview

The incoming traceability feature tracks raw leather from supplier warehouses through all production stages to finished leather. Here's how to work with each stage:

## 1. Supplier Leather Warehouse

**Purpose:** Track warehouses where suppliers store leather before delivery to tannery.

**How to Work:**
- **Create Warehouse:** Click "New Warehouse" → Fill in warehouse details (only Warehouse Name is required)
- **View Warehouses:** Click "Supplier Warehouses" card → See all warehouses in a table
- **Features:**
  - Warehouses can be created independently (supplier info is optional)
  - Each warehouse can store multiple batches
  - LWG certification status can be tracked

**Location:** `/dashboard/organization/traceability/warehouses`

---

## 2. Inward Gate Pass (IGP)

**Purpose:** Register incoming material from supplier warehouses to the tannery.

**How to Work:**
- **Create IGP:** Click "New IGP" → Select warehouse (optional) → Fill in delivery details
- **View IGPs:** Click "Inward Gate Passes" card → See all IGPs with warehouse information
- **Features:**
  - Links to supplier leather warehouse
  - Tracks delivery date, truck load, batch numbers
  - LWG certification tracking

**Location:** `/dashboard/organization/traceability/igp`

---

## 3. Raw Batches

**Purpose:** Track raw leather batches created from IGPs.

**How to Work:**
- **Create Raw Batch:** Click "New Raw Batch" → Select IGP → Enter batch code (e.g., 0001, 0002)
- **View Raw Batches:** Click "Raw Batches" card → See all raw batches
- **Features:**
  - Batch codes: 0001, 0002, etc.
  - Linked to IGP and supplier information
  - Tracks quantity, region, received date

**Location:** `/dashboard/organization/traceability/raw-batches`

---

## 4. Wet Blue Batches

**Purpose:** Track wet blue batches created from raw batches.

**How to Work:**
- **Create Wet Blue Batch:** Click "New Wet Blue Batch" → Select Raw Batch → Enter W/B Code (e.g., 10000, 10001)
- **View Wet Blue Batches:** Click "Wet Blue Batches" card → See all W/B batches
- **Features:**
  - W/B Codes: 10000, 10001, etc.
  - Linked to raw batch code
  - Can be graded into A, B, C grades

**Location:** `/dashboard/organization/traceability/wet-blue-batches`

---

## 5. Re-tanning Batches

**Purpose:** Track re-tanning process batches from wet blue batches.

**How to Work:**
- **Create Re-tanning Batch:** 
  1. Click "Re-tanning Batches" card → Click "New Re-tanning Batch"
  2. Enter RT Code (format: RKRCRT00102 - Re-tannage, batch code, month)
  3. Select Wet Blue Batch
  4. Enter recipe, technician name, quantity
  5. Save

- **View Re-tanning Batches:** 
  - Click "Re-tanning Batches" card
  - See all RT batches with W/B codes, raw batch codes, technician info

**Features:**
- RT Code format: RKRCRT00102 (Re-tannage - batch code - month)
- Links to Wet Blue batch (and traces back to Raw batch)
- Recipe and technician tracking
- Status: pending, in_process, completed

**Location:** `/dashboard/organization/traceability/re-tanning-batches`

**Example RT Code:** 
- RKRCRT00102 = Re-tannage (RT) - Batch 01 - Month 02

---

## 6. Finished Leather Batches

**Purpose:** Track finished leather - the final product ready for dispatch.

**How to Work:**
- **Create Finished Batch:**
  1. Click "Finished Leather" card → Click "New Finished Batch"
  2. Enter Batch Number (e.g., FIN-2024-001)
  3. Select Re-tanning Batch
  4. Enter completion details:
     - Completion Date
     - Quantity, Unit
     - Thickness, Color, Weight
     - Pieces, Area (m²)
     - Customer Order Number (optional)
     - Vendor Code (optional)
  5. Save

- **View Finished Batches:**
  - Click "Finished Leather" card
  - See all finished batches with full traceability chain
  - View RT Code, W/B Code, Raw Batch Code
  - See customer orders and measurements

**Features:**
- Full traceability back to origin (Raw Batch → W/B → RT → Finished)
- Measurement tracking (thickness, color, weight, pieces, area)
- Customer order linking
- Status: pending, completed, dispatched

**Location:** `/dashboard/organization/traceability/finished-leather`

---

## 7. Job Cards

**Purpose:** Track job cards linked to batches at any stage.

**How to Work:**
- **Create Job Card:**
  1. Click "Job Cards" card → Click "New Job Card"
  2. Enter Job Card Number
  3. Select Batch Type (Raw, Wet Blue, Re-tanning, or Finished)
  4. Select the specific batch
  5. Enter recipe, technician name, date
  6. Save

- **View Job Cards:**
  - See all job cards with batch type and batch codes
  - Track recipes and technicians

**Location:** `/dashboard/organization/traceability/job-cards`

---

## Batch Tracking Feature

**Purpose:** Search for any batch and see its complete traceability chain.

**How to Work:**
1. Enter any batch code in the search box:
   - Raw Batch Code (e.g., 0001)
   - W/B Code (e.g., 10000)
   - RT Code (e.g., RKRCRT00102)
   - Finished Batch Number (e.g., FIN-2024-001)
2. Click "Search"
3. View complete traceability chain:
   - **Upstream:** See where it came from (IGP, Raw Batch, W/B, RT)
   - **Current Batch:** See current batch details
   - **Downstream:** See what it became (W/B, RT, Finished)

---

## Complete Workflow Example

1. **Create Warehouse:** "Warehouse-A" (no supplier required)
2. **Create IGP:** IGP-2024-001 → Link to Warehouse-A
3. **Create Raw Batch:** Batch 0001 → Link to IGP-2024-001
4. **Create Wet Blue Batch:** W/B 10000 → Link to Raw Batch 0001
5. **Create Re-tanning Batch:** RT RKRCRT00102 → Link to W/B 10000
6. **Create Finished Batch:** FIN-2024-001 → Link to RT RKRCRT00102
7. **Track:** Search for FIN-2024-001 → See full chain back to Warehouse-A

---

## Key Points

- **Warehouses** are independent - can be created without suppliers
- **Each stage** links to the previous stage automatically
- **Batch codes** maintain traceability throughout the chain
- **Job cards** can be linked to any batch type
- **Batch tracking** allows searching by any batch code to see full history

---

## Navigation

All features are accessible from:
- Main Dashboard: `/dashboard/organization/traceability`
- Quick Links: Click any card to go to that section
- Statistics: See counts for each stage at the top

