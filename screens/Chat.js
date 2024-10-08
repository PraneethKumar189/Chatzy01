import React, { useState, useEffect, useCallback } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import { collection, addDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { auth, database } from '../config/firebase';

import { doc, getDoc } from 'firebase/firestore';
import { View,Text } from 'react-native';
import Divider from './divider';

// Define the function outside of the component
const generateChatRoomId = (uid1, uid2) => {
  return [uid1, uid2].sort().join('_');
};

const Chat = ({ route }) => {
  const [messages, setMessages] = useState([]);
  const { otherUserId, otherUsername } = route.params; // Include the other user's display name
  console.log(otherUserId)
  const chatRoomId = generateChatRoomId(auth.currentUser.uid, otherUserId);

  useEffect(() => {
    console.log('Current chatRoomId:', chatRoomId);

    const q = query(
      collection(database, 'messages'),
      where('chatRoomId', '==', chatRoomId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('Snapshot size:', snapshot.size);
      const fetchedMessages = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Message data:', data);
        return {
          _id: data._id,
          createdAt: data.createdAt.toDate(),
          text: data.text,
          user: data.user,
        };
      });
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [chatRoomId]);

  const onSend = useCallback((newMessages = []) => {
    const { _id, createdAt, text, user } = newMessages[0];
    addDoc(collection(database, 'messages'), {
      _id,
      createdAt,
      text,
      user,
      chatRoomId,
    });
  }, [chatRoomId]);

  return (
    <View style={{ flex: 1 }}>
       <Divider/>
       <Text style={{ textAlign: 'center', fontWeight: 'bold',fontSize:18 }}>
        Chatting with: {otherUsername}
      </Text>
      <Divider/>
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{
          _id: auth.currentUser.uid,
          name: auth.currentUser.displayName,
        }}
      />
      {/* Optionally, you can display the recipient's name somewhere in your UI */}
     
    </View>
  );
};

export default Chat;
