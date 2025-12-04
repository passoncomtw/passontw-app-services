/**
 * ConfirmOrderBuyScreen - 購買確認訂單頁面
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  StatusBar, 
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

type ConfirmOrderBuyRouteProp = RouteProp<{ 
  ConfirmOrderBuy: { 
    orderNumber: string;
    amount: number;
    totalPrice: number;
    sellerName: string;
    paymentTimeout: number;
    bankName: string;
    bankAccount: string;
    accountHolder: string;
  } 
}, 'ConfirmOrderBuy'>;

export default function ConfirmOrderBuyScreen() {
  const navigation = useNavigation();
  const route = useRoute<ConfirmOrderBuyRouteProp>();
  
  // 從路由參數獲取訂單資訊，如果沒有則使用預設值
  const {
    orderNumber = '202311250001',
    amount = 1000,
    totalPrice = 1000,
    sellerName = '張三',
    paymentTimeout = 15,
    bankName = '中國銀行',
    bankAccount = '6217 **** **** 1234',
    accountHolder = '張三',
  } = route.params || {};

  // 倒計時（秒）
  const [timeLeft, setTimeLeft] = useState(paymentTimeout * 60);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          Alert.alert('超時', '付款時間已超過，訂單已取消');
          navigation.goBack();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 格式化倒計時
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('zh-TW');
  };

  const handlePaid = () => {
    Alert.alert(
      '確認付款',
      '請確認您已完成付款',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '確認', 
          onPress: () => {
            Alert.alert('成功', '已標記為已付款，等待賣家確認');
            navigation.navigate('HomeTabs' as never);
          }
        },
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert(
      '取消訂單',
      '確定要取消訂單嗎？',
      [
        { text: '否', style: 'cancel' },
        { 
          text: '是', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('已取消', '訂單已取消');
            navigation.navigate('HomeTabs' as never);
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* 頂部導航 */}
      <View style={styles.topBar}>
        <Pressable 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </Pressable>
        <Text style={styles.topBarTitle}>確認訂單</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 倒計時區域 */}
        <View style={styles.section}>
          <View style={styles.timerContainer}>
            <Text style={styles.timerIcon}>⏰</Text>
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            <Text style={styles.timerHint}>請在期限內完成付款</Text>
          </View>
        </View>

        {/* 訂單資訊 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>訂單資訊</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>訂單編號</Text>
            <Text style={styles.rowValue}>{orderNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>數量</Text>
            <Text style={styles.rowValue}>{formatNumber(amount)} E幣</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>交易金額</Text>
            <Text style={styles.priceText}>CNY ¥{formatNumber(totalPrice)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>賣家暱稱</Text>
            <Text style={styles.rowValue}>{sellerName}</Text>
          </View>
        </View>

        {/* 賣家收款資訊 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>賣家收款資訊</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>銀行名稱</Text>
            <Text style={styles.rowValue}>{bankName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>卡號</Text>
            <Text style={styles.rowValue}>{bankAccount}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>戶名</Text>
            <Text style={styles.rowValue}>{accountHolder}</Text>
          </View>
          <Text style={styles.hint}>
            請務必使用您選擇的交易帳戶進行轉帳，並在備註欄填寫訂單編號
          </Text>
        </View>

        {/* 操作按鈕 */}
        <View style={styles.buttonContainer}>
          <Pressable 
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handlePaid}
          >
            <Text style={styles.primaryButtonText}>我已付款</Text>
          </Pressable>
          <Pressable 
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleCancel}
          >
            <Text style={styles.secondaryButtonText}>取消訂單</Text>
          </Pressable>
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
    paddingVertical: 12,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
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
    color: '#007AFF',
    fontWeight: '300',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
  },
  timerContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  timerIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  timerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 8,
  },
  timerHint: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rowLabel: {
    fontSize: 14,
    color: '#999',
  },
  rowValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  priceText: {
    fontSize: 16,
    color: '#E9967A',
    fontWeight: 'bold',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    lineHeight: 18,
  },
  buttonContainer: {
    padding: 16,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonPressed: {
    opacity: 0.9,
  },
});

