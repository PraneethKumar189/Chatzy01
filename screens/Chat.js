import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Animated } from 'react-native';
import { GiftedChat, Bubble, InputToolbar, Composer, Send } from 'react-native-gifted-chat';
import { collection, addDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { auth, database } from '../config/firebase';
import { Entypo } from '@expo/vector-icons';
import colors from '../colors';

const generateChatRoomId = (uid1, uid2) => [uid1, uid2].sort().join('_');

const Chat = ({ route, navigation }) => {
  const [messages, setMessages] = useState([]);
  const { otherUserId, otherUsername } = route.params;
  const chatRoomId = generateChatRoomId(auth.currentUser.uid, otherUserId);
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    const q = query(collection(database, 'messages'), where('chatRoomId', '==', chatRoomId), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => { const data = d.data(); return { _id: data._id, createdAt: data.createdAt.toDate(), text: data.text, user: data.user }; }));
    });
    return () => unsub();
  }, [chatRoomId]);

  const onSend = useCallback((msgs = []) => {
    const { _id, createdAt, text, user } = msgs[0];
    addDoc(collection(database, 'messages'), { _id, createdAt, text, user, chatRoomId });
  }, [chatRoomId]);

  const getAvatarColor = (name) => {
    const p = ['#6C63FF','#FF6B9D','#00D68F','#FFA502','#A855F7','#06B6D4','#F43F5E','#8B5CF6'];
    return p[(name || '').charCodeAt(0) % p.length];
  };

  const renderBubble = (props) => (
    <Bubble {...props}
      wrapperStyle={{
        right: { backgroundColor: colors.primary, borderRadius: 18, borderBottomRightRadius: 4, paddingVertical: 2, marginVertical: 2 },
        left: { backgroundColor: colors.surface, borderRadius: 18, borderBottomLeftRadius: 4, paddingVertical: 2, marginVertical: 2, borderWidth: 1, borderColor: colors.border },
      }}
      textStyle={{ right: { color: '#fff', fontSize: 15 }, left: { color: colors.textPrimary, fontSize: 15 } }}
      timeTextStyle={{ right: { color: 'rgba(255,255,255,0.6)', fontSize: 11 }, left: { color: colors.textMuted, fontSize: 11 } }}
    />
  );

  const renderInputToolbar = (props) => (
    <InputToolbar {...props} containerStyle={styles.inputToolbar} primaryStyle={styles.inputPrimary} />
  );

  const renderComposer = (props) => (
    <Composer {...props} textInputStyle={styles.composerInput} placeholderTextColor={colors.textMuted} placeholder="Type a message..." />
  );

  const renderSend = (props) => (
    <Send {...props} containerStyle={styles.sendContainer}>
      <View style={styles.sendButton}><Entypo name="paper-plane" size={20} color="#fff" /></View>
    </Send>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <Animated.View style={[styles.header, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0,1], outputRange: [-20,0] }) }] }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Entypo name="chevron-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={[styles.headerAvatar, { backgroundColor: getAvatarColor(otherUsername) }]}>
          <Text style={styles.headerAvatarText}>{(otherUsername || 'U').charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{otherUsername || 'User'}</Text>
          <View style={styles.onlineRow}><View style={styles.onlineDot} /><Text style={styles.onlineText}>Online</Text></View>
        </View>
      </Animated.View>
      <View style={styles.divider} />
      <GiftedChat messages={messages} onSend={m => onSend(m)} user={{ _id: auth.currentUser.uid, name: auth.currentUser.displayName }}
        renderBubble={renderBubble} renderInputToolbar={renderInputToolbar} renderComposer={renderComposer} renderSend={renderSend}
        alwaysShowSend scrollToBottom listViewProps={{ style: { backgroundColor: colors.background } }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16, backgroundColor: colors.background },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: colors.border },
  headerAvatar: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  headerAvatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  onlineRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.online, marginRight: 6 },
  onlineText: { fontSize: 12, color: colors.online, fontWeight: '500' },
  divider: { height: 1, backgroundColor: colors.border },
  inputToolbar: { backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: 8, paddingVertical: 6 },
  inputPrimary: { alignItems: 'center' },
  composerInput: { backgroundColor: colors.surfaceLight, borderRadius: 24, paddingHorizontal: 18, paddingTop: 10, paddingBottom: 10, marginRight: 8, fontSize: 15, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border, lineHeight: 20 },
  sendContainer: { justifyContent: 'center', alignItems: 'center', marginRight: 4, marginBottom: 4 },
  sendButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 },
});

export default Chat;
