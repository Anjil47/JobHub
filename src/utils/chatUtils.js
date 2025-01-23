import { ref, push, get, query, orderByChild, equalTo, set, update } from 'firebase/database';
import { realtimeDb } from '../config/firebaseConfig';

// Function to store user data when they sign in
export const storeUserData = async (user, username = '') => {
  try {
    const userRef = ref(realtimeDb, `users/${user.uid}`);
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || 'Anonymous',
      username: username || user.displayName?.toLowerCase().replace(/\s+/g, '_') || 'user_' + Math.random().toString(36).substr(2, 9),
      photoURL: user.photoURL,
      googleId: user.providerData[0]?.uid,
      lastSeen: new Date().toISOString()
    };
    
    // Check if username is unique
    const usernameQuery = query(
      ref(realtimeDb, 'users'),
      orderByChild('username'),
      equalTo(userData.username)
    );
    const usernameSnapshot = await get(usernameQuery);
    
    if (usernameSnapshot.exists()) {
      userData.username = userData.username + '_' + Math.random().toString(36).substr(2, 5);
    }
    
    await set(userRef, userData);
    return userData;
  } catch (error) {
    console.error('Error storing user data:', error);
    throw error;
  }
};

export const updateUsername = async (userId, newUsername) => {
  try {
    // Check if username is unique
    const usernameQuery = query(
      ref(realtimeDb, 'users'),
      orderByChild('username'),
      equalTo(newUsername)
    );
    const usernameSnapshot = await get(usernameQuery);
    
    if (usernameSnapshot.exists()) {
      throw new Error('Username already taken');
    }
    
    const userRef = ref(realtimeDb, `users/${userId}`);
    await update(userRef, { username: newUsername });
    return true;
  } catch (error) {
    console.error('Error updating username:', error);
    throw error;
  }
};

export const searchUsers = async (searchTerm, currentUserId) => {
  try {
    // First try to search by username
    const usersRef = ref(realtimeDb, 'users');
    let searchQuery = query(
      usersRef,
      orderByChild('username'),
      equalTo(searchTerm.toLowerCase())
    );

    let snapshot = await get(searchQuery);
    let users = snapshot.val();

    // If no results, try partial username match
    if (!users) {
      searchQuery = query(
        usersRef,
        orderByChild('username')
      );
      snapshot = await get(searchQuery);
      users = snapshot.val();
      
      if (users) {
        users = Object.fromEntries(
          Object.entries(users).filter(([, userData]) => 
            userData.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            userData.email.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      }
    }

    // Filter out current user and transform to array
    return Object.entries(users || {})
      .filter(([uid]) => uid !== currentUserId)
      .map(([uid, userData]) => ({
        uid,
        ...userData
      }));
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

// Send chat request
export const sendChatRequest = async (fromUser, toUser) => {
  try {
    // Store the request in the recipient's requests list
    const requestRef = ref(realtimeDb, `chatRequests/${toUser.uid}/${fromUser.uid}`);
    await set(requestRef, {
      from: {
        uid: fromUser.uid,
        username: fromUser.displayName?.toLowerCase().replace(/\s+/g, '_') || fromUser.email.split('@')[0],
        displayName: fromUser.displayName || fromUser.email.split('@')[0],
        photoURL: fromUser.photoURL,
        email: fromUser.email
      },
      status: 'pending',
      timestamp: Date.now()
    });

    // Also store in sender's sent requests
    const sentRequestRef = ref(realtimeDb, `sentRequests/${fromUser.uid}/${toUser.uid}`);
    await set(sentRequestRef, {
      to: {
        uid: toUser.uid,
        username: toUser.username,
        displayName: toUser.displayName,
        photoURL: toUser.photoURL,
        email: toUser.email
      },
      status: 'pending',
      timestamp: Date.now()
    });

    return true;
  } catch (error) {
    console.error('Error sending chat request:', error);
    throw error;
  }
};

// Accept chat request
export const acceptChatRequest = async (currentUser, fromUser) => {
  try {
    // Create chat first
    const chatId = await createChat(
      {
        uid: currentUser.uid,
        displayName: currentUser.displayName || 'Anonymous',
        photoURL: currentUser.photoURL,
        email: currentUser.email
      },
      {
        uid: fromUser.uid,
        displayName: fromUser.displayName || 'Anonymous',
        photoURL: fromUser.photoURL,
        email: fromUser.email
      }
    );
    
    if (!chatId) {
      throw new Error('Failed to create chat');
    }

    // Then delete the request from both users
    const requestRef = ref(realtimeDb, `chatRequests/${currentUser.uid}/${fromUser.uid}`);
    const sentRequestRef = ref(realtimeDb, `sentRequests/${fromUser.uid}/${currentUser.uid}`);
    
    await Promise.all([
      set(requestRef, null),
      set(sentRequestRef, null)
    ]);

    // Update both users' chat lists
    const updates = {
      [`userChats/${currentUser.uid}/${chatId}/lastMessage`]: {
        text: 'Chat started',
        timestamp: Date.now()
      },
      [`userChats/${fromUser.uid}/${chatId}/lastMessage`]: {
        text: 'Chat started',
        timestamp: Date.now()
      }
    };
    
    await update(ref(realtimeDb), updates);
    return chatId;
  } catch (error) {
    console.error('Error accepting chat request:', error);
    throw error;
  }
};

// Reject chat request
export const rejectChatRequest = async (currentUserId, fromUserId) => {
  try {
    // Delete the request from both users
    const requestRef = ref(realtimeDb, `chatRequests/${currentUserId}/${fromUserId}`);
    const sentRequestRef = ref(realtimeDb, `sentRequests/${fromUserId}/${currentUserId}`);
    
    await Promise.all([
      set(requestRef, null),
      set(sentRequestRef, null)
    ]);
    
    return true;
  } catch (error) {
    console.error('Error rejecting chat request:', error);
    throw error;
  }
};

// Get pending chat requests
export const getPendingRequests = async (userId) => {
  try {
    const requestsRef = ref(realtimeDb, `chatRequests/${userId}`);
    const snapshot = await get(requestsRef);
    return snapshot.val() || {};
  } catch (error) {
    console.error('Error getting chat requests:', error);
    throw error;
  }
};

export const createChat = async (user1, user2) => {
  try {
    // Create new chat
    const newChatRef = push(ref(realtimeDb, 'chats'));
    const chatId = newChatRef.key;

    const chatData = {
      createdAt: Date.now(),
      users: {
        [user1.uid]: {
          displayName: user1.displayName || 'Anonymous',
          photoURL: user1.photoURL,
          email: user1.email
        },
        [user2.uid]: {
          displayName: user2.displayName || 'Anonymous',
          photoURL: user2.photoURL,
          email: user2.email
        }
      },
      lastMessage: {
        text: 'Chat started',
        timestamp: Date.now()
      }
    };

    const updates = {
      [`chats/${chatId}`]: chatData,
      [`userChats/${user1.uid}/${chatId}`]: {
        users: {
          [user2.uid]: chatData.users[user2.uid]
        },
        lastMessage: chatData.lastMessage
      },
      [`userChats/${user2.uid}/${chatId}`]: {
        users: {
          [user1.uid]: chatData.users[user1.uid]
        },
        lastMessage: chatData.lastMessage
      }
    };

    await update(ref(realtimeDb), updates);
    return chatId;
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
};

export const getUserChats = async (userId) => {
  try {
    const userChatsRef = ref(realtimeDb, `userChats/${userId}`);
    const snapshot = await get(userChatsRef);
    return snapshot.val() || {};
  } catch (error) {
    console.error('Error getting user chats:', error);
    throw error;
  }
}; 