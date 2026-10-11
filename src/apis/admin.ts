// src/apis/admin.ts
import api from '../library/axios';

export interface BackfillResultItem {
  studentId: string;
  fullName: string;
  applied: boolean;
  amountUSD?: number;
  reason?: string;
  error?: string;
}

export interface BackfillPreviewResponse {
  result: boolean;
  content: {
    mode: 'preview';
    monthDescription: string;
    totalAffected: number;
    affected: Array<{
      id: string;
      fullName: string;
      identityCard: string;
      currentGrade: string;
      section: string;
      status: string;
      balanceUSD: number;
      exonerationPercent: number;
      representativeId: string;
      representativeName: string;
    }>;
  };
  error: string[];
}

export interface BackfillApplyResponse {
  result: boolean;
  content: {
    mode: 'apply';
    monthDescription: string;
    totalCandidates: number;
    totalAffected: number;
    appliedCount: number;
    skippedCount: number;
    errorCount: number;
    results: BackfillResultItem[];
  };
  error: string[];
}

export async function previewBackfillCurrentMonth(
  password: string,
  studentIds?: string[]
): Promise<BackfillPreviewResponse> {
  const { data } = await api.post('/private/balance/admin/backfill-current-month-fee', {
    mode: 'preview',
    password,
    studentIds,
  });
  return data;
}

export async function applyBackfillCurrentMonth(
  password: string,
  studentIds?: string[]
): Promise<BackfillApplyResponse> {
  const { data } = await api.post('/private/balance/admin/backfill-current-month-fee', {
    mode: 'apply',
    password,
    studentIds,
  });
  return data;
}