import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, doc, getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  constructor(private firestore: Firestore) {}

  createRoom(): Promise<string> {
    const roomRef = collection(this.firestore, 'rooms');
    const newRoom = {
      createdAt: new Date(),
    };

    return addDoc(roomRef, newRoom).then(doc => doc.id);
  }
  getRoomById(roomId: string): Promise<boolean> {
  const roomDoc = doc(this.firestore, 'rooms', roomId);
  return getDoc(roomDoc).then(snapshot => snapshot.exists());
}

getRoomDetails(roomId: string): Promise<any> {
  const roomDoc = doc(this.firestore, 'rooms', roomId);
  return getDoc(roomDoc).then(snapshot => {
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    } else {
      throw new Error('Room not found');
    }
  });
}
}
