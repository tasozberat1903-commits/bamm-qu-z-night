import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, onSnapshot, setDoc, updateDoc, collection, query, orderBy } from 'firebase/firestore';
import { QuizState, Participant } from '../types';
import { QUIZ_QUESTIONS } from '../constants';

const SESSION_ID = 'radio-gastro-quiz-live';

export function useQuizSession() {
  const [state, setState] = useState<QuizState | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionDoc = doc(db, 'quiz_sessions', SESSION_ID);
    
    const unsubSession = onSnapshot(sessionDoc, (snapshot) => {
      if (snapshot.exists()) {
        setState(snapshot.data() as QuizState);
      } else {
        // Initialize if not exists
        const initialState: QuizState = {
          currentQuestionIndex: 0,
          status: 'waiting',
          participants: [], // we use a subcollection for real updates
          totalQuestions: QUIZ_QUESTIONS.length
        };
        setDoc(sessionDoc, initialState).catch(e => handleFirestoreError(e, OperationType.WRITE, 'quiz_sessions'));
      }
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'quiz_sessions'));

    const participantsCol = collection(db, 'quiz_sessions', SESSION_ID, 'participants');
    const q = query(participantsCol, orderBy('score', 'desc'));
    
    const unsubParticipants = onSnapshot(q, (snapshot) => {
      const pData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Participant[];
      setParticipants(pData);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'participants'));

    return () => {
      unsubSession();
      unsubParticipants();
    };
  }, []);

  const updateSession = async (updates: Partial<QuizState>) => {
    const sessionDoc = doc(db, 'quiz_sessions', SESSION_ID);
    try {
      await updateDoc(sessionDoc, updates);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'quiz_sessions');
    }
  };

  const joinSession = async (participant: Participant) => {
    const pDoc = doc(db, 'quiz_sessions', SESSION_ID, 'participants', participant.id);
    try {
      await setDoc(pDoc, participant);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'participants');
    }
  };

  return { state, participants, loading, updateSession, joinSession };
}
