import * as repo from './vouchers.repository';
import { AppError } from '../../middleware/errorHandler';
import { evaluateVoucher } from '../commerce/pricing';

const REASON_MESSAGES: Record<string, string> = {
  NOT_FOUND: 'Mã giảm giá không tồn tại',
  INACTIVE: 'Mã giảm giá đã bị vô hiệu hóa',
  NOT_STARTED: 'Mã giảm giá chưa có hiệu lực',
  EXPIRED: 'Mã giảm giá đã hết hạn',
  EXHAUSTED: 'Mã giảm giá đã hết lượt sử dụng',
  MIN_ORDER: 'Đơn hàng chưa đạt giá trị tối thiểu để dùng mã',
};

/** Public preview — validate code against a subtotal, no redeem. */
export async function validateForSubtotal(code: string, subtotal: number) {
  const voucher = await repo.findByCode(code);
  const result = evaluateVoucher(voucher, subtotal);
  if (!result.ok) {
    throw new AppError(400, 'VOUCHER_INVALID', REASON_MESSAGES[result.reason ?? 'NOT_FOUND'] ?? 'Mã không hợp lệ');
  }
  return {
    code: voucher!.code,
    discount_type: voucher!.discount_type,
    discount_value: Number(voucher!.discount_value),
    discount_amount: result.discountAmount,
  };
}

export async function list() {
  return repo.findAll();
}

export async function getById(id: number) {
  const v = await repo.findById(id);
  if (!v) throw new AppError(404, 'NOT_FOUND', 'Mã giảm giá không tồn tại');
  return v;
}

export async function create(input: Record<string, unknown>, userId: number) {
  const existing = await repo.findByCode(input.code as string);
  if (existing) throw new AppError(409, 'CODE_EXISTS', 'Mã giảm giá đã tồn tại');
  return repo.create(input, userId);
}

export async function update(id: number, input: Record<string, unknown>) {
  const updated = await repo.update(id, input);
  if (!updated) throw new AppError(404, 'NOT_FOUND', 'Mã giảm giá không tồn tại');
  return updated;
}

export async function remove(id: number) {
  const deleted = await repo.softDelete(id);
  if (!deleted) throw new AppError(404, 'NOT_FOUND', 'Mã giảm giá không tồn tại');
  return deleted;
}
