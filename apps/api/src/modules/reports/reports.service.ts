import * as repo from './reports.repository';

export async function overview(eventId: number | null) {
  const [stats, statusRows, byType] = await Promise.all([
    repo.ticketStats(eventId),
    repo.orderStatusCounts(eventId),
    repo.ticketTypeBreakdown(eventId),
  ]);

  const orders = { paid: 0, pending: 0, cancelled: 0 };
  for (const r of statusRows) {
    if (r.status === 'paid') orders.paid = r.n;
    else if (r.status === 'pending') orders.pending = r.n;
    else orders.cancelled += r.n; // cancelled | expired | failed
  }

  return {
    revenue: Number(stats.gross_revenue),
    ticketsTotal: stats.tickets_total,
    ticketsCheckedIn: stats.tickets_checked_in,
    orders,
    byType,
  };
}

export const checkinList = (eventId: number | null) => repo.checkinList(eventId);