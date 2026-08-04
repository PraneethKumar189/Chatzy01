import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar, Animated, TextInput } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, database } from '../config/firebase';
import { Entypo } from '@expo/vector-icons';
import colors from '../colors';

const SelectUser = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersRef = collection(database, 'users');
      const q = query(usersRef, where('uid', '!=', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      const fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(fetched);
      setFilteredUsers(fetched);
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const lower = searchQuery.toLowerCase();
      setFilteredUsers(users.filter(u => (u.displayName || u.email || '').toLowerCase().includes(lower)));
    }
  }, [searchQuery, users]);

  const handleSelect = (user) => {
    navigation.navigate('Chat', { otherUserId: user.uid, otherUsername: user.displayName });
  };

  const getAvatarColor = (name) => {
    const p = ['#6C63FF','#FF6B9D','#00D68F','#FFA502','#A855F7','#06B6D4','#F43F5E','#8B5CF6'];
    return p[(name || '').charCodeAt(0) % p.length];
  };

  const getInitial = (name) => (name || 'U').charAt(0).toUpperCase();

  const renderItem = ({ item, index }) => {
    const itemAnim = new Animated.Value(0);
    Animated.timing(itemAnim, { toValue: 1, duration: 400, delay: index * 60, useNativeDriver: true }).start();
    const avatarColor = getAvatarColor(item.displayName || item.email);

    return (
      <Animated.View style={{ opacity: itemAnim, transform: [{ translateY: itemAnim.interpolate({ inputRange: [0,1], outputRange: [20,0] }) }] }}>
        <TouchableOpacity onPress={() => handleSelect(item)} style={styles.userItem} activeOpacity={0.7}>
          <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
            <Text style={styles.avatarText}>{getInitial(item.displayName || item.email)}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.displayName || 'Unknown'}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
          </View>
          <View style={styles.chatIcon}>
            <Entypo name="chat" size={18} color={colors.primary} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.bgOrb1} />
      <View style={styles.bgOrb2} />

      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0,1], outputRange: [-20,0] }) }] }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Entypo name="chevron-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Chat</Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      <View style={styles.divider} />

      {/* Search */}
      <View style={styles.searchContainer}>
        <Entypo name="magnifying-glass" size={18} color={colors.textMuted} style={{ marginRight: 10 }} />
        <TextInput style={styles.searchInput} placeholder="Search contacts..." placeholderTextColor={colors.textMuted} value={searchQuery} onChangeText={setSearchQuery} />
      </View>

      {/* Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>All Contacts</Text>
        <Text style={styles.sectionCount}>{filteredUsers.length}</Text>
      </View>

      {/* List */}
      <FlatList data={filteredUsers} keyExtractor={(item) => item.uid} renderItem={renderItem} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}
        ListEmptyComponent={<View style={styles.emptyState}><Entypo name="users" size={48} color={colors.surfaceElevated} /><Text style={styles.emptyText}>No contacts found</Text></View>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  bgOrb1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: colors.primary, opacity: 0.04, top: -60, right: -40 },
  bgOrb2: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: colors.accent, opacity: 0.03, bottom: 100, left: -50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  headerTitle: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.3 },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 20 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, marginHorizontal: 16, marginTop: 16, borderRadius: 16, paddingHorizontal: 16, height: 48, borderWidth: 1, borderColor: colors.border },
  searchInput: { flex: 1, color: colors.textPrimary, fontSize: 15 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionCount: { fontSize: 14, fontWeight: '700', color: colors.primary },
  listContent: { paddingHorizontal: 12, paddingBottom: 32 },
  userItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12, marginVertical: 3, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  avatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  userInfo: { flex: 1, marginLeft: 14 },
  userName: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  userEmail: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  chatIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceLight, justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 16, color: colors.textMuted, marginTop: 16 },
});

export default SelectUser;
