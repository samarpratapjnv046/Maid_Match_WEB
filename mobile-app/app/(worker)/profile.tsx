import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useAuth } from '@/src/context/AuthContext';
import api from '@/src/api/axios';
import { SERVICE_TYPES, WorkerPricing } from '@/src/types';

interface WorkerProfile {
  gender?: string;
  bio?: string;
  services: string[];
  pricing: WorkerPricing;
  experience_years?: number;
  languages?: string[];
  is_available?: boolean;
  rating?: number;
  total_reviews?: number;
}

export default function WorkerProfileScreen() {
  const { user, logout, switchMode } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  // Edit fields
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [hourlyPrice, setHourlyPrice] = useState('');
  const [dailyPrice, setDailyPrice] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState('');
  const [languages, setLanguages] = useState('');

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const response = await api.get('/workers/profile');
      if (response.data.success) {
        const p = response.data.data;
        setProfile(p);
        setBio(p.bio || '');
        setGender(p.gender || '');
        setExperienceYears(String(p.experience_years || ''));
        setSelectedServices(p.services || []);
        setHourlyPrice(String(p.pricing?.hourly || ''));
        setDailyPrice(String(p.pricing?.daily || ''));
        setMonthlyPrice(String(p.pricing?.monthly || ''));
        setLanguages((p.languages || []).join(', '));
      }
    } catch {
      // Profile might not exist yet
      setIsCreatingProfile(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  };

  const buildProfileData = () => ({
    bio: bio.trim(),
    gender: gender.trim(),
    experience_years: parseInt(experienceYears) || 0,
    services: selectedServices,
    pricing: {
      hourly: parseFloat(hourlyPrice) || undefined,
      daily: parseFloat(dailyPrice) || undefined,
      monthly: parseFloat(monthlyPrice) || undefined,
    },
    languages: languages
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean),
  });

  const handleSaveProfile = async () => {
    if (selectedServices.length === 0) {
      Alert.alert('Error', 'Please select at least one service');
      return;
    }
    setIsSaving(true);
    try {
      const method = isCreatingProfile ? 'post' : 'patch';
      const response = await api[method]('/workers/profile', buildProfileData());
      if (response.data.success) {
        setProfile(response.data.data);
        setIsEditing(false);
        setIsCreatingProfile(false);
        Alert.alert('Success', 'Worker profile saved!');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      Alert.alert('Error', err?.response?.data?.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    setIsChangingPassword(true);
    try {
      await api.patch('/auth/change-password', { currentPassword, newPassword });
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      Alert.alert('Success', 'Password changed successfully');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      Alert.alert('Error', err?.response?.data?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSwitchToCustomer = () => {
    Alert.alert('Switch to Customer Mode', 'You will be redirected to the customer dashboard.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Switch',
        onPress: async () => {
          try {
            await switchMode('customer');
            router.replace('/(customer)');
          } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            Alert.alert('Error', err?.response?.data?.message || 'Failed to switch mode');
          }
        },
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  const avatarUri = user?.avatar
    ? user.avatar
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Worker')}&background=00B894&color=fff&size=200`;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B894" />
      </View>
    );
  }

  const showForm = isEditing || isCreatingProfile;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={{ uri: avatarUri }} style={styles.avatar} contentFit="cover" />
        <Text style={styles.workerName}>{user?.name}</Text>
        <Text style={styles.workerEmail}>{user?.email}</Text>
        {profile && (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#FDCB6E" />
            <Text style={styles.ratingText}>{profile.rating?.toFixed(1) || '0.0'}</Text>
            <Text style={styles.reviewCount}>({profile.total_reviews || 0} reviews)</Text>
          </View>
        )}
        <View style={styles.modeBadge}>
          <Ionicons name="briefcase-outline" size={12} color="#00B894" />
          <Text style={styles.modeBadgeText}>Worker</Text>
        </View>
      </View>

      {/* Create/Edit Profile Banner */}
      {isCreatingProfile && !showForm && (
        <View style={styles.createBanner}>
          <Ionicons name="information-circle-outline" size={20} color="#6C5CE7" />
          <Text style={styles.createBannerText}>
            Create your worker profile to start receiving bookings
          </Text>
        </View>
      )}

      {/* Profile Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {isCreatingProfile ? 'Create Worker Profile' : 'Worker Profile'}
          </Text>
          {!isCreatingProfile && (
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
              <Text style={styles.editToggle}>{isEditing ? 'Cancel' : 'Edit'}</Text>
            </TouchableOpacity>
          )}
        </View>

        {showForm ? (
          <View style={styles.formCard}>
            {/* Gender */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Gender</Text>
              <View style={styles.genderRow}>
                {['male', 'female', 'other'].map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.genderChip, gender === g && styles.genderChipActive]}
                    onPress={() => setGender(g)}
                  >
                    <Text style={[styles.genderChipText, gender === g && styles.genderChipTextActive]}>
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Bio */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Bio</Text>
              <TextInput
                style={[styles.formInput, styles.bioInput]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell customers about yourself..."
                placeholderTextColor="#B2BEC3"
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Experience */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Years of Experience</Text>
              <TextInput
                style={styles.formInput}
                value={experienceYears}
                onChangeText={setExperienceYears}
                placeholder="e.g. 3"
                placeholderTextColor="#B2BEC3"
                keyboardType="number-pad"
              />
            </View>

            {/* Services */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Services Offered</Text>
              <View style={styles.servicesGrid}>
                {SERVICE_TYPES.map((s) => (
                  <TouchableOpacity
                    key={s.value}
                    style={[styles.serviceChip, selectedServices.includes(s.value) && styles.serviceChipActive]}
                    onPress={() => toggleService(s.value)}
                  >
                    <Text style={[styles.serviceChipText, selectedServices.includes(s.value) && styles.serviceChipTextActive]}>
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Pricing */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Pricing (₹)</Text>
              <View style={styles.pricingRow}>
                <View style={styles.priceInput}>
                  <Text style={styles.priceLabel}>Hourly</Text>
                  <TextInput
                    style={styles.formInput}
                    value={hourlyPrice}
                    onChangeText={setHourlyPrice}
                    placeholder="0"
                    placeholderTextColor="#B2BEC3"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.priceInput}>
                  <Text style={styles.priceLabel}>Daily</Text>
                  <TextInput
                    style={styles.formInput}
                    value={dailyPrice}
                    onChangeText={setDailyPrice}
                    placeholder="0"
                    placeholderTextColor="#B2BEC3"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.priceInput}>
                  <Text style={styles.priceLabel}>Monthly</Text>
                  <TextInput
                    style={styles.formInput}
                    value={monthlyPrice}
                    onChangeText={setMonthlyPrice}
                    placeholder="0"
                    placeholderTextColor="#B2BEC3"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            {/* Languages */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Languages (comma-separated)</Text>
              <TextInput
                style={styles.formInput}
                value={languages}
                onChangeText={setLanguages}
                placeholder="e.g. Hindi, English, Tamil"
                placeholderTextColor="#B2BEC3"
              />
            </View>

            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.buttonDisabled]}
              onPress={handleSaveProfile}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>
                  {isCreatingProfile ? 'Create Profile' : 'Save Changes'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ) : profile ? (
          <View style={styles.profileCard}>
            {profile.bio && (
              <View style={styles.profileRow}>
                <Ionicons name="document-text-outline" size={18} color="#00B894" />
                <View style={styles.profileRowContent}>
                  <Text style={styles.profileLabel}>Bio</Text>
                  <Text style={styles.profileValue}>{profile.bio}</Text>
                </View>
              </View>
            )}
            <View style={styles.divider} />
            <View style={styles.profileRow}>
              <Ionicons name="briefcase-outline" size={18} color="#00B894" />
              <View style={styles.profileRowContent}>
                <Text style={styles.profileLabel}>Services</Text>
                <View style={styles.tagsRow}>
                  {(profile.services || []).map((s) => (
                    <View key={s} style={styles.tag}>
                      <Text style={styles.tagText}>
                        {SERVICE_TYPES.find((t) => t.value === s)?.label || s}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.profileRow}>
              <Ionicons name="cash-outline" size={18} color="#00B894" />
              <View style={styles.profileRowContent}>
                <Text style={styles.profileLabel}>Pricing</Text>
                <Text style={styles.profileValue}>
                  {[
                    profile.pricing?.hourly && `₹${profile.pricing.hourly}/hr`,
                    profile.pricing?.daily && `₹${profile.pricing.daily}/day`,
                    profile.pricing?.monthly && `₹${profile.pricing.monthly}/mo`,
                  ]
                    .filter(Boolean)
                    .join('  •  ') || 'Not set'}
                </Text>
              </View>
            </View>
            {profile.experience_years !== undefined && (
              <>
                <View style={styles.divider} />
                <View style={styles.profileRow}>
                  <Ionicons name="time-outline" size={18} color="#00B894" />
                  <View style={styles.profileRowContent}>
                    <Text style={styles.profileLabel}>Experience</Text>
                    <Text style={styles.profileValue}>{profile.experience_years} year(s)</Text>
                  </View>
                </View>
              </>
            )}
            {profile.languages && profile.languages.length > 0 && (
              <>
                <View style={styles.divider} />
                <View style={styles.profileRow}>
                  <Ionicons name="language-outline" size={18} color="#00B894" />
                  <View style={styles.profileRowContent}>
                    <Text style={styles.profileLabel}>Languages</Text>
                    <Text style={styles.profileValue}>{profile.languages.join(', ')}</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        ) : (
          <TouchableOpacity style={styles.createButton} onPress={() => setIsCreatingProfile(true)}>
            <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
            <Text style={styles.createButtonText}>Create Worker Profile</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Account Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.actionsCard}>
          <TouchableOpacity style={styles.actionRow} onPress={() => setShowPasswordModal(true)}>
            <View style={styles.actionLeft}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(108,92,231,0.1)' }]}>
                <Ionicons name="lock-closed-outline" size={18} color="#6C5CE7" />
              </View>
              <Text style={styles.actionText}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#B2BEC3" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionRow} onPress={handleSwitchToCustomer}>
            <View style={styles.actionLeft}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(108,92,231,0.1)' }]}>
                <Ionicons name="swap-horizontal-outline" size={18} color="#6C5CE7" />
              </View>
              <Text style={styles.actionText}>Switch to Customer Mode</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#B2BEC3" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionRow} onPress={handleLogout}>
            <View style={styles.actionLeft}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(255,107,107,0.1)' }]}>
                <Ionicons name="log-out-outline" size={18} color="#FF6B6B" />
              </View>
              <Text style={[styles.actionText, { color: '#FF6B6B' }]}>Logout</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#B2BEC3" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: 32 }} />

      {/* Change Password Modal */}
      <Modal visible={showPasswordModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <Ionicons name="close" size={24} color="#636E72" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.modalInput}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Current Password"
              placeholderTextColor="#B2BEC3"
              secureTextEntry
            />
            <TextInput
              style={styles.modalInput}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="New Password"
              placeholderTextColor="#B2BEC3"
              secureTextEntry
            />
            <TextInput
              style={styles.modalInput}
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              placeholder="Confirm New Password"
              placeholderTextColor="#B2BEC3"
              secureTextEntry
            />
            <TouchableOpacity
              style={[styles.saveButton, isChangingPassword && styles.buttonDisabled]}
              onPress={handleChangePassword}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Update Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
    alignItems: 'center',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    marginBottom: 12,
  },
  workerName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  workerEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reviewCount: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 10,
    gap: 5,
  },
  modeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00B894',
  },
  createBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(108,92,231,0.08)',
    margin: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(108,92,231,0.2)',
  },
  createBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#6C5CE7',
    fontWeight: '500',
  },
  section: {
    padding: 16,
    paddingBottom: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2D3436',
  },
  editToggle: {
    color: '#00B894',
    fontSize: 14,
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 4,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#636E72',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  formInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: '#2D3436',
  },
  bioInput: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
  },
  genderChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  genderChipActive: {
    backgroundColor: '#00B894',
    borderColor: '#00B894',
  },
  genderChipText: {
    fontSize: 13,
    color: '#636E72',
    fontWeight: '500',
  },
  genderChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  serviceChipActive: {
    backgroundColor: '#00B894',
    borderColor: '#00B894',
  },
  serviceChipText: {
    fontSize: 12,
    color: '#636E72',
    fontWeight: '500',
  },
  serviceChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  pricingRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priceInput: {
    flex: 1,
    gap: 4,
  },
  priceLabel: {
    fontSize: 11,
    color: '#B2BEC3',
    fontWeight: '500',
    marginBottom: 4,
  },
  saveButton: {
    backgroundColor: '#00B894',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#00B894',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    gap: 14,
  },
  profileRowContent: {
    flex: 1,
  },
  profileLabel: {
    fontSize: 11,
    color: '#B2BEC3',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  profileValue: {
    fontSize: 14,
    color: '#2D3436',
    fontWeight: '500',
    lineHeight: 20,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  tag: {
    backgroundColor: 'rgba(0,184,148,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#00B894',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 14,
  },
  createButton: {
    backgroundColor: '#00B894',
    borderRadius: 12,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  actionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 15,
    color: '#2D3436',
    fontWeight: '500',
  },
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
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
  },
  modalInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    color: '#2D3436',
  },
});
