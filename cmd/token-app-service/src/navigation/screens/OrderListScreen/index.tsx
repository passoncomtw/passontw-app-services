/**
 * OrderListScreen - 訂單頁面
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, StatusBar } from 'react-native';
import OrderItem, { Order } from './components/OrderItem';
import logger from '@pkg/logger';

type OrderCategory = 'ongoing' | 'completed';
type OngoingTab = 'pending_payment' | 'pending_release' | 'dispute';
type CompletedTab = 'completed' | 'cancelled';

// 模擬訂單資料 - 待付款
const mockPendingPaymentOrders: Order[] = [
  {
    id: '1',
    orderNumber: '202311250001',
    status: '待付款',
    statusType: 'pending_payment',
    amount: 1000,
    totalPrice: 1000,
    createdTime: '2023-11-25 10:30',
  },
  {
    id: '2',
    orderNumber: '202311250002',
    status: '待付款',
    statusType: 'pending_payment',
    amount: 2000,
    totalPrice: 2000,
    createdTime: '2023-11-25 09:15',
  },
];

// 模擬訂單資料 - 待放行
const mockPendingReleaseOrders: Order[] = [
  {
    id: '3',
    orderNumber: '202311250002',
    status: '待放行',
    statusType: 'pending_release',
    amount: 2000,
    totalPrice: 2000,
    createdTime: '2023-11-25 09:15',
    statusMessage: '買家已標記付款，等待賣家確認',
  },
];

// 模擬訂單資料 - 申訴中
const mockDisputeOrders: Order[] = [
  {
    id: '4',
    orderNumber: '202311250003',
    status: '申訴中',
    statusType: 'dispute',
    amount: 3000,
    totalPrice: 3000,
    createdTime: '2023-11-25 08:00',
    statusMessage: '客服處理中，請耐心等待',
  },
];

// 模擬訂單資料 - 已完成
const mockCompletedOrders: Order[] = [
  {
    id: '5',
    orderNumber: '202311240001',
    status: '已完成',
    statusType: 'completed',
    amount: 1500,
    totalPrice: 1500,
    completedTime: '2023-11-24 16:30',
  },
  {
    id: '6',
    orderNumber: '202311230005',
    status: '已完成',
    statusType: 'completed',
    amount: 800,
    totalPrice: 800,
    completedTime: '2023-11-23 14:20',
  },
];

// 模擬訂單資料 - 已取消
const mockCancelledOrders: Order[] = [
  {
    id: '7',
    orderNumber: '202311240010',
    status: '已取消',
    statusType: 'cancelled',
    amount: 500,
    totalPrice: 500,
    cancelledTime: '2023-11-24 11:00',
    cancelReason: '超時未付款',
  },
];

export default function OrderListScreen() {
  const [category, setCategory] = useState<OrderCategory>('ongoing');
  const [ongoingTab, setOngoingTab] = useState<OngoingTab>('pending_payment');
  const [completedTab, setCompletedTab] = useState<CompletedTab>('completed');

  const handleOrderPress = (orderId: string) => {
    // TODO: 導航到訂單詳情頁面
    logger.info('OrderListScreen - 查看訂單', { orderId });
  };

  // 根據分類和 tab 顯示對應的訂單
  const getDisplayOrders = () => {
    if (category === 'ongoing') {
      switch (ongoingTab) {
        case 'pending_payment':
          return mockPendingPaymentOrders;
        case 'pending_release':
          return mockPendingReleaseOrders;
        case 'dispute':
          return mockDisputeOrders;
        default:
          return [];
      }
    } else {
      switch (completedTab) {
        case 'completed':
          return mockCompletedOrders;
        case 'cancelled':
          return mockCancelledOrders;
        default:
          return [];
      }
    }
  };

  const displayOrders = getDisplayOrders();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* 頂部導航 */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>訂單</Text>
      </View>

      {/* 分類按鈕：進行中 / 已完成 */}
      <View style={styles.categoryButtons}>
        <Pressable 
          style={[
            styles.categoryBtn,
            category === 'ongoing' && styles.categoryBtnActive
          ]}
          onPress={() => setCategory('ongoing')}
        >
          <Text style={[
            styles.categoryBtnText,
            category === 'ongoing' && styles.categoryBtnTextActive
          ]}>
            進行中
          </Text>
        </Pressable>
        <Pressable 
          style={[
            styles.categoryBtn,
            category === 'completed' && styles.categoryBtnActive
          ]}
          onPress={() => setCategory('completed')}
        >
          <Text style={[
            styles.categoryBtnText,
            category === 'completed' && styles.categoryBtnTextActive
          ]}>
            已完成
          </Text>
        </Pressable>
      </View>

      {/* Tabs：根據分類顯示不同的 tabs */}
      <View style={styles.tabs}>
        {category === 'ongoing' ? (
          <>
            <Pressable 
              style={[styles.tab, ongoingTab === 'pending_payment' && styles.tabActive]}
              onPress={() => setOngoingTab('pending_payment')}
            >
              <Text style={[
                styles.tabText,
                ongoingTab === 'pending_payment' && styles.tabTextActive
              ]}>
                待付款
              </Text>
            </Pressable>
            <Pressable 
              style={[styles.tab, ongoingTab === 'pending_release' && styles.tabActive]}
              onPress={() => setOngoingTab('pending_release')}
            >
              <Text style={[
                styles.tabText,
                ongoingTab === 'pending_release' && styles.tabTextActive
              ]}>
                待放行
              </Text>
            </Pressable>
            <Pressable 
              style={[styles.tab, ongoingTab === 'dispute' && styles.tabActive]}
              onPress={() => setOngoingTab('dispute')}
            >
              <Text style={[
                styles.tabText,
                ongoingTab === 'dispute' && styles.tabTextActive
              ]}>
                申訴中
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable 
              style={[styles.tab, completedTab === 'completed' && styles.tabActive]}
              onPress={() => setCompletedTab('completed')}
            >
              <Text style={[
                styles.tabText,
                completedTab === 'completed' && styles.tabTextActive
              ]}>
                已完成
              </Text>
            </Pressable>
            <Pressable 
              style={[styles.tab, completedTab === 'cancelled' && styles.tabActive]}
              onPress={() => setCompletedTab('cancelled')}
            >
              <Text style={[
                styles.tabText,
                completedTab === 'cancelled' && styles.tabTextActive
              ]}>
                已取消
              </Text>
            </Pressable>
          </>
        )}
      </View>

      {/* 訂單列表 */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.orderList}>
          {displayOrders.map((order) => (
            <OrderItem
              key={order.id}
              order={order}
              onPress={handleOrderPress}
            />
          ))}
        </View>
      </ScrollView>
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
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  categoryButtons: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  categoryBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  categoryBtnActive: {
    backgroundColor: '#007AFF',
  },
  categoryBtnText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
  },
  categoryBtnTextActive: {
    color: '#fff',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  tabTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  orderList: {
    padding: 12,
  },
});

