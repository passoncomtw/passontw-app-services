/**
 * CreateOrderSellScreen - 出售e幣頁面
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
  Modal,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAppSelector } from '@/navigation/store/hooks';

// 帳戶類型
interface PaymentAccount {
  id: string;
  type: 'bank' | 'alipay' | 'wechat';
  name: string;
  accountNumber: string;
  bankName?: string;
}

// 模擬帳戶資料
const mockAccounts: PaymentAccount[] = [
  {
    id: '1',
    type: 'bank',
    name: '王小明',
    accountNumber: '6217 **** **** 5678',
    bankName: '中國銀行',
  },
  {
    id: '2',
    type: 'bank',
    name: '王小明',
    accountNumber: '6222 **** **** 9012',
    bankName: '工商銀行',
  },
  {
    id: '3',
    type: 'alipay',
    name: '王小明',
    accountNumber: '138****8888',
  },
  {
    id: '4',
    type: 'wechat',
    name: '王小明',
    accountNumber: 'wxid_****abcd',
  },
];

type CreateOrderSellRouteProp = RouteProp<{ 
  CreateOrderSell: { 
    buyerName: string;
    minAmount: number;
    maxAmount: number;
    price: number;
    paymentMethod: string;
    paymentTimeout: number;
  } 
}, 'CreateOrderSell'>;

export default function CreateOrderSellScreen() {
  const navigation = useNavigation();
  const route = useRoute<CreateOrderSellRouteProp>();
  const { user } = useAppSelector((state) => state.auth);
  
  // 從路由參數獲取交易資訊，如果沒有則使用預設值
  const {
    buyerName = '趙六',
    minAmount = 100,
    maxAmount = 6000,
    price = 1.00,
    paymentMethod = '銀行卡',
    paymentTimeout = 15,
  } = route.params || {};

  // 從用戶資料獲取可用餘額
  const availableBalance = user?.wallet?.usefulBalance || 10000;

  const [amount, setAmount] = useState('1000');
  const [selectedAccount, setSelectedAccount] = useState<PaymentAccount | null>(null);
  const [transactionPassword, setTransactionPassword] = useState('');
  const [showAccountModal, setShowAccountModal] = useState(false);

  // 計算交易金額
  const totalPrice = parseFloat(amount || '0') * price;

  const formatNumber = (num: number) => {
    return num.toLocaleString('zh-TW');
  };

  // 取得帳戶類型圖標
  const getAccountTypeIcon = (type: PaymentAccount['type']) => {
    switch (type) {
      case 'bank': return '🏦';
      case 'alipay': return '💳';
      case 'wechat': return '💬';
      default: return '💰';
    }
  };

  // 取得帳戶類型名稱
  const getAccountTypeName = (type: PaymentAccount['type']) => {
    switch (type) {
      case 'bank': return '銀行卡';
      case 'alipay': return '支付寶';
      case 'wechat': return '微信';
      default: return '其他';
    }
  };

  const handleSelectAccount = () => {
    setShowAccountModal(true);
  };

  const handleAccountSelect = (account: PaymentAccount) => {
    setSelectedAccount(account);
    setShowAccountModal(false);
  };

  const handleSubmit = () => {
    // 驗證
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum)) {
      Alert.alert('錯誤', '請輸入出售數量');
      return;
    }
    if (amountNum < minAmount || amountNum > maxAmount) {
      Alert.alert('錯誤', `數量必須在 ${formatNumber(minAmount)} - ${formatNumber(maxAmount)} 之間`);
      return;
    }
    if (amountNum > availableBalance) {
      Alert.alert('錯誤', '出售數量超過可用餘額');
      return;
    }
    if (!selectedAccount) {
      Alert.alert('錯誤', '請選擇收款帳戶');
      return;
    }
    if (!transactionPassword) {
      Alert.alert('錯誤', '請輸入交易密碼');
      return;
    }

    // 提交訂單後跳轉到確認頁面
    Alert.alert('確認出售', `確定出售 ${formatNumber(amountNum)} E幣？`, [
      { text: '取消', style: 'cancel' },
      { text: '確定', onPress: () => {
        // 生成訂單編號
        const orderNumber = `${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        
        navigation.navigate('ConfirmOrderSell', {
          orderNumber,
          amount: amountNum,
          totalPrice,
          buyerName,
          paymentTimeout,
          bankName: selectedAccount?.bankName || getAccountTypeName(selectedAccount!.type),
          bankAccount: selectedAccount!.accountNumber,
        });
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
        <Text style={styles.topBarTitle}>出售e幣</Text>
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
                  placeholder="請輸入出售數量"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                />
              </View>
              <Text style={styles.balanceHint}>
                e幣可用餘額 {formatNumber(availableBalance)}
              </Text>
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
                {selectedAccount ? (
                  <View style={styles.selectedAccountInfo}>
                    <Text style={styles.selectedAccountIcon}>
                      {getAccountTypeIcon(selectedAccount.type)}
                    </Text>
                    <View style={styles.selectedAccountDetails}>
                      <Text style={styles.selectedAccountType}>
                        {selectedAccount.bankName || getAccountTypeName(selectedAccount.type)}
                      </Text>
                      <Text style={styles.selectedAccountNumber}>
                        {selectedAccount.accountNumber}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.selectPlaceholder}>請選擇收款帳戶</Text>
                )}
                <Text style={styles.selectArrow}>›</Text>
              </Pressable>
              <Text style={styles.hint}>
                買方將以您提供的交易帳戶進行打款
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

            {/* 出售按鈕 */}
            <Pressable 
              style={({ pressed }) => [
                styles.submitButton,
                pressed && styles.submitButtonPressed,
              ]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>出售e幣</Text>
            </Pressable>
          </View>

          {/* 交易資訊區域 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>交易資訊</Text>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>收款期限</Text>
              <Text style={styles.rowValue}>{paymentTimeout} 分鐘</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>買家暱稱</Text>
              <Text style={styles.rowValue}>{buyerName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>收付方式</Text>
              <Text style={styles.rowValue}>{paymentMethod}</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 帳戶選擇 Modal */}
      <Modal
        visible={showAccountModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAccountModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>選擇收款帳戶</Text>
              <TouchableOpacity 
                onPress={() => setShowAccountModal(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={mockAccounts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.accountItem,
                    selectedAccount?.id === item.id && styles.accountItemSelected,
                  ]}
                  onPress={() => handleAccountSelect(item)}
                >
                  <Text style={styles.accountIcon}>
                    {getAccountTypeIcon(item.type)}
                  </Text>
                  <View style={styles.accountInfo}>
                    <Text style={styles.accountType}>
                      {item.bankName || getAccountTypeName(item.type)}
                    </Text>
                    <Text style={styles.accountNumber}>{item.accountNumber}</Text>
                    <Text style={styles.accountName}>{item.name}</Text>
                  </View>
                  {selectedAccount?.id === item.id && (
                    <Text style={styles.accountCheckmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.accountSeparator} />}
              style={styles.accountList}
            />
          </View>
        </View>
      </Modal>
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
  balanceHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
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
  // 選中帳戶樣式
  selectedAccountInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedAccountIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  selectedAccountDetails: {
    flex: 1,
  },
  selectedAccountType: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  selectedAccountNumber: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  // Modal 樣式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 18,
    color: '#999',
  },
  accountList: {
    paddingHorizontal: 16,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  accountItemSelected: {
    backgroundColor: '#E3F2FD',
  },
  accountIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountType: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    marginBottom: 2,
  },
  accountNumber: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  accountName: {
    fontSize: 12,
    color: '#999',
  },
  accountCheckmark: {
    fontSize: 20,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  accountSeparator: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
});

