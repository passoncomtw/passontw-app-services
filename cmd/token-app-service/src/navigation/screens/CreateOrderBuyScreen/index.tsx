/**
 * CreateOrderBuyScreen - 購買掛單頁面
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
import { useNavigation } from '@react-navigation/native';

// 帳戶類型
interface PaymentAccount {
  id: string;
  type: 'bank' | 'alipay' | 'wechat';
  name: string;
  accountNumber: string;
  bankName?: string;
}

// 模擬帳戶資料（之後會從 API 取得）
const mockAccounts: PaymentAccount[] = [
  {
    id: '1',
    type: 'bank',
    name: '王小明',
    accountNumber: '6217 **** **** 1234',
    bankName: '中國銀行',
  },
  {
    id: '2',
    type: 'bank',
    name: '王小明',
    accountNumber: '6222 **** **** 5678',
    bankName: '工商銀行',
  },
];

export default function CreateOrderBuyScreen() {
  const navigation = useNavigation();
  
  const [amount, setAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<PaymentAccount | null>(null);
  const [isSplit, setIsSplit] = useState<boolean>(true);
  const [minAmount, setMinAmount] = useState('');
  const [paymentTimeout, setPaymentTimeout] = useState<number>(15);
  const [transactionPassword, setTransactionPassword] = useState('');
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);

  // 計算交易金額（假設 1 E幣 = 1 CNY）
  const totalPrice = parseFloat(amount || '0') * 1;

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

  const handleSelectSplit = () => {
    setShowSplitModal(true);
  };

  const handleSplitSelect = (value: boolean) => {
    setIsSplit(value);
    setShowSplitModal(false);
  };

  const handleSelectTimeout = () => {
    setShowTimeoutModal(true);
  };

  const handleTimeoutSelect = (minutes: number) => {
    setPaymentTimeout(minutes);
    setShowTimeoutModal(false);
  };

  const handleSubmit = () => {
    // 驗證
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('錯誤', '請輸入購買數量');
      return;
    }
    if (!selectedAccount) {
      Alert.alert('錯誤', '請選擇付款帳戶');
      return;
    }
    const minAmountNum = parseFloat(minAmount);
    if (!minAmount || isNaN(minAmountNum) || minAmountNum <= 0) {
      Alert.alert('錯誤', '請輸入最小交易量');
      return;
    }
    if (minAmountNum > amountNum) {
      Alert.alert('錯誤', '最小交易量不能大於購買數量');
      return;
    }
    if (!transactionPassword) {
      Alert.alert('錯誤', '請輸入交易密碼');
      return;
    }

    // TODO: 透過 saga 調用 API 建立掛單
    Alert.alert('確認購買', `確定建立購買掛單？`, [
      { text: '取消', style: 'cancel' },
      { text: '確定', onPress: () => {
        // TODO: 實作建立掛單 API
        console.log('建立購買掛單', {
          amount: amountNum,
          minAmount: minAmountNum,
          isSplit,
          paymentTimeout,
          bankcardId: selectedAccount.id,
        });
        // 建立成功後返回上一頁
        navigation.goBack();
      }},
    ]);
  };

  const timeoutOptions = [15, 30, 45, 60];

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
        <Text style={styles.topBarTitle}>掛單/購買</Text>
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
            {/* 數量輸入 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>數量</Text>
              <View style={styles.inputRow}>
                <View style={styles.inputField}>
                  <TextInput
                    style={styles.input}
                    placeholder="請輸入購買數量"
                    placeholderTextColor="#999"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                  />
                </View>
                <Text style={styles.unitText}>E幣</Text>
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
                  <Text style={styles.selectPlaceholder}>請選擇付款帳戶</Text>
                )}
                <Text style={styles.selectArrow}>›</Text>
              </Pressable>
              <Text style={styles.hint}>
                賣方將以您提供的交易帳戶進行到賬確認，請務必以選擇的交易帳戶進行支付，否則不予以放行
              </Text>
            </View>

            {/* 是否拆單 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>是否拆單</Text>
              <Pressable 
                style={({ pressed }) => [
                  styles.selectField,
                  pressed && styles.selectFieldPressed,
                ]}
                onPress={handleSelectSplit}
              >
                <Text style={styles.selectText}>{isSplit ? '是' : '否'}</Text>
                <Text style={styles.selectArrow}>›</Text>
              </Pressable>
              <Text style={styles.hint}>
                當訂單數量較大時，拆單掛單會加速完成交易
              </Text>
            </View>

            {/* 最小交易量 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>最小交易量</Text>
              <View style={styles.inputField}>
                <TextInput
                  style={styles.input}
                  placeholder="請輸入最小交易量"
                  placeholderTextColor="#999"
                  value={minAmount}
                  onChangeText={setMinAmount}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* 支付時效 */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>支付時效</Text>
                <Text style={styles.infoIcon}>ⓘ</Text>
              </View>
              <Pressable 
                style={({ pressed }) => [
                  styles.selectField,
                  pressed && styles.selectFieldPressed,
                ]}
                onPress={handleSelectTimeout}
              >
                <Text style={styles.selectText}>{paymentTimeout} 分鐘</Text>
                <Text style={styles.selectArrow}>›</Text>
              </Pressable>
            </View>

            {/* 交易密碼 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>交易密碼</Text>
              <View style={styles.inputField}>
                <TextInput
                  style={styles.input}
                  placeholder="請輸入交易密碼"
                  placeholderTextColor="#999"
                  value={transactionPassword}
                  onChangeText={setTransactionPassword}
                  secureTextEntry
                />
              </View>
            </View>

            {/* 提示訊息 */}
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>掛單時，請務必在線</Text>
            </View>

            {/* 購買按鈕 */}
            <Pressable 
              style={({ pressed }) => [
                styles.submitButton,
                pressed && styles.submitButtonPressed,
              ]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>購買E幣</Text>
            </Pressable>
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
              <Text style={styles.modalTitle}>選擇付款帳戶</Text>
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

      {/* 拆單選擇 Modal */}
      <Modal
        visible={showSplitModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSplitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>是否拆單</Text>
              <TouchableOpacity 
                onPress={() => setShowSplitModal(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.optionItem, isSplit && styles.optionItemSelected]}
              onPress={() => handleSplitSelect(true)}
            >
              <Text style={[styles.optionText, isSplit && styles.optionTextSelected]}>是</Text>
              {isSplit && <Text style={styles.optionCheckmark}>✓</Text>}
            </TouchableOpacity>
            <View style={styles.optionSeparator} />
            <TouchableOpacity
              style={[styles.optionItem, !isSplit && styles.optionItemSelected]}
              onPress={() => handleSplitSelect(false)}
            >
              <Text style={[styles.optionText, !isSplit && styles.optionTextSelected]}>否</Text>
              {!isSplit && <Text style={styles.optionCheckmark}>✓</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 支付時效選擇 Modal */}
      <Modal
        visible={showTimeoutModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimeoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>支付時效</Text>
              <TouchableOpacity 
                onPress={() => setShowTimeoutModal(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            {timeoutOptions.map((minutes, index) => (
              <React.Fragment key={minutes}>
                {index > 0 && <View style={styles.optionSeparator} />}
                <TouchableOpacity
                  style={[styles.optionItem, paymentTimeout === minutes && styles.optionItemSelected]}
                  onPress={() => handleTimeoutSelect(minutes)}
                >
                  <Text style={[styles.optionText, paymentTimeout === minutes && styles.optionTextSelected]}>
                    {minutes} 分鐘
                  </Text>
                  {paymentTimeout === minutes && <Text style={styles.optionCheckmark}>✓</Text>}
                </TouchableOpacity>
              </React.Fragment>
            ))}
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
    paddingVertical: 16,
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
    marginTop: 12,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputField: {
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 12,
    flex: 1,
  },
  input: {
    fontSize: 16,
    color: '#333',
  },
  unitText: {
    fontSize: 14,
    color: '#999',
    marginLeft: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  rowLabel: {
    fontSize: 14,
    color: '#333',
  },
  priceText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
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
    justifyContent: 'space-between',
  },
  selectFieldPressed: {
    backgroundColor: '#F8F8F8',
  },
  selectText: {
    fontSize: 16,
    color: '#333',
  },
  selectPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  selectArrow: {
    fontSize: 20,
    color: '#CCC',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    lineHeight: 18,
  },
  warningBox: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 4,
    marginBottom: 20,
  },
  warningText: {
    fontSize: 14,
    color: '#FF9800',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonPressed: {
    opacity: 0.9,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  // 選項樣式
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  optionItemSelected: {
    backgroundColor: '#E3F2FD',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  optionTextSelected: {
    color: '#007AFF',
    fontWeight: '500',
  },
  optionCheckmark: {
    fontSize: 20,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  optionSeparator: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
});
