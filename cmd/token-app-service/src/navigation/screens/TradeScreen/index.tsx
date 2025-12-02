/**
 * TradeScreen - 交易頁面
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, StatusBar } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';

type TradeScreenRouteProp = RouteProp<{ Trade: { initialTab?: 'buy' | 'sell' } }, 'Trade'>;

interface Transaction {
  id: string;
  userName: string;
  isOnline: boolean;
  lastSeen?: string;
  amount: number;
  price: number;
  minLimit: number;
  maxLimit: number;
  paymentMethod: string;
  isVerified: boolean;
  successRate: number;
  transactionCount: number;
  badge?: 'fast' | 'trusted';
}

// 模擬交易資料 - 買入
const mockBuyTransactions: Transaction[] = [
  {
    id: '1',
    userName: '張三',
    isOnline: true,
    amount: 5000,
    price: 1.00,
    minLimit: 100,
    maxLimit: 5000,
    paymentMethod: '銀行卡',
    isVerified: true,
    successRate: 98,
    transactionCount: 156,
    badge: 'fast',
  },
  {
    id: '2',
    userName: '李四',
    isOnline: false,
    lastSeen: '5分鐘前',
    amount: 8000,
    price: 1.00,
    minLimit: 500,
    maxLimit: 8000,
    paymentMethod: '銀行卡',
    isVerified: true,
    successRate: 95,
    transactionCount: 89,
  },
  {
    id: '3',
    userName: '王五',
    isOnline: true,
    amount: 3000,
    price: 1.00,
    minLimit: 200,
    maxLimit: 3000,
    paymentMethod: '銀行卡',
    isVerified: true,
    successRate: 100,
    transactionCount: 234,
    badge: 'trusted',
  },
];

// 模擬交易資料 - 賣出
const mockSellTransactions: Transaction[] = [
  {
    id: '4',
    userName: '趙六',
    isOnline: true,
    amount: 6000,
    price: 1.00,
    minLimit: 100,
    maxLimit: 6000,
    paymentMethod: '銀行卡',
    isVerified: true,
    successRate: 97,
    transactionCount: 123,
    badge: 'fast',
  },
  {
    id: '5',
    userName: '孫七',
    isOnline: true,
    amount: 10000,
    price: 1.00,
    minLimit: 500,
    maxLimit: 10000,
    paymentMethod: '銀行卡',
    isVerified: true,
    successRate: 99,
    transactionCount: 267,
    badge: 'trusted',
  },
];

export default function TradeScreen() {
  const route = useRoute<TradeScreenRouteProp>();
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');

  // 接收從其他頁面傳來的 initialTab 參數
  useEffect(() => {
    if (route.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route.params?.initialTab]);

  // 根據 tab 選擇資料
  const transactions = activeTab === 'buy' ? mockBuyTransactions : mockSellTransactions;

  const formatNumber = (num: number) => {
    return num.toLocaleString('zh-TW');
  };

  const handleSearch = () => {
    // TODO: 實作搜尋功能
  };

  const handleTransactionPress = (transaction: Transaction) => {
    // TODO: 導航到建立訂單頁面
    console.log('選擇交易:', transaction);
  };

  // 根據 tab 和 badge 顯示不同的標籤文字
  const getBadgeText = (badge?: 'fast' | 'trusted') => {
    if (!badge) return null;
    if (badge === 'fast') {
      return activeTab === 'buy' ? '⚡ 快速放行' : '⚡ 快速收款';
    }
    if (badge === 'trusted') {
      return '⭐ 信譽優良';
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* 頂部導航 */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>交易</Text>
        <Pressable onPress={handleSearch} style={styles.searchButton}>
          <Text style={styles.searchIcon}>🔍</Text>
        </Pressable>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <Pressable 
          style={[styles.tab, activeTab === 'buy' && styles.tabActive]}
          onPress={() => setActiveTab('buy')}
        >
          <Text style={[styles.tabText, activeTab === 'buy' && styles.tabTextActive]}>
            我要買
          </Text>
        </Pressable>
        <Pressable 
          style={[styles.tab, activeTab === 'sell' && styles.tabActive]}
          onPress={() => setActiveTab('sell')}
        >
          <Text style={[styles.tabText, activeTab === 'sell' && styles.tabTextActive]}>
            我要賣
          </Text>
        </Pressable>
      </View>

      {/* 交易列表 */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.transactionList}>
          {transactions.map((transaction) => (
            <Pressable
              key={transaction.id}
              style={({ pressed }) => [
                styles.transactionItem,
                pressed && styles.transactionItemPressed,
              ]}
              onPress={() => handleTransactionPress(transaction)}
            >
              {/* 頂部：用戶名 + 數量 */}
              <View style={styles.transactionHeader}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{transaction.userName}</Text>
                  {transaction.isOnline ? (
                    <View style={styles.statusOnline}>
                      <Text style={styles.statusText}>在線</Text>
                    </View>
                  ) : (
                    <View style={styles.statusOffline}>
                      <Text style={styles.statusText}>{transaction.lastSeen}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.transactionAmount}>
                  {formatNumber(transaction.amount)} E幣
                </Text>
              </View>

              {/* 單價 + 限額 */}
              <View style={styles.transactionInfo}>
                <Text style={styles.infoText}>單價: ¥{transaction.price.toFixed(2)}</Text>
                <Text style={styles.infoText}>
                  限額: {formatNumber(transaction.minLimit)}-{formatNumber(transaction.maxLimit)}
                </Text>
              </View>

              {/* 支付方式 + 認證 */}
              <View style={styles.transactionInfo}>
                <Text style={styles.infoText}>💳 {transaction.paymentMethod}</Text>
                {transaction.isVerified && (
                  <Text style={styles.verifiedText}>✓ 已認證</Text>
                )}
              </View>

              {/* 成交率 + 標籤 */}
              <View style={[styles.transactionInfo, styles.transactionFooter]}>
                <Text style={styles.statsText}>
                  成交率: {transaction.successRate}% | 成交次數: {transaction.transactionCount}
                </Text>
                {getBadgeText(transaction.badge) && (
                  <Text style={transaction.badge === 'fast' ? styles.badgeFast : styles.badgeTrusted}>
                    {getBadgeText(transaction.badge)}
                  </Text>
                )}
              </View>
            </Pressable>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  searchButton: {
    padding: 8,
  },
  searchIcon: {
    fontSize: 20,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
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
  transactionList: {
    padding: 16,
  },
  transactionItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionItemPressed: {
    backgroundColor: '#F8F8F8',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  statusOnline: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusOffline: {
    backgroundColor: '#999',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '500',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  transactionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionFooter: {
    marginTop: 4,
    marginBottom: 0,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  verifiedText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  statsText: {
    fontSize: 12,
    color: '#666',
  },
  badgeFast: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '500',
  },
  badgeTrusted: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
  },
});
