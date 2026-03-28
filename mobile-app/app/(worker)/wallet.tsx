import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '@/src/api/axios';
import { WalletData, Transaction } from '@/src/types';

export default function WalletScreen() {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const loadWallet = useCallback(async () => {
    try {
      const [walletRes, txRes] = await Promise.all([
        api.get('/wallet'),
        api.get('/wallet/transactions'),
      ]);

      if (walletRes.data.success) {
        setWalletData(walletRes.data.data);
      }
      if (txRes.data.success) {
        const data = txRes.data.data;
        setTransactions(Array.isArray(data) ? data : data?.transactions || []);
      }
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    if (!bankAccount.trim() || !ifsc.trim() || !accountHolder.trim()) {
      Alert.alert('Error', 'Please fill in all bank details');
      return;
    }
    if (walletData && amount > walletData.balance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    setIsWithdrawing(true);
    try {
      await api.post('/wallet/withdraw', {
        amount,
        bank_account: bankAccount.trim(),
        ifsc: ifsc.trim().toUpperCase(),
        account_holder_name: accountHolder.trim(),
      });
      Alert.alert('Success', 'Withdrawal request submitted successfully');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setBankAccount('');
      setIfsc('');
      setAccountHolder('');
      loadWallet();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      Alert.alert('Error', err?.response?.data?.message || 'Withdrawal failed');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadWallet();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={[styles.txIcon, item.type === 'credit' ? styles.txIconCredit : styles.txIconDebit]}>
        <Ionicons
          name={item.type === 'credit' ? 'arrow-down' : 'arrow-up'}
          size={16}
          color={item.type === 'credit' ? '#00B894' : '#FF6B6B'}
        />
      </View>
      <View style={styles.txDetails}>
        <Text style={styles.txDescription}>{item.description}</Text>
        <Text style={styles.txDate}>{formatDate(item.created_at)}</Text>
      </View>
      <View style={styles.txAmountContainer}>
        <Text style={[styles.txAmount, item.type === 'credit' ? styles.txCredit : styles.txDebit]}>
          {item.type === 'credit' ? '+' : '-'}₹{item.amount.toLocaleString()}
        </Text>
        <View style={[styles.txStatus, item.status === 'completed' ? styles.statusCompleted : styles.statusPending]}>
          <Text style={[styles.txStatusText, item.status === 'completed' ? styles.statusCompletedText : styles.statusPendingText]}>
            {item.status}
          </Text>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B894" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00B894" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Wallet</Text>
          {/* Balance Card */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>
              ₹{(walletData?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Text>
            <TouchableOpacity
              style={styles.withdrawButton}
              onPress={() => setShowWithdrawModal(true)}
            >
              <Ionicons name="arrow-up-circle-outline" size={18} color="#FFFFFF" />
              <Text style={styles.withdrawButtonText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>
              ₹{(walletData?.transactions?.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0) || 0).toLocaleString()}
            </Text>
            <Text style={styles.quickStatLabel}>Total Earned</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>
              ₹{(walletData?.transactions?.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0) || 0).toLocaleString()}
            </Text>
            <Text style={styles.quickStatLabel}>Total Withdrawn</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>{transactions.length}</Text>
            <Text style={styles.quickStatLabel}>Transactions</Text>
          </View>
        </View>

        {/* Transactions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color="#B2BEC3" />
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.emptySubtitle}>Your earnings will appear here</Text>
            </View>
          ) : (
            <FlatList
              data={transactions}
              keyExtractor={(item) => item.id}
              renderItem={renderTransaction}
              scrollEnabled={false}
              contentContainerStyle={styles.txList}
            />
          )}
        </View>
      </ScrollView>

      {/* Withdraw Modal */}
      <Modal visible={showWithdrawModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Withdraw Funds</Text>
              <TouchableOpacity onPress={() => setShowWithdrawModal(false)}>
                <Ionicons name="close" size={24} color="#636E72" />
              </TouchableOpacity>
            </View>

            <Text style={styles.availableBalance}>
              Available: ₹{(walletData?.balance || 0).toLocaleString()}
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Amount (₹)</Text>
              <TextInput
                style={styles.formInput}
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
                placeholder="Enter amount"
                placeholderTextColor="#B2BEC3"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Bank Account Number</Text>
              <TextInput
                style={styles.formInput}
                value={bankAccount}
                onChangeText={setBankAccount}
                placeholder="Enter account number"
                placeholderTextColor="#B2BEC3"
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>IFSC Code</Text>
              <TextInput
                style={styles.formInput}
                value={ifsc}
                onChangeText={setIfsc}
                placeholder="e.g. SBIN0001234"
                placeholderTextColor="#B2BEC3"
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Account Holder Name</Text>
              <TextInput
                style={styles.formInput}
                value={accountHolder}
                onChangeText={setAccountHolder}
                placeholder="As per bank records"
                placeholderTextColor="#B2BEC3"
                autoCapitalize="words"
              />
            </View>

            <TouchableOpacity
              style={[styles.withdrawConfirmBtn, isWithdrawing && styles.buttonDisabled]}
              onPress={handleWithdraw}
              disabled={isWithdrawing}
            >
              {isWithdrawing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.withdrawConfirmText}>Submit Withdrawal</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#00B894',
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  balanceCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    marginVertical: 8,
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    marginTop: 4,
  },
  withdrawButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  quickStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2D3436',
  },
  quickStatLabel: {
    fontSize: 11,
    color: '#636E72',
    marginTop: 4,
    textAlign: 'center',
  },
  quickStatDivider: {
    width: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 4,
  },
  section: {
    padding: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 16,
  },
  txList: {
    gap: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  txIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txIconCredit: {
    backgroundColor: 'rgba(0,184,148,0.12)',
  },
  txIconDebit: {
    backgroundColor: 'rgba(255,107,107,0.12)',
  },
  txDetails: {
    flex: 1,
  },
  txDescription: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2D3436',
  },
  txDate: {
    fontSize: 11,
    color: '#B2BEC3',
    marginTop: 2,
  },
  txAmountContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  txCredit: {
    color: '#00B894',
  },
  txDebit: {
    color: '#FF6B6B',
  },
  txStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusCompleted: {
    backgroundColor: 'rgba(0,184,148,0.1)',
  },
  statusPending: {
    backgroundColor: 'rgba(253,203,110,0.2)',
  },
  txStatusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusCompletedText: {
    color: '#00B894',
  },
  statusPendingText: {
    color: '#E17055',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#636E72',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#B2BEC3',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
  },
  availableBalance: {
    fontSize: 13,
    color: '#00B894',
    fontWeight: '600',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 14,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#636E72',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  formInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 14,
    height: 46,
    fontSize: 14,
    color: '#2D3436',
  },
  withdrawConfirmBtn: {
    backgroundColor: '#00B894',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  withdrawConfirmText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
