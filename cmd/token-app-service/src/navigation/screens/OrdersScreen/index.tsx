/**
 * OrdersScreen - 掛單頁面
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, StatusBar, Alert, ScrollView } from 'react-native';
import EmptyState from './components/EmptyState';
import OrdersList, { PendingOrder } from './components/OrdersList';

// 模擬掛單資料
const mockOrders: PendingOrder[] = [
  {
    id: '1',
    type: 'buy',
    status: 'active',
    amount: 5000,
    totalPrice: 5000,
    minAmount: 100,
    paymentTimeout: 15,
    createdAt: '剛剛',
  },
  {
    id: '2',
    type: 'sell',
    status: 'locked',
    amount: 3000,
    totalPrice: 3000,
    minAmount: 200,
    paymentTimeout: 20,
    createdAt: '2023-11-25 09:30',
  },
];

export default function OrdersScreen() {
  const [orders, setOrders] = useState<PendingOrder[]>(mockOrders);
  const [showSuccessAlert] = useState(false); // 預設不顯示成功訊息

  // 檢查是否可以新增掛單（最多一買一賣）
  const canAddBuy = !orders.some(o => o.type === 'buy');
  const canAddSell = !orders.some(o => o.type === 'sell');
  const canAddOrder = canAddBuy || canAddSell;

  const handleCreateOrder = () => {
    if (!canAddOrder) {
      Alert.alert('提示', '您已有買入和賣出掛單，無法新增更多');
      return;
    }
    // TODO: 導航到新增掛單頁面
    console.log('新增掛單');
  };

  const handleLockToggle = (orderId: string, currentStatus: 'active' | 'locked') => {
    const newStatus = currentStatus === 'active' ? 'locked' : 'active';
    setOrders(orders.map(o => 
      o.id === orderId ? { ...o, status: newStatus } : o
    ));
    Alert.alert('提示', newStatus === 'locked' ? '已鎖定掛單' : '已解除鎖定');
  };

  const handleStart = (orderId: string) => {
    Alert.alert('提示', '開始交易');
    // TODO: 導航到交易頁面
  };

  const handleDelete = (orderId: string) => {
    Alert.alert(
      '確認刪除',
      '確定要刪除此掛單嗎？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '刪除',
          style: 'destructive',
          onPress: () => setOrders(orders.filter(o => o.id !== orderId)),
        },
      ]
    );
  };

  // 判斷是否為空狀態
  const isEmpty = orders.length === 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* 頂部導航 */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>掛單</Text>
        <Pressable onPress={handleCreateOrder} style={styles.addButton}>
          <Text style={styles.addButtonText}>➕</Text>
        </Pressable>
      </View>

      {/* 根據是否有掛單顯示對應組件 */}
      {isEmpty ? (
        <EmptyState onCreateOrder={handleCreateOrder} />
      ) : (
        <OrdersList
          orders={orders}
          showSuccessAlert={showSuccessAlert}
          onLockToggle={handleLockToggle}
          onStart={handleStart}
          onDelete={handleDelete}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  topBar: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  addButton: {
    padding: 8,
  },
  addButtonText: {
    fontSize: 24,
    color: '#007AFF',
  },
});

