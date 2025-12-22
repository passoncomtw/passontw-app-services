/**
 * OrderItem - 訂單項目組件
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { theme } from '@/theme';

export interface Order {
  id: string;
  orderNumber: string;
  type: number;
  status: string;
  statusType: 'pending_payment' | 'pending_release' | 'dispute' | 'completed' | 'cancelled';
  amount: number;
  totalPrice: number;
  createdTime?: string;
  completedTime?: string;
  cancelledTime?: string;
  statusMessage?: string;
  cancelReason?: string;
  // 付款資訊（銀行卡資訊）
  bankCard?: {
    bankName?: string;
    cardNumber?: string;
    branchName?: string;
    cardHolderName?: string;
  };
}

interface OrderItemProps {
  order: Order;
  onPress: (orderId: string) => void;
}

export default function OrderItem({ order, onPress }: OrderItemProps) {
  const formatNumber = (num: number) => {
    return num.toLocaleString('zh-TW');
  };

  // 根據狀態類型設置樣式（與訂單詳情頁面保持一致）
  const getStatusStyle = () => {
    switch (order.statusType) {
      case 'completed':
        return {
          container: styles.statusCompleted,
          text: styles.statusTextCompleted,
        };
      case 'cancelled':
        return {
          container: styles.statusCancelled,
          text: styles.statusTextCancelled,
        };
      case 'dispute':
        return {
          container: styles.statusDispute,
          text: styles.statusTextDispute,
        };
      case 'pending_release':
        return {
          container: styles.statusPendingRelease,
          text: styles.statusTextPendingRelease,
        };
      case 'pending_payment':
      default:
        return {
          container: styles.statusPendingPayment,
          text: styles.statusTextPendingPayment,
        };
    }
  };

  const statusStyle = getStatusStyle();

  // 根據狀態類型獲取時間標籤和值
  const getTimeLabel = () => {
    if (order.cancelledTime) return '取消時間';
    if (order.completedTime) return '完成時間';
    return '創建時間';
  };

  const getTimeValue = () => {
    return order.cancelledTime || order.completedTime || order.createdTime;
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.containerPressed,
      ]}
      onPress={() => onPress(order.id)}
    >
      {/* 訂單狀態 */}
      <View style={[styles.statusContainer, statusStyle.container]}>
        <Text style={[styles.statusText, statusStyle.text]}>
          {order.status}
        </Text>
      </View>

      {/* 訂單詳情 */}
      <View style={styles.row}>
        <Text style={styles.label}>訂單編號</Text>
        <Text style={styles.text}>{order.orderNumber}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>掛單類型</Text>
        <Text style={styles.text}>{order.type === 0 ? '買幣' : '賣幣'}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>數量</Text>
        <Text style={styles.text}>{formatNumber(order.amount)} E幣</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>交易金額</Text>
        <Text style={styles.text}>CNY ¥{formatNumber(order.totalPrice)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>{getTimeLabel()}</Text>
        <Text style={styles.text}>{getTimeValue()}</Text>
      </View>

      {/* 額外狀態訊息（待放行、申訴中） */}
      {order.statusMessage && (
        <View style={styles.row}>
          <Text style={styles.label}>狀態</Text>
          <Text style={[
            styles.text,
            order.statusType === 'pending_release' && styles.statusMessageOrange,
            order.statusType === 'dispute' && styles.statusMessageDeepOrange,
          ]}>
            {order.statusMessage}
          </Text>
        </View>
      )}

      {/* 取消原因 */}
      {order.cancelReason && (
        <View style={styles.row}>
          <Text style={styles.label}>取消原因</Text>
          <Text style={styles.text}>{order.cancelReason}</Text>
        </View>
      )}

      {/* 付款資訊（銀行卡資訊） */}
      {order.bankCard && (
        <>
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>付款資訊</Text>
          {order.bankCard.bankName && (
            <View style={styles.row}>
              <Text style={styles.label}>銀行</Text>
              <Text style={styles.text}>{order.bankCard.bankName}</Text>
            </View>
          )}
          {order.bankCard.branchName && (
            <View style={styles.row}>
              <Text style={styles.label}>分行</Text>
              <Text style={styles.text}>{order.bankCard.branchName}</Text>
            </View>
          )}
          {order.bankCard.cardNumber && (
            <View style={styles.row}>
              <Text style={styles.label}>卡號</Text>
              <Text style={[styles.text, styles.cardNumber]}>
                {order.bankCard.cardNumber.replace(/(.{4})/g, '$1 ').trim()}
              </Text>
            </View>
          )}
          {order.bankCard.cardHolderName && (
            <View style={styles.row}>
              <Text style={styles.label}>戶名</Text>
              <Text style={styles.text}>{order.bankCard.cardHolderName}</Text>
            </View>
          )}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  containerPressed: {
    backgroundColor: '#F8F8F8',
  },
  statusContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 12,
  },
  statusPendingPayment: {
    backgroundColor: '#FFF3E0', // 待付款 - 警告色背景（淺黃）
  },
  statusPendingRelease: {
    backgroundColor: '#E3F2FD', // 待放行 - 資訊色背景（淺藍）
  },
  statusCompleted: {
    backgroundColor: '#E8F5E9', // 已完成 - 成功色背景（淺綠）
  },
  statusCancelled: {
    backgroundColor: '#F5F5F5', // 已取消 - 灰色背景
  },
  statusDispute: {
    backgroundColor: '#FFEBEE', // 申訴中 - 錯誤色背景（淺紅）
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusTextPendingPayment: {
    color: theme.status.warning, // '#FF9800'
  },
  statusTextPendingRelease: {
    color: theme.status.info, // '#2196F3'
  },
  statusTextCompleted: {
    color: theme.status.success, // '#4CAF50'
  },
  statusTextCancelled: {
    color: theme.text.tertiary, // '#999999'
  },
  statusTextDispute: {
    color: theme.status.error, // '#F44336'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: '#999',
    flex: 0.4,
  },
  text: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 0.6,
    textAlign: 'right',
  },
  statusMessageOrange: {
    color: '#FF9800',
  },
  statusMessageDeepOrange: {
    color: '#E65100',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  cardNumber: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});

