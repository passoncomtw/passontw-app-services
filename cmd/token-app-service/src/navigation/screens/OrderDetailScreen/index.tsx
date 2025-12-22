/**
 * OrderDetailScreen - 訂單詳情頁面
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  Alert,
  Clipboard,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchOrderListRequest } from '../../store/actions/ordersActions';
import { fetchBankCardsRequest } from '../../store/actions/bankCardsActions';
import { fetchBuyOrdersRequest, fetchSellOrdersRequest } from '../../store/actions/marketActions';
import { theme, commonStyles } from '@/theme';
import logger from '@pkg/logger';
import { ordersApi } from '@/apis';

type OrderDetailRouteProp = RouteProp<
  {
    OrderDetail: {
      orderId: string;
    };
  },
  'OrderDetail'
>;

/**
 * 訂單狀態映射
 */
const ORDER_STATUS_MAP: Record<number, { label: string; color: string }> = {
  0: { label: '待付款', color: theme.status.warning },
  1: { label: '待放行', color: theme.status.info },
  2: { label: '已完成', color: theme.status.success },
  3: { label: '已取消', color: theme.text.tertiary },
  4: { label: '申訴中', color: theme.status.error },
};

export default function OrderDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<OrderDetailRouteProp>();
  const dispatch = useAppDispatch();
  const { orderList, orderListLoading } = useAppSelector((state) => state.orders);
  const { user } = useAppSelector((state) => state.auth);
  const { cards: bankCards } = useAppSelector((state) => state.bankCards);
  const { buyOrders, sellOrders } = useAppSelector((state) => state.market);

  const { orderId } = route.params;

  // 從訂單列表中找對應的訂單（使用 useMemo 穩定引用）
  const order = React.useMemo(() => {
    return orderList.find((o) => o.id === orderId);
  }, [orderList, orderId]);
  
  const orderStatus = order?.status ?? 0;
  const statusInfo = ORDER_STATUS_MAP[orderStatus] || ORDER_STATUS_MAP[0];
  
  // 穩定 order.createdAt 的引用
  const orderCreatedAt = order?.createdAt;

  // 判斷訂單類型（買幣/賣幣）- 從掛單列表中取得
  const orderType = React.useMemo(() => {
    if (!order?.orderId) return null;
    const allOrders = [...buyOrders, ...sellOrders];
    const pendingOrder = allOrders.find((po) => po.id === order.orderId);
    if (pendingOrder) {
      // type: 0=買幣, 1=賣幣
      return pendingOrder.type === 0 ? 'buy' : 'sell';
    }
    return null;
  }, [order?.orderId, buyOrders, sellOrders]);

  // 判斷當前用戶是否需要付款
  // 邏輯：如果掛單類型是 1（賣幣），表示是其他用戶建立的賣幣掛單，當前用戶是買方，需要付款
  //       如果掛單類型是 0（買幣），表示是其他用戶建立的買幣掛單，當前用戶是賣方，不需要付款
  const needsPayment = React.useMemo(() => {
    if (!orderType) return false;
    // 掛單 type = 1（賣幣）→ 當前用戶是買方 → 需要付款
    // 掛單 type = 0（買幣）→ 當前用戶是賣方 → 不需要付款
    return orderType === 'sell';
  }, [orderType]);

  // 判斷當前用戶是買方還是賣方（用於顯示不同的 UI）
  // order.userId 是建立訂單的使用者（買方）
  const isBuyer = React.useMemo(() => {
    return order?.userId === user?.id;
  }, [order?.userId, user?.id]);
  
  const isSeller = !isBuyer; // 賣方是掛單建立者

  // 從訂單中取得收款資訊
  const sellerInfo = React.useMemo(() => {
    if (!order) return null;
    
    // 從 order 中取得 bankCard 資訊（檢查多種可能的欄位名稱）
    const orderAny = order as any;
    const bankCard = orderAny.bankCard || orderAny.bankcard;
    
    if (bankCard) {
      return {
        name: orderAny.sellerName || orderAny.seller?.name || '未知',
        bankName: bankCard.bankName || bankCard.bank?.bankName || '未知',
        branchName: bankCard.branchName || '',
        cardNumber: bankCard.cardNumber || '',
        cardHolderName: bankCard.cardHolderName || bankCard.name || '',
      };
    }
    
    return null;
  }, [order]);

  // 狀態
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showRecipientInfo, setShowRecipientInfo] = useState(true);
  const [showOrderInfo, setShowOrderInfo] = useState(true);

  // 倒計時 timer
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 使用 ref 追蹤是否已經初始化過，避免重複呼叫
  const hasInitialized = useRef(false);
  const isFetching = useRef(false);

  // 當頁面聚焦時，刷新訂單列表、掛單列表和銀行卡列表以取得最新資料
  useFocusEffect(
    React.useCallback(() => {
      // 如果正在載入中，則不重複呼叫
      if (isFetching.current) {
        return;
      }

      // 如果已經初始化過，則不重複呼叫（除非需要強制刷新）
      if (hasInitialized.current) {
        return;
      }

      logger.info('OrderDetailScreen - 取得訂單列表、掛單列表和銀行卡列表');
      hasInitialized.current = true;
      isFetching.current = true;
      
      dispatch(fetchOrderListRequest({ size: 100, page: 1 }));
      dispatch(fetchBuyOrdersRequest({ page: 1, size: 100 }));
      dispatch(fetchSellOrdersRequest({ page: 1, size: 100 }));
      dispatch(fetchBankCardsRequest());
      
      // 清理函數：當頁面失去焦點時重置標記
      return () => {
        hasInitialized.current = false;
        isFetching.current = false;
      };
    }, [dispatch])
  );
  
  // 當載入完成時，重置 isFetching 標記
  React.useEffect(() => {
    if (!orderListLoading && isFetching.current) {
      isFetching.current = false;
    }
  }, [orderListLoading]);

  // 計算付款剩餘時間（假設從建立時間開始計算 30 分鐘）
  useEffect(() => {
    if (!orderCreatedAt || orderStatus !== 0) {
      // 清除 timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setTimeRemaining(null);
      return;
    }

    const calculateTimeRemaining = () => {
      const createdAt = new Date(orderCreatedAt).getTime();
      const now = Date.now();
      const thirtyMinutes = 30 * 60 * 1000; // 30 分鐘
      const elapsed = now - createdAt;
      const remaining = Math.max(0, thirtyMinutes - elapsed);
      return Math.floor(remaining / 1000); // 轉換為秒
    };

    setTimeRemaining(calculateTimeRemaining());

    // 清除舊的 timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // 每秒更新倒計時
    timerRef.current = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);
      if (remaining <= 0) {
        // 時間到，清除 timer 並刷新訂單列表（僅一次）
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        // 重置初始化標記，允許刷新
        hasInitialized.current = false;
        dispatch(fetchOrderListRequest({ size: 100, page: 1 }));
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [orderCreatedAt, orderStatus, dispatch]);

  // 格式化時間（MM:SS）
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // 格式化日期時間
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // 複製到剪貼板
  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    Alert.alert('已複製', `${label}已複製到剪貼板`);
  };

  // 標記已付款（買方操作）
  const handleMarkAsPaid = () => {
    Alert.alert(
      '確認',
      '確定已付款？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '確定',
          onPress: async () => {
            setLoading(true);
            try {
              await ordersApi.markOrderAsPaid(orderId);
              Alert.alert('成功', '已標記為已付款，等待賣方確認', [
                {
                  text: '確定',
                  onPress: () => {
                    hasInitialized.current = false; // 允許刷新
                    dispatch(fetchOrderListRequest({ size: 100, page: 1 }));
                  },
                },
              ]);
            } catch (error: any) {
              const errorMessage = error.response?.data?.message || error.message || '操作失敗，請稍後再試';
              Alert.alert('錯誤', errorMessage);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // 確認放行（賣方操作）
  const handleConfirmRelease = () => {
    Alert.alert(
      '確認',
      '確定已收到款項並放行？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '確定',
          onPress: async () => {
            setLoading(true);
            try {
              await ordersApi.applyOrder(orderId);
              Alert.alert('成功', '已確認收款並放行，訂單已完成', [
                {
                  text: '確定',
                  onPress: () => {
                    hasInitialized.current = false; // 允許刷新
                    dispatch(fetchOrderListRequest({ size: 100, page: 1 }));
                  },
                },
              ]);
            } catch (error: any) {
              const errorMessage = error.response?.data?.message || error.message || '操作失敗，請稍後再試';
              Alert.alert('錯誤', errorMessage);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // 取消訂單
  const handleCancelOrder = () => {
    Alert.prompt(
      '取消訂單',
      '請輸入取消原因',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '確定',
          onPress: async (reason: string | undefined) => {
            if (!reason || reason.trim() === '') {
              Alert.alert('錯誤', '請輸入取消原因');
              return;
            }
            setLoading(true);
            try {
              await ordersApi.rejectOrder(orderId, { cancelReason: reason });
              Alert.alert('成功', '訂單已取消', [
                {
                  text: '確定',
                  onPress: () => {
                    dispatch(fetchOrderListRequest({ size: 100, page: 1 }));
                    navigation.goBack();
                  },
                },
              ]);
            } catch (error: any) {
              const errorMessage = error.response?.data?.message || error.message || '操作失敗，請稍後再試';
              Alert.alert('錯誤', errorMessage);
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  if (!order) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>訂單詳情</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>載入中...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* 頂部導航欄（白色） */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹</Text>
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{statusInfo.label}</Text>
          {orderType && (
            <View style={[
              styles.orderTypeBadge,
              orderType === 'buy' ? styles.orderTypeBuy : styles.orderTypeSell
            ]}>
              <Text style={styles.orderTypeText}>
                {orderType === 'buy' ? '買幣' : '賣幣'}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 付款資訊區塊 - 僅需要付款的用戶在待付款狀態時顯示 */}
        {orderStatus === 0 && needsPayment && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>付款給賣家</Text>
            {timeRemaining !== null && timeRemaining > 0 && (
              <View style={styles.timeRemainingRow}>
                <Text style={styles.timeRemainingLabel}>付款剩餘時間</Text>
                <Text style={[styles.timeRemainingValue, { color: theme.status.error }]}>
                  {formatTime(timeRemaining)}
                </Text>
              </View>
            )}
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>付款金額</Text>
              <View style={styles.amountValueRow}>
                <Text style={styles.amountValue}>¥ {order.amount.toLocaleString('zh-TW')}</Text>
                <Pressable
                  onPress={() => copyToClipboard(order.amount.toString(), '付款金額')}
                  style={styles.copyButton}
                >
                  <Text style={styles.copyIcon}>📋</Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>數量</Text>
              <Text style={styles.infoValue}>{order.amount.toLocaleString('zh-TW')} E幣</Text>
            </View>
            {bankCards && bankCards.length > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>交易帳戶</Text>
                <Text style={styles.infoValue}>
                  {bankCards[0].bank?.bankName} ({bankCards[0].cardNumber.slice(-4)})
                </Text>
              </View>
            )}
          </View>
        )}

        {/* 等待買方付款區塊 - 僅賣方在待付款狀態時顯示 */}
        {orderStatus === 0 && isSeller && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>等待買方付款</Text>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>收款金額</Text>
              <View style={styles.amountValueRow}>
                <Text style={styles.amountValue}>¥ {order.amount.toLocaleString('zh-TW')}</Text>
                <Pressable
                  onPress={() => copyToClipboard(order.amount.toString(), '收款金額')}
                  style={styles.copyButton}
                >
                  <Text style={styles.copyIcon}>📋</Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>數量</Text>
              <Text style={styles.infoValue}>{order.amount.toLocaleString('zh-TW')} E幣</Text>
            </View>
            <Text style={styles.hintText}>
              買方正在付款中，請耐心等待。買方付款完成後，訂單狀態將變更為「待放行」。
            </Text>
          </View>
        )}

        {/* 等待賣方確認區塊 - 僅買方在待放行狀態時顯示 */}
        {orderStatus === 1 && isBuyer && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>等待賣方確認</Text>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>付款金額</Text>
              <Text style={styles.amountValue}>¥ {order.amount.toLocaleString('zh-TW')}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>數量</Text>
              <Text style={styles.infoValue}>{order.amount.toLocaleString('zh-TW')} E幣</Text>
            </View>
            <Text style={styles.hintText}>
              您已標記為已付款，等待賣方確認收款並放行。確認後訂單將自動完成。
            </Text>
          </View>
        )}

        {/* 等待確認放行區塊 - 僅賣方在待放行狀態時顯示 */}
        {orderStatus === 1 && isSeller && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>等待確認放行</Text>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>收款金額</Text>
              <Text style={styles.amountValue}>¥ {order.amount.toLocaleString('zh-TW')}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>數量</Text>
              <Text style={styles.infoValue}>{order.amount.toLocaleString('zh-TW')} E幣</Text>
            </View>
            <Text style={styles.hintText}>
              買方已標記為已付款，請確認您已收到款項。確認後將放行並完成訂單。
            </Text>
          </View>
        )}

        {/* 訂單已完成區塊 */}
        {orderStatus === 2 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>訂單已完成</Text>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>{isBuyer ? '付款金額' : '收款金額'}</Text>
              <Text style={styles.amountValue}>¥ {order.amount.toLocaleString('zh-TW')}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>數量</Text>
              <Text style={styles.infoValue}>{order.amount.toLocaleString('zh-TW')} E幣</Text>
            </View>
            {order.updatedAt && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>完成時間</Text>
                <Text style={styles.infoValue}>{formatDateTime(order.updatedAt)}</Text>
              </View>
            )}
            <Text style={styles.hintText}>
              訂單已成功完成，交易已完成。
            </Text>
          </View>
        )}

        {/* 收款資訊區塊 - 僅需要付款的用戶在待付款狀態時顯示 */}
        {orderStatus === 0 && needsPayment && sellerInfo && (
          <View style={styles.section}>
            <Pressable
              onPress={() => setShowRecipientInfo(!showRecipientInfo)}
              style={styles.sectionHeader}
            >
              <Text style={styles.sectionTitle}>收款資訊</Text>
              <Text style={styles.collapseIcon}>{showRecipientInfo ? '▲' : '▼'}</Text>
            </Pressable>
            {showRecipientInfo && (
              <>
                <Text style={styles.hintText}>
                  以下為賣方的收款資訊，請使用您選擇的交易帳戶進行轉帳，否則不予以放行
                </Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>賣家姓名</Text>
                <View style={styles.infoValueRow}>
                  <Text style={styles.infoValue}>{sellerInfo.name}</Text>
                  <Pressable
                    onPress={() => copyToClipboard(sellerInfo.name, '賣家姓名')}
                    style={styles.copyButton}
                  >
                    <Text style={styles.copyIcon}>📋</Text>
                  </Pressable>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>開戶行</Text>
                <View style={styles.infoValueRow}>
                  <Text style={styles.infoValue}>{sellerInfo.bankName}</Text>
                  <Pressable
                    onPress={() => copyToClipboard(sellerInfo.bankName, '開戶行')}
                    style={styles.copyButton}
                  >
                    <Text style={styles.copyIcon}>📋</Text>
                  </Pressable>
                </View>
              </View>
              {sellerInfo.branchName && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>開戶支行</Text>
                  <View style={styles.infoValueRow}>
                    <Text style={styles.infoValue}>{sellerInfo.branchName}</Text>
                    <Pressable
                      onPress={() => copyToClipboard(sellerInfo.branchName, '開戶支行')}
                      style={styles.copyButton}
                    >
                      <Text style={styles.copyIcon}>📋</Text>
                    </Pressable>
                  </View>
                </View>
              )}
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>銀行卡卡號</Text>
                <View style={styles.infoValueRow}>
                  <Text style={styles.infoValueMonospace}>
                    {sellerInfo.cardNumber.replace(/(.{4})/g, '$1 ').trim()}
                  </Text>
                  <Pressable
                    onPress={() => copyToClipboard(sellerInfo.cardNumber, '銀行卡卡號')}
                    style={styles.copyButton}
                  >
                    <Text style={styles.copyIcon}>📋</Text>
                  </Pressable>
                </View>
              </View>
              {sellerInfo.cardHolderName && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>戶名</Text>
                  <View style={styles.infoValueRow}>
                    <Text style={styles.infoValue}>{sellerInfo.cardHolderName}</Text>
                    <Pressable
                      onPress={() => copyToClipboard(sellerInfo.cardHolderName, '戶名')}
                      style={styles.copyButton}
                    >
                      <Text style={styles.copyIcon}>📋</Text>
                    </Pressable>
                  </View>
                </View>
              )}
              </>
            )}
          </View>
        )}

        {/* 訂單資訊區塊（可摺疊） */}
        <View style={styles.section}>
          <Pressable
            onPress={() => setShowOrderInfo(!showOrderInfo)}
            style={styles.sectionHeader}
          >
            <Text style={styles.sectionTitle}>訂單資訊</Text>
            <Text style={styles.collapseIcon}>{showOrderInfo ? '▲' : '▼'}</Text>
          </Pressable>
          {showOrderInfo && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>訂單編號</Text>
                <View style={styles.infoValueRow}>
                  <Text style={styles.infoValueMonospace}>{order.id}</Text>
                  <Pressable
                    onPress={() => copyToClipboard(order.id, '訂單編號')}
                    style={styles.copyButton}
                  >
                    <Text style={styles.copyIcon}>📋</Text>
                  </Pressable>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>訂單成立時間</Text>
                <View style={styles.infoValueRow}>
                  <Text style={styles.infoValue}>{formatDateTime(order.createdAt)}</Text>
                  <Pressable
                    onPress={() => copyToClipboard(formatDateTime(order.createdAt), '訂單成立時間')}
                    style={styles.copyButton}
                  >
                    <Text style={styles.copyIcon}>📋</Text>
                  </Pressable>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* 底部按鈕 */}
      {/* 需要付款的用戶：待付款狀態 - 顯示「我已付款」和「取消訂單」 */}
      {orderStatus === 0 && needsPayment && (
        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.buttonPrimary, loading && styles.buttonDisabled]}
            onPress={handleMarkAsPaid}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={theme.background.primary} />
            ) : (
              <Text style={styles.buttonPrimaryText}>我已付款</Text>
            )}
          </Pressable>
          <Pressable
            style={[styles.buttonSecondary, loading && styles.buttonDisabled]}
            onPress={handleCancelOrder}
            disabled={loading}
          >
            <Text style={styles.buttonSecondaryText}>取消訂單</Text>
          </Pressable>
        </View>
      )}

      {/* 賣方：待放行狀態 - 顯示「確認放行」 */}
      {orderStatus === 1 && isSeller && (
        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.buttonPrimary, loading && styles.buttonDisabled]}
            onPress={handleConfirmRelease}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={theme.background.primary} />
            ) : (
              <Text style={styles.buttonPrimaryText}>確認放行</Text>
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.secondary,
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 60,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.default,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 32,
    color: theme.secondary,
    fontWeight: '300',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '600',
    color: theme.secondary,
  },
  orderTypeBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
  },
  orderTypeBuy: {
    backgroundColor: theme.status.info,
  },
  orderTypeSell: {
    backgroundColor: theme.status.warning,
  },
  orderTypeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: theme.background.primary,
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: theme.background.primary,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.text.primary,
  },
  collapseIcon: {
    fontSize: theme.fontSize.md,
    color: theme.text.tertiary,
  },
  timeRemainingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.background.tertiary,
    borderRadius: theme.radius.lg,
  },
  timeRemainingLabel: {
    fontSize: theme.fontSize.md,
    color: theme.text.secondary,
  },
  timeRemainingValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: '600',
  },
  amountRow: {
    marginBottom: theme.spacing.md,
  },
  amountLabel: {
    fontSize: theme.fontSize.md,
    color: theme.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  amountValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountValue: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '600',
    color: theme.text.primary,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  infoLabel: {
    fontSize: theme.fontSize.md,
    color: theme.text.secondary,
  },
  infoValue: {
    fontSize: theme.fontSize.md,
    color: theme.text.primary,
    fontWeight: '500',
  },
  infoValueMonospace: {
    fontSize: theme.fontSize.md,
    color: theme.text.primary,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  infoValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyButton: {
    marginLeft: theme.spacing.sm,
    padding: theme.spacing.xs,
  },
  copyIcon: {
    fontSize: theme.fontSize.md,
  },
  hintText: {
    fontSize: theme.fontSize.sm,
    color: theme.text.tertiary,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  buttonContainer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.background.primary,
    borderTopWidth: 1,
    borderTopColor: theme.border.default,
  },
  buttonPrimary: {
    ...commonStyles.buttonPrimary,
    marginBottom: theme.spacing.md,
  },
  buttonPrimaryText: {
    ...commonStyles.buttonPrimaryText,
  },
  buttonSecondary: {
    backgroundColor: theme.background.secondary,
    height: 48,
    borderRadius: theme.radius.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border.default,
  },
  buttonSecondaryText: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.text.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.text.secondary,
  },
});

