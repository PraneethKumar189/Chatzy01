import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, StatusBar, Animated } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth, database } from '../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Entypo } from '@expo/vector-icons';
import colors from '../colors';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigation = useNavigation();
  const storage = getStorage();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(database, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
          setImage(userDoc.data().photoURL);
        }
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (error) {
      Alert.alert('Logout Error', error.message);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'You need to grant permission to access the library.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [4, 3], quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri) => {
    setUploading(true);
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `profilePictures/${Date.now()}.jpg`);
    const uploadTask = uploadBytesResumable(storageRef, blob, { contentType: 'image/jpeg' });
    uploadTask.on('state_changed',
      (snap) => console.log('Upload is ' + ((snap.bytesTransferred / snap.totalBytes) * 100) + '% done'),
      (error) => { setUploading(false); Alert.alert('Upload Error', error.message); },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
          await updateDoc(doc(database, 'users', auth.currentUser.uid), { photoURL: downloadURL });
          setUploading(false);
          Alert.alert('Success', 'Profile picture updated!');
        });
      }
    );
  };

  const getAvatarColor = (name) => {
    const p = ['#6C63FF','#FF6B9D','#00D68F','#FFA502','#A855F7','#06B6D4'];
    return p[(name || '').charCodeAt(0) % p.length];
  };

  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  const avatarColor = getAvatarColor(userData.displayName || userData.email);
  const initial = (userData.displayName || userData.email || 'U').charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.bgOrb1} />
      <View style={styles.bgOrb2} />
      <View style={styles.bgOrb3} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Entypo name="chevron-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Profile Card */}
      <Animated.View style={[styles.profileCard, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        {/* Avatar */}
        <TouchableOpacity onPress={pickImage} activeOpacity={0.8} style={styles.avatarWrapper}>
          {image ? (
            <Image source={{ uri: image }} style={styles.avatarImage} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: avatarColor }]}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
          )}
          <View style={styles.editBadge}>
            <Entypo name="camera" size={14} color="#fff" />
          </View>
        </TouchableOpacity>

        {uploading && <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 12 }} />}

        <Text style={styles.displayName}>{userData.displayName || 'User'}</Text>
        <Text style={styles.email}>{userData.email}</Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Entypo name="chat" size={20} color={colors.primary} />
            <Text style={styles.statLabel}>Chats</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Entypo name="shield" size={20} color={colors.online} />
            <Text style={styles.statLabel}>Secure</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Entypo name="globe" size={20} color={colors.accent} />
            <Text style={styles.statLabel}>Online</Text>
          </View>
        </View>
      </Animated.View>

      {/* Menu Items */}
      <Animated.View style={[styles.menuSection, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
          <View style={[styles.menuIcon, { backgroundColor: 'rgba(108,99,255,0.15)' }]}>
            <Entypo name="bell" size={18} color={colors.primary} />
          </View>
          <Text style={styles.menuText}>Notifications</Text>
          <Entypo name="chevron-right" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
          <View style={[styles.menuIcon, { backgroundColor: 'rgba(0,214,143,0.15)' }]}>
            <Entypo name="lock" size={18} color={colors.online} />
          </View>
          <Text style={styles.menuText}>Privacy</Text>
          <Entypo name="chevron-right" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout} activeOpacity={0.7}>
          <View style={[styles.menuIcon, { backgroundColor: 'rgba(255,71,87,0.15)' }]}>
            <Entypo name="log-out" size={18} color={colors.error} />
          </View>
          <Text style={[styles.menuText, { color: colors.error }]}>Logout</Text>
          <Entypo name="chevron-right" size={18} color={colors.error} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, gap: 12 },
  loadingText: { color: colors.textSecondary, fontSize: 15 },
  bgOrb1: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: colors.primary, opacity: 0.05, top: -100, left: -80 },
  bgOrb2: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: colors.accent, opacity: 0.04, top: 200, right: -60 },
  bgOrb3: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: colors.online, opacity: 0.03, bottom: 100, left: -30 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  headerTitle: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  profileCard: { alignItems: 'center', marginHorizontal: 20, marginTop: 16, backgroundColor: colors.surface, borderRadius: 24, padding: 28, borderWidth: 1, borderColor: colors.border },
  avatarWrapper: { position: 'relative', marginBottom: 16 },
  avatarImage: { width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: colors.primary },
  avatarPlaceholder: { width: 110, height: 110, borderRadius: 55, justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { color: '#fff', fontSize: 42, fontWeight: '800' },
  editBadge: { position: 'absolute', bottom: 4, right: 4, width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: colors.surface },
  displayName: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, marginTop: 4 },
  email: { fontSize: 15, color: colors.textMuted, marginTop: 4 },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 24, width: '100%', justifyContent: 'center' },
  statItem: { alignItems: 'center', paddingHorizontal: 24 },
  statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 6, fontWeight: '600' },
  statDivider: { width: 1, height: 32, backgroundColor: colors.border },
  menuSection: { marginHorizontal: 20, marginTop: 24 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  menuIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  menuText: { flex: 1, fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  logoutItem: { marginTop: 8 },
});

export default Profile;
