import React, { useState, useEffect,useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, database } from '../config/firebase';
import { Entypo } from '@expo/vector-icons';
import colors from '../colors';
import Divider from './divider';

const Home = () => {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);


  useEffect(() => {
    const fetchUsers = async () => {
        try {
          console.log('Fetching users...');
          if (!auth.currentUser) {
            console.log('No current user found');
            setError('No authenticated user');
            return;
          }
          console.log('Current user:', auth.currentUser.email);
          
          const usersRef = collection(database, 'users');
          console.log('Users collection reference created');
          
          const q = query(usersRef, where('uid', '!=', auth.currentUser.uid));
          console.log('Query created');
          
          const querySnapshot = await getDocs(q);
          console.log('Query executed, snapshot size:', querySnapshot.size);
          
          const fetchedUsers = querySnapshot.docs.map(doc => doc.data());
          console.log('Fetched users:', fetchedUsers);
          
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
  

  const safeSetUsers = (data) => {
    if (isMounted.current) setUsers(data);
  };

  const safeSetLoading = (isLoading) => {
    if (isMounted.current) setLoading(isLoading);
  };

  const safeSetError = (err) => {
    if (isMounted.current) setError(err);
  };

  
  const handleUserSelect = (user) => {
    navigation.navigate('Chat', { otherUserId: user.uid ,otherUsername:user.displayName});
  };
  

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
  <Divider/>
      <Text style={{fontSize:20,marginLeft:150,}}>Chatzy</Text>
      <Divider/>
       <TouchableOpacity
        style={styles.profileButton}
        onPress={() => navigation.navigate('Profile')}
      >
        <Text style={styles.nam}>Profile</Text>
      </TouchableOpacity>
      
    <View style={styles.div}>
    {users.length > 0 ? (
        <FlatList
          data={users}
          keyExtractor={(item) => item.uid}
          renderItem={({ item }) => (
            
            <TouchableOpacity
              onPress={() => handleUserSelect(item)}
              style={styles.userButton}
            >
              <Text style={styles.userName}>{item.displayName || item.email}</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text style={styles.noUsersText}>No users found</Text>
      )}</View> 
      <TouchableOpacity
        onPress={() => navigation.navigate('SelectUser')}
        style={styles.newChatButton}
      >
        <Entypo name="new-message" size={24} color={colors.lightGray} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  div:{
    marginTop:100
     
  },
  
  nam:{
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 10,
    backgroundColor: '#3498db',
    borderRadius: 5,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userButton: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  userName: {
    
    fontSize: 18,
  },
  newChatButton: {
    backgroundColor: colors.primary,
    height: 50,
    width: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  noUsersText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default Home;
