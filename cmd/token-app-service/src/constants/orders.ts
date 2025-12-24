import { theme } from '@/theme';

/**
 * 訂單狀態映射
 */
export const ORDER_STATUS_MAP: Record<number, { label: string; color: string }> = {
  0: { label: '待付款', color: theme.status.warning },
  1: { label: '待放行', color: theme.status.info },
  2: { label: '已完成', color: theme.status.success },
  3: { label: '已取消', color: theme.text.tertiary },
  4: { label: '申訴中', color: theme.status.error },
};

