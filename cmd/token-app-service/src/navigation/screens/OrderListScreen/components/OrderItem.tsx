/**
 * OrderItem - 訂單項目組件
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  statusType: 'pending_payment' | 'pending_release' | 'dispute' | 'completed' | 'cancelled';
  amount: number;
  totalPrice: number;
  createdTime?: string;
  completedTime?: string;
  cancelledTime?: string;
  statusMessage?: string;
  cancelReason?: string;
}

interface OrderItemProps {
  order: Order;
  onPress: (orderId: string) => void;
}

export default function OrderItem({ order, onPress }: OrderItemProps) {
  const formatNumber = (num: number) => {
    return num.toLocaleString('zh-TW');
  };

  // 根據狀態類型設置樣式
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
      default:
        return {
          container: styles.statusProcessing,
          text: styles.statusTextProcessing,
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
  statusProcessing: {
    backgroundColor: '#FFF3E0',
  },
  statusCompleted: {
    backgroundColor: '#E8F5E9',
  },
  statusCancelled: {
    backgroundColor: '#FFEBEE',
  },
  statusDispute: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusTextProcessing: {
    color: '#F57C00',
  },
  statusTextCompleted: {
    color: '#2E7D32',
  },
  statusTextCancelled: {
    color: '#C62828',
  },
  statusTextDispute: {
    color: '#E65100',
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
});

