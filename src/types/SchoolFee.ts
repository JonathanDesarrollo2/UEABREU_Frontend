// src/types/schoolFee.ts

export interface SchoolFee {
  id?: string;
  schoolYear?: string;
  inscriptionFeeUSD?: number;
  monthlyFeeUSD?: number;
  prontoPagoDiscount?: number;
  prontoPagoDeadlineDay?: number;
  administrativeFeeUSD?: number;
  august2027HalfPaymentUSD?: number;
  monthlyFeeStartDate?: string;   // formato YYYY-MM-DD
  inscriptionStartDate?: string;
  inscriptionEndDate?: string;
  schoolYearEndDate?: string; // ✅ NUEVO CAMPO
}