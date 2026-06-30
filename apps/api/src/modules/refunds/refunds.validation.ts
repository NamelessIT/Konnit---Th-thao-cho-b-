import { z } from 'zod';

const reasonOptional = z.string().trim().max(500).optional();
const reasonRequired = z.string().trim().min(1, 'Vui lòng nhập lý do').max(500);

export const requestRefundSchema = z.object({ reason: reasonOptional });
export const rejectRefundSchema = z.object({ reason: reasonRequired });
export const approveRefundSchema = z.object({ note: reasonOptional });
export const startRefundSchema = z.object({ reason: reasonOptional });
export const completeRefundSchema = z.object({ note: reasonOptional });
