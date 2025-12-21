'use client';

// Price calculation is integrated into QuotationForm
// This is a utility component for standalone use if needed
export function calculateItemTotal(item) {
  const qty = item.quantity || 1;
  const exFactory = item.exFactoryPrice || 0;
  const tax = item.taxCharges || 0;
  const freight = item.freightCharges || 0;
  const discount = item.discountAmount || 0;
  return (exFactory + tax + freight - discount) * qty;
}

export function calculateTotals(items) {
  let totalAmount = 0;
  let totalTax = 0;
  let totalDiscount = 0;
  let totalFreight = 0;

  items.forEach(item => {
    const qty = item.quantity || 1;
    totalAmount += (item.exFactoryPrice || 0) * qty;
    totalTax += (item.taxCharges || 0) * qty;
    totalDiscount += (item.discountAmount || 0) * qty;
    totalFreight += (item.freightCharges || 0) * qty;
  });

  const finalNetPrice = totalAmount + totalTax + totalFreight - totalDiscount;

  return { totalAmount, totalTax, totalDiscount, totalFreight, finalNetPrice };
}

