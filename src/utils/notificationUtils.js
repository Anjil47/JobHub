import { ref, onValue, set } from 'firebase/database';
import { realtimeDb } from '../config/firebaseConfig';
import { toast } from 'react-hot-toast';
import ChatNotification from '../components/ChatNotification';

export const listenToNotifications = (userId, onNotification) => {
  // Listen to chat requests
  const requestsRef = ref(realtimeDb, `chatRequests/${userId}`);
  const unsubscribe = onValue(requestsRef, (snapshot) => {
    const requests = snapshot.val();
    if (requests) {
      const newRequests = Object.entries(requests)
        .filter(([, request]) => request.status === 'pending' && !request.seen);
      
      if (newRequests.length > 0) {
        newRequests.forEach(([, request]) => {
          toast.custom((t) => (
            <ChatNotification
              request={request}
              onView={() => onNotification('accept', request)}
              t={t}
            />
          ), {
            duration: 5000,
            position: 'top-right'
          });
        });
      }
    }
  });

  return () => unsubscribe();
};

export const markRequestAsSeen = async (userId, requestId) => {
  const requestRef = ref(realtimeDb, `chatRequests/${userId}/${requestId}/seen`);
  await set(requestRef, true);
}; 