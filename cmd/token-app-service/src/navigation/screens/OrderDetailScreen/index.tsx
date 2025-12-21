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

  const { orderId } = route.params;

  // 從訂單列表中找對應的訂單（使用 useMemo 穩定引用）
  const order = React.useMemo(() => {
    return orderList.find((o) => o.id === orderId);
  }, [orderList, orderId]);
  
  const orderStatus = order?.status ?? 0;
  const statusInfo = ORDER_STATUS_MAP[orderStatus] || ORDER_STATUS_MAP[0];
  
  // 穩定 order.createdAt 的引用
  const orderCreatedAt = order?.createdAt;

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

      logger.info('OrderDetailScreen - 取得訂單列表和銀行卡列表');
      hasInitialized.current = true;
      isFetching.current = true;
      
      dispatch(fetchOrderListRequest({ size: 100, page: 1 }));
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

  // 標記已付款
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
              Alert.alert('成功', '已標記為已付款', [
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
        <Text style={styles.headerTitle}>{statusInfo.label}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 付款給賣家區塊 */}
        {orderStatus === 0 && (
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

        <View style={styles.section}>
          <Pressable
            onPress={() => setShowRecipientInfo(!showRecipientInfo)}
            style={styles.sectionHeader}
          >
            <Text style={styles.sectionTitle}>收款資訊</Text>
            <Text style={styles.collapseIcon}>{showRecipientInfo ? '▲' : '▼'}</Text>
          </Pressable>
          {showRecipientInfo && sellerInfo && (
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
      {orderStatus === 0 && (
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
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '600',
    color: theme.secondary,
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

