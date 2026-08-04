import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, database } from '../config/firebase';
import { Entypo } from '@expo/vector-icons';
import colors from '../colors';

const chatzyLogo = require("../assets/chatzy_logo.png");
const { width } = Dimensions.get('window');

const Home = () => {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;
  const fabScale = useRef(new Animated.Value(0)).current;
  const fabPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(listAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(fabScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    // FAB pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(fabPulse, {
          toValue: 1.08,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(fabPulse, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (!auth.currentUser) {
          setError('No authenticated user');
          return;
        }

        const usersRef = collection(database, 'users');
        const q = query(usersRef, where('uid', '!=', auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        const fetchedUsers = querySnapshot.docs.map(doc => doc.data());
        setUsers(fetchedUsers);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to fetch users: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();

    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleUserSelect = (user) => {
    navigation.navigate('Chat', { otherUserId: user.uid, otherUsername: user.displayName });
  };

  const getAvatarColor = (name) => {
    const colorPalette = [
      '#6C63FF', '#FF6B9D', '#00D68F', '#FFA502',
      '#A855F7', '#06B6D4', '#F43F5E', '#8B5CF6',
    ];
    const index = (name || '').charCodeAt(0) % colorPalette.length;
    return colorPalette[index];
  };

  const getInitial = (name) => {
    return (name || 'U').charAt(0).toUpperCase();
  };

  const renderUserItem = ({ item, index }) => {
    const animDelay = index * 80;
    const itemAnim = new Animated.Value(0);

    Animated.timing(itemAnim, {
      toValue: 1,
      duration: 400,
      delay: animDelay,
      useNativeDriver: true,
    }).start();

    const avatarColor = getAvatarColor(item.displayName || item.email);

    return (
      <Animated.View
        style={{
          opacity: itemAnim,
          transform: [{
            translateX: itemAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-30, 0],
            }),
          }],
        }}
      >
        <TouchableOpacity
          onPress={() => handleUserSelect(item)}
          style={styles.userItem}
          activeOpacity={0.7}
        >
          {/* Avatar */}
          <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
            <Text style={styles.avatarText}>
              {getInitial(item.displayName || item.email)}
            </Text>
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.displayName || item.email}</Text>
            <Text style={styles.userStatus}>Tap to start chatting</Text>
          </View>

          {/* Arrow */}
          <View style={styles.arrowContainer}>
            <Entypo name="chevron-right" size={20} color={colors.textMuted} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading conversations...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <Entypo name="warning" size={48} color={colors.error} />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Background orbs */}
      <View style={styles.bgOrb1} />
      <View style={styles.bgOrb2} />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [{
              translateY: headerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-30, 0],
              }),
            }],
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <Image source={chatzyLogo} style={styles.headerLogo} />
          <View>
            <Text style={styles.headerTitle}>Chatzy</Text>
            <Text style={styles.headerSubtitle}>
              {users.length} contact{users.length !== 1 ? 's' : ''} online
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.7}
        >
          <Entypo name="user" size={20} color={colors.primary} />
        </TouchableOpacity>
      </Animated.View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Section Title */}
      <Animated.View
        style={[
          styles.sectionHeader,
          { opacity: listAnim },
        ]}
      >
        <Text style={styles.sectionTitle}>Conversations</Text>
      </Animated.View>

      {/* Users List */}
      <Animated.View style={[styles.listContainer, { opacity: listAnim }]}>
        {users.length > 0 ? (
          <FlatList
            data={users}
            keyExtractor={(item) => item.uid}
            renderItem={renderUserItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Entypo name="chat" size={64} color={colors.surfaceElevated} />
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the + button to start a new chat
            </Text>
          </View>
        )}
      </Animated.View>

      {/* FAB */}
      <Animated.View
        style={[
          styles.fabContainer,
          {
            transform: [{ scale: Animated.multiply(fabScale, fabPulse) }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('SelectUser')}
          style={styles.fab}
          activeOpacity={0.85}
        >
          <Entypo name="new-message" size={22} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    gap: 16,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 15,
    marginTop: 8,
  },
  // Background
  bgOrb1: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: colors.primary,
    opacity: 0.04,
    top: -80,
    right: -60,
  },
  bgOrb2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.accent,
    opacity: 0.03,
    bottom: 60,
    left: -40,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerLogo: {
    width: 44,
    height: 44,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 20,
  },
  // Section
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  // List
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 100,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginVertical: 3,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
    marginLeft: 14,
  },
  userName: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  userStatus: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 3,
  },
  arrowContainer: {
    padding: 4,
  },
  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
  // FAB
  fabContainer: {
    position: 'absolute',
    right: 24,
    bottom: 32,
  },
  fab: {
    backgroundColor: colors.primary,
    height: 60,
    width: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default Home;
