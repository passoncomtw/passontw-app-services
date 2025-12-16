/**
 * ConfirmOrderScreen - 統一的訂單確認頁面（購買/出售）
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
  Modal,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchBankCardsRequest } from '../../store/actions/bankCardsActions';
import logger from '@pkg/logger';

type ConfirmOrderRouteProp = RouteProp<
  {
    ConfirmOrder: {
      type: 'buy' | 'sell';
      orderId: string;
      userName: string;
      availableAmount: number;
      minAmount: number;
      maxAmount: number;
      price: number;
      bankName: string;
    };
  },
  'ConfirmOrder'
>;

export default function ConfirmOrderScreen() {
  const navigation = useNavigation();
  const route = useRoute<ConfirmOrderRouteProp>();
  const dispatch = useAppDispatch();
  const { cards: bankCards } = useAppSelector((state) => state.bankCards);

  const {
    type,
    orderId,
    userName,
    availableAmount,
    minAmount,
    maxAmount,
    price = 1.0,
    bankName,
  } = route.params;

  const isBuy = type === 'buy';

  const [amount, setAmount] = useState('');
  const [selectedBankCard, setSelectedBankCard] = useState<any>(null);
  const [transactionPassword, setTransactionPassword] = useState('');
  const [showBankCardModal, setShowBankCardModal] = useState(false);

  // 當頁面聚焦時，取得銀行卡列表
  useFocusEffect(
    React.useCallback(() => {
      logger.info('ConfirmOrderScreen - 取得銀行卡列表');
      dispatch(fetchBankCardsRequest());
    }, [dispatch])
  );

  // 計算交易金額
  const totalPrice = amount ? parseFloat(amount) * price : 0;

  // 格式化數字
  const formatNumber = (num: number) => {
    return num.toLocaleString('zh-TW');
  };

  // 設置全部數量
  const handleSetAll = () => {
    setAmount(maxAmount.toString());
  };

  // 刷新可交易數量
  const handleRefresh = () => {
    logger.info('ConfirmOrderScreen - 刷新可交易數量');
    // TODO: 重新獲取掛單信息
  };

  // 選擇銀行卡
  const handleSelectBankCard = () => {
    if (!bankCards || bankCards.length === 0) {
      Alert.alert('提示', '您還沒有添加銀行卡，請先添加銀行卡');
      return;
    }
    setShowBankCardModal(true);
  };

  // 提交訂單
  const handleSubmit = () => {
    // 驗證
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum)) {
      Alert.alert('提示', '請輸入數量');
      return;
    }
    if (amountNum < minAmount) {
      Alert.alert('提示', `數量不能小於最小交易量 ${minAmount}`);
      return;
    }
    if (amountNum > maxAmount) {
      Alert.alert('提示', `數量不能大於最大交易量 ${maxAmount}`);
      return;
    }
    if (!selectedBankCard) {
      Alert.alert('提示', '請選擇交易帳戶');
      return;
    }
    if (!transactionPassword) {
      Alert.alert('提示', '請輸入交易密碼');
      return;
    }

    logger.info('ConfirmOrderScreen - 提交訂單', {
      type,
      orderId,
      amount: amountNum,
      totalPrice,
      bankCardId: selectedBankCard.id,
    });

    Alert.alert(
      '確認',
      `確定${isBuy ? '購買' : '出售'} ${amountNum} e币？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '確定',
          onPress: () => {
            // TODO: 調用創建訂單 API
            logger.info('ConfirmOrderScreen - 創建訂單');
          },
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
        <Text style={styles.topBarTitle}>
          {isBuy ? '購買' : '出售'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 可交易數量 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>可交易數量</Text>
            <Pressable onPress={handleRefresh} style={styles.refreshButton}>
              <Text style={styles.refreshIcon}>↻</Text>
            </Pressable>
          </View>
          <View style={styles.availableAmountRow}>
            <Text style={styles.coinIcon}>💰</Text>
            <Text style={styles.availableAmountText}>
              {formatNumber(availableAmount)} E幣
            </Text>
          </View>
        </View>

        {/* 數量輸入 */}
        <View style={styles.section}>
          <Text style={styles.label}>數量</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputField}>
              <TextInput
                style={styles.input}
                placeholder={`請輸入${isBuy ? '購買' : '出售'}數量`}
                placeholderTextColor="#999"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />
            </View>
            <Text style={styles.unitText}>E幣</Text>
            <Pressable 
              style={styles.allButton}
              onPress={handleSetAll}
            >
              <Text style={styles.allButtonText}>全部</Text>
            </Pressable>
          </View>
          {amount && parseFloat(amount) > maxAmount && (
            <Text style={styles.errorText}>數量不能大於最大交易量 {maxAmount}</Text>
          )}
          {amount && parseFloat(amount) < minAmount && parseFloat(amount) > 0 && (
            <Text style={styles.errorText}>數量不能小於最小交易量 {minAmount}</Text>
          )}
        </View>

        {/* 交易金額 */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>交易金額</Text>
            <Text style={styles.priceText}>CNY ¥{formatNumber(totalPrice)}</Text>
          </View>
        </View>

        {/* 交易帳戶 */}
        <View style={styles.section}>
          <Text style={styles.label}>交易帳戶</Text>
          <Pressable 
            style={({ pressed }) => [
              styles.selectField,
              pressed && styles.selectFieldPressed,
            ]}
            onPress={handleSelectBankCard}
          >
            {selectedBankCard ? (
              <View style={styles.selectedAccountInfo}>
                <Text style={styles.selectedAccountIcon}>🏦</Text>
                <View style={styles.selectedAccountDetails}>
                  <Text style={styles.selectedAccountType}>
                    {selectedBankCard.bank?.bankName}
                  </Text>
                  <Text style={styles.selectedAccountNumber}>
                    {selectedBankCard.cardNumber}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={styles.selectPlaceholder}>
                {isBuy ? '請選擇付款帳戶' : '請選擇收款帳戶'}
              </Text>
            )}
            <Text style={styles.selectArrow}>›</Text>
          </Pressable>
          <Text style={styles.hint}>
            {isBuy 
              ? '賣方將以您提供的交易帳戶進行到帳確認，請務必以選擇的交易帳戶進行支付，否則不予以放行'
              : '買方將以您提供的交易帳戶進行打款'}
          </Text>
        </View>

        {/* 交易密碼 */}
        <View style={styles.section}>
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

        {/* 交易信息 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>交易信息</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {isBuy ? '賣家暱稱' : '買家暱稱'}
            </Text>
            <Text style={styles.infoValue}>{userName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>支付方式</Text>
            <Text style={styles.infoValue}>{bankName}</Text>
          </View>
        </View>

        {/* 提交按鈕 */}
        <Pressable 
          style={({ pressed }) => [
            styles.submitButton,
            pressed && styles.submitButtonPressed,
          ]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>
            {isBuy ? '購買E幣' : '出售E幣'}
          </Text>
        </Pressable>
      </ScrollView>

      {/* 銀行卡選擇 Modal */}
      <Modal
        visible={showBankCardModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBankCardModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isBuy ? '選擇付款帳戶' : '選擇收款帳戶'}
              </Text>
              <TouchableOpacity 
                onPress={() => setShowBankCardModal(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            {!bankCards || bankCards.length === 0 ? (
              <View style={styles.modalEmpty}>
                <Text style={styles.modalEmptyText}>尚未添加銀行卡</Text>
                <Text style={styles.modalEmptyHint}>請先到個人設定中添加銀行卡</Text>
              </View>
            ) : (
              <ScrollView style={styles.bankCardList}>
                {bankCards.map((card) => (
                  <TouchableOpacity
                    key={card.id}
                    style={[
                      styles.bankCardItem,
                      selectedBankCard?.id === card.id && styles.bankCardItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedBankCard(card);
                      setShowBankCardModal(false);
                    }}
                  >
                    <Text style={styles.bankCardIcon}>🏦</Text>
                    <View style={styles.bankCardInfo}>
                      <Text style={styles.bankCardType}>
                        {card.bank?.bankName}
                      </Text>
                      <Text style={styles.bankCardNumber}>{card.cardNumber}</Text>
                      <Text style={styles.bankCardName}>{card.name}</Text>
                    </View>
                    {selectedBankCard?.id === card.id && (
                      <Text style={styles.bankCardCheckmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  refreshButton: {
    padding: 4,
  },
  refreshIcon: {
    fontSize: 20,
    color: '#007AFF',
  },
  availableAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  availableAmountText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
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
    borderWidth: 1,
    borderColor: '#DDD',
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
  allButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 8,
  },
  allButtonText: {
    fontSize: 14,
    color: '#007AFF',
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  selectPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  selectArrow: {
    fontSize: 20,
    color: '#CCC',
  },
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
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#333',
    marginHorizontal: 16,
    marginVertical: 20,
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
  bankCardList: {
    paddingHorizontal: 16,
  },
  bankCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  bankCardItemSelected: {
    backgroundColor: '#E3F2FD',
  },
  bankCardIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  bankCardInfo: {
    flex: 1,
  },
  bankCardType: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    marginBottom: 2,
  },
  bankCardNumber: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  bankCardName: {
    fontSize: 12,
    color: '#999',
  },
  bankCardCheckmark: {
    fontSize: 20,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  modalEmpty: {
    padding: 40,
    alignItems: 'center',
  },
  modalEmptyText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  modalEmptyHint: {
    fontSize: 14,
    color: '#999',
  },
});

