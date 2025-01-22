import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { collection, addDoc, deleteDoc, doc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { useAuth } from '../auth/useAuth';
import { JobContext } from './context';

export default function JobProvider({ children }) {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      fetchSavedJobs();
    } else {
      setSavedJobs([]);
    }
  }, [currentUser]);

  const saveJob = async (jobData) => {
    if (!currentUser) return;
    
    try {
      const docRef = await addDoc(collection(db, 'savedJobs'), {
        userId: currentUser.uid,
        ...jobData,
        savedAt: new Date().toISOString()
      });
      setSavedJobs([...savedJobs, { id: docRef.id, ...jobData }]);
    } catch (error) {
      console.error('Error saving job:', error);
      throw error;
    }
  };

  const removeJob = async (jobId) => {
    if (!currentUser) return;
    
    try {
      await deleteDoc(doc(db, 'savedJobs', jobId));
      setSavedJobs(savedJobs.filter(job => job.id !== jobId));
    } catch (error) {
      console.error('Error removing job:', error);
      throw error;
    }
  };

  const fetchSavedJobs = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const q = query(
        collection(db, 'savedJobs'),
        where('userId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const jobs = [];
      querySnapshot.forEach((doc) => {
        jobs.push({ id: doc.id, ...doc.data() });
      });
      
      setSavedJobs(jobs);
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    savedJobs,
    saveJob,
    removeJob,
    fetchSavedJobs,
    loading
  };

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );
}

JobProvider.propTypes = {
  children: PropTypes.node.isRequired,
}; 