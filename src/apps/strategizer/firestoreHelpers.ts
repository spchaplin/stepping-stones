import { writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase/firebase';
import { PaceCard, StrategyCard } from './types';

// Push existing screen cards to Firestore on first login
export async function saveExistingToFirestore(userId: string, currentCards: PaceCard[]): Promise<void> {
  try {
    const batch = writeBatch(db);

    currentCards.forEach((card, index) => {
      const cardRef = doc(db, 'users', userId, 'cards', card.id);
      batch.set(cardRef, {
        id: card.id,
        name: card.name,
        stage: card.stage,
        type: card.type,
        order: index,
        userId,
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
  }
}

export async function saveExistingStrategyToFirestore(
  userId: string,
  currentStrategyCards: StrategyCard[]
): Promise<void> {
  try {
    const batch = writeBatch(db);
    currentStrategyCards.forEach((card, index) => {
      const cardRef = doc(db, 'users', userId, 'strategyCards', card.id);
      batch.set(cardRef, {
        id: card.id,
        name: card.name,
        order: index,
        userId,
        updatedAt: serverTimestamp(),
      });
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/strategyCards`);
  }
}
