/**
 * OrderListScreen - 訂單頁面
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, StatusBar, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchOrderListRequest } from '../../store/actions/ordersActions';
import { fetchBuyOrdersRequest, fetchSellOrdersRequest } from '../../store/actions/marketActions';
import OrderItem, { Order } from './components/OrderItem';
import logger from '@pkg/logger';
import type { Order as ApiOrder } from '@/apis/ordersApi';

type OrderCategory = 'ongoing' | 'completed';
type OngoingTab = 'pending_payment' | 'pending_release' | 'dispute';
type CompletedTab = 'completed' | 'cancelled';

/**
 * 將 API 訂單轉換為 UI 訂單格式
 */
function mapApiOrderToUIOrder(
  apiOrder: ApiOrder,
  buyOrders: any[],
  sellOrders: any[]
): Order {
  // 訂單狀態映射：0=待付款, 1=待放行, 2=已完成, 3=已取消, 4=申訴中
  const statusMap: Record<number, { status: string; statusType: string }> = {
    0: { status: '待付款', statusType: 'pending_payment' },
    1: { status: '待放行', statusType: 'pending_release' },
    2: { status: '已完成', statusType: 'completed' },
    3: { status: '已取消', statusType: 'cancelled' },
    4: { status: '申訴中', statusType: 'dispute' },
  };

  const statusInfo = statusMap[apiOrder.status] || { status: '未知', statusType: 'pending_payment' };

  // 格式化時間
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  // 從掛單列表中找對應的掛單（根據 orderId）
  const allOrders = [...buyOrders, ...sellOrders];
  const pendingOrder = allOrders.find((po) => po.id === apiOrder.orderId);

  const uiOrder: Order = {
    id: apiOrder.id,
    orderNumber: apiOrder.id, // 使用訂單 ID 作為訂單編號
    status: statusInfo.status,
    statusType: statusInfo.statusType as any,
    amount: apiOrder.amount,
    totalPrice: apiOrder.amount, // 假設 1:1 匯率
    createdTime: formatDateTime(apiOrder.createdAt),
  };

  // 從掛單中取得銀行卡資訊
  if (pendingOrder?.bankcard) {
    uiOrder.bankCard = {
      bankName: pendingOrder.bankcard.bank?.bankName,
      cardNumber: pendingOrder.bankcard.cardNumber,
      branchName: pendingOrder.bankcard.branchName,
      cardHolderName: pendingOrder.bankcard.name,
    };
  }

  // 根據狀態添加額外資訊
  if (statusInfo.statusType === 'pending_release') {
    uiOrder.statusMessage = '買家已標記付款，等待賣家確認';
  } else if (statusInfo.statusType === 'dispute') {
    uiOrder.statusMessage = '客服處理中，請耐心等待';
  } else if (statusInfo.statusType === 'completed' && apiOrder.updatedAt) {
    uiOrder.completedTime = formatDateTime(apiOrder.updatedAt);
  } else if (statusInfo.statusType === 'cancelled' && apiOrder.updatedAt) {
    uiOrder.cancelledTime = formatDateTime(apiOrder.updatedAt);
    uiOrder.cancelReason = '訂單已取消';
  }

  return uiOrder;
}

export default function OrderListScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const {
    orderList,
    orderListLoading,
    orderListError,
  } = useAppSelector((state) => state.orders);
  const { buyOrders, sellOrders } = useAppSelector((state) => state.market);

  const [category, setCategory] = useState<OrderCategory>('ongoing');
  const [ongoingTab, setOngoingTab] = useState<OngoingTab>('pending_payment');
  const [completedTab, setCompletedTab] = useState<CompletedTab>('completed');

  // 使用 ref 追蹤是否已經初始化過，避免重複呼叫
  const hasInitialized = useRef(false);
  const isFetching = useRef(false);

  // 當頁面聚焦時，取得訂單列表和掛單列表（僅在首次聚焦時呼叫）
  useFocusEffect(
    React.useCallback(() => {
      // 如果正在載入中或正在取得資料，則不重複呼叫
      if (orderListLoading || isFetching.current) {
        return;
      }

      // 如果已經初始化過，則不重複呼叫
      if (hasInitialized.current) {
        return;
      }

      logger.info('OrderListScreen - 取得訂單列表和掛單列表');
      hasInitialized.current = true;
      isFetching.current = true;
      
      dispatch(fetchOrderListRequest({ size: 100, page: 1 })); // 取得較多筆數以涵蓋所有訂單
      dispatch(fetchBuyOrdersRequest({ page: 1, size: 100 }));
      dispatch(fetchSellOrdersRequest({ page: 1, size: 100 }));
    }, [dispatch, orderListLoading])
  );

  // 當載入完成時，重置 isFetching 標記
  useEffect(() => {
    if (!orderListLoading && isFetching.current) {
      isFetching.current = false;
    }
  }, [orderListLoading]);

  const handleOrderPress = (orderId: string) => {
    logger.info('OrderListScreen - 查看訂單詳情', { orderId });
    (navigation as any).navigate('OrderDetail', { orderId });
  };

  // 將 API 訂單轉換為 UI 訂單
  const uiOrders = useMemo(() => {
    return orderList.map((order) => mapApiOrderToUIOrder(order, buyOrders, sellOrders));
  }, [orderList, buyOrders, sellOrders]);

  // 根據分類和 tab 顯示對應的訂單
  const displayOrders = useMemo(() => {
    if (category === 'ongoing') {
      switch (ongoingTab) {
        case 'pending_payment':
          return uiOrders.filter((order) => order.statusType === 'pending_payment');
        case 'pending_release':
          return uiOrders.filter((order) => order.statusType === 'pending_release');
        case 'dispute':
          return uiOrders.filter((order) => order.statusType === 'dispute');
        default:
          return [];
      }
    } else {
      switch (completedTab) {
        case 'completed':
          return uiOrders.filter((order) => order.statusType === 'completed');
        case 'cancelled':
          return uiOrders.filter((order) => order.statusType === 'cancelled');
        default:
          return [];
      }
    }
  }, [category, ongoingTab, completedTab, uiOrders]);

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
        {orderListLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>載入中...</Text>
          </View>
        ) : orderListError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{orderListError}</Text>
            <Pressable
              style={styles.retryButton}
              onPress={() => dispatch(fetchOrderListRequest({ size: 100, page: 1 }))}
            >
              <Text style={styles.retryButtonText}>重試</Text>
            </Pressable>
          </View>
        ) : displayOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>😔</Text>
            <Text style={styles.emptyTitle}>暫無訂單</Text>
            <Text style={styles.emptySubtitle}>
              {category === 'ongoing'
                ? `目前沒有${ongoingTab === 'pending_payment' ? '待付款' : ongoingTab === 'pending_release' ? '待放行' : '申訴中'}的訂單`
                : `目前沒有${completedTab === 'completed' ? '已完成' : '已取消'}的訂單`}
            </Text>
          </View>
        ) : (
          <View style={styles.orderList}>
            {displayOrders.map((order) => (
              <OrderItem
                key={order.id}
                order={order}
                onPress={handleOrderPress}
              />
            ))}
          </View>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

