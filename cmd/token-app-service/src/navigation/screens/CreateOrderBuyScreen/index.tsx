/**
 * CreateOrderBuyScreen - 購買e幣頁面
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  StatusBar, 
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

type CreateOrderBuyRouteProp = RouteProp<{ 
  CreateOrderBuy: { 
    sellerName: string;
    minAmount: number;
    maxAmount: number;
    price: number;
    paymentMethod: string;
    paymentTimeout: number;
  } 
}, 'CreateOrderBuy'>;

export default function CreateOrderBuyScreen() {
  const navigation = useNavigation();
  const route = useRoute<CreateOrderBuyRouteProp>();
  
  // 從路由參數獲取交易資訊，如果沒有則使用預設值
  const {
    sellerName = '張三',
    minAmount = 100,
    maxAmount = 5000,
    price = 1.00,
    paymentMethod = '銀行卡',
    paymentTimeout = 15,
  } = route.params || {};

  const [amount, setAmount] = useState('1000');
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [transactionPassword, setTransactionPassword] = useState('');

  // 計算交易金額
  const totalPrice = parseFloat(amount || '0') * price;

  const formatNumber = (num: number) => {
    return num.toLocaleString('zh-TW');
  };

  const handleSelectAccount = () => {
    // TODO: 導航到選擇帳戶頁面
    Alert.alert('選擇帳戶', '功能開發中...');
  };

  const handleSubmit = () => {
    // 驗證
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum)) {
      Alert.alert('錯誤', '請輸入購買數量');
      return;
    }
    if (amountNum < minAmount || amountNum > maxAmount) {
      Alert.alert('錯誤', `數量必須在 ${formatNumber(minAmount)} - ${formatNumber(maxAmount)} 之間`);
      return;
    }
    if (!selectedAccount) {
      Alert.alert('錯誤', '請選擇付款帳戶');
      return;
    }
    if (!transactionPassword) {
      Alert.alert('錯誤', '請輸入交易密碼');
      return;
    }

    // TODO: 提交訂單
    Alert.alert('確認購買', `確定購買 ${formatNumber(amountNum)} E幣？`, [
      { text: '取消', style: 'cancel' },
      { text: '確定', onPress: () => {
        Alert.alert('成功', '訂單已提交');
        navigation.goBack();
      }},
    ]);
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
        <Text style={styles.topBarTitle}>購買e幣</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView 
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 主要表單區域 */}
          <View style={styles.section}>
            {/* 可交易數量提示 */}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                可交易數量: <Text style={styles.infoTextBold}>{formatNumber(minAmount)} - {formatNumber(maxAmount)}</Text>
              </Text>
            </View>

            {/* 數量輸入 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>數量</Text>
              <View style={styles.inputField}>
                <TextInput
                  style={styles.input}
                  placeholder="請輸入購買數量"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* 交易金額 */}
            <View style={styles.row}>
              <Text style={styles.rowLabel}>交易金額</Text>
              <Text style={styles.priceText}>CNY ¥{formatNumber(totalPrice)}</Text>
            </View>

            {/* 交易帳戶 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>交易帳戶</Text>
              <Pressable 
                style={({ pressed }) => [
                  styles.selectField,
                  pressed && styles.selectFieldPressed,
                ]}
                onPress={handleSelectAccount}
              >
                <Text style={selectedAccount ? styles.selectText : styles.selectPlaceholder}>
                  {selectedAccount || '請選擇付款帳戶'}
                </Text>
                <Text style={styles.selectArrow}>›</Text>
              </Pressable>
              <Text style={styles.hint}>
                賣方將以您提供的交易帳戶進行到賬確認，請務必以選擇的交易帳戶進行支付，否則不予以放行
              </Text>
            </View>

            {/* 交易密碼 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>交易密碼</Text>
              <View style={styles.inputField}>
                <TextInput
                  style={styles.input}
                  placeholder="請輸入交易密碼"
                  value={transactionPassword}
                  onChangeText={setTransactionPassword}
                  secureTextEntry
                />
              </View>
            </View>

            {/* 購買按鈕 */}
            <Pressable 
              style={({ pressed }) => [
                styles.submitButton,
                pressed && styles.submitButtonPressed,
              ]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>購買e幣</Text>
            </Pressable>
          </View>

          {/* 交易資訊區域 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>交易資訊</Text>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>付款期限</Text>
              <Text style={styles.rowValue}>{paymentTimeout} 分鐘</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>賣家暱稱</Text>
              <Text style={styles.rowValue}>{sellerName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>收付方式</Text>
              <Text style={styles.rowValue}>{paymentMethod}</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  flex1: {
    flex: 1,
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
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
  },
  infoTextBold: {
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputField: {
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  input: {
    fontSize: 16,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  selectField: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 4,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  selectFieldPressed: {
    backgroundColor: '#F8F8F8',
  },
  selectText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  selectPlaceholder: {
    fontSize: 16,
    color: '#999',
    flex: 1,
  },
  selectArrow: {
    fontSize: 24,
    color: '#CCC',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonPressed: {
    opacity: 0.9,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
});

