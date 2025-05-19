import { Injectable } from '@angular/core';
import { getFirestore, collection, doc, setDoc, addDoc, getDoc, deleteDoc, query, where, getDocs, updateDoc } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { take } from 'rxjs/operators';
import { User } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class ContactService {
  db = getFirestore();

  constructor(private authService: AuthService) {}

  // Recherche un utilisateur par email (pour la recherche de contact)
async findUserByEmail(email: string): Promise<any | null> {
  const usersRef = collection(this.db, 'users');
  const q = query(usersRef, where('email', '==', email.toLowerCase()));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const userDoc = snap.docs[0];
  return { uid: userDoc.id, ...userDoc.data() };
}
  // Recherche des utilisateurs par préfixe d'email (pour la recherche de contact)
async searchUsersByEmailPrefix(prefix: string): Promise<any[]> {
  if (!prefix) return [];
  prefix = prefix.toLowerCase();
  const usersRef = collection(this.db, 'users');
  const end = prefix.slice(0, -1) + String.fromCharCode(prefix.charCodeAt(prefix.length - 1) + 1);
  const q = query(
    usersRef,
    where('email', '>=', prefix),
    where('email', '<', end)
  );
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
}

  // Envoie une demande de contact à partir de l'UID cible
  async sendContactRequest(targetUid: string) {
    const currentUser = await this.authService.user$.pipe(take(1)).toPromise() as User | null;
    if (!currentUser) throw new Error('Not authenticated');

    // Ajoute la demande dans la collection contactRequests de l'utilisateur cible
    await addDoc(collection(this.db, `users/${targetUid}/contactRequests`), {
      fromUid: currentUser.uid,
      fromEmail: currentUser.email,
      status: 'pending',
      createdAt: new Date()
    });
  }

  // Accepte une demande de contact
async acceptContactRequest(requestId: string, fromUid: string) {
  const currentUser = await this.authService.user$.pipe(take(1)).toPromise();
  if (!currentUser) throw new Error('Not authenticated');

  // Ajoute chacun dans les contacts de l'autre
  await setDoc(doc(this.db, `users/${currentUser.uid}/contacts/${fromUid}`), { addedAt: new Date() });
  await setDoc(doc(this.db, `users/${fromUid}/contacts/${currentUser.uid}`), { addedAt: new Date() });

  // Met à jour le statut de la demande
  await updateDoc(
    doc(this.db, `users/${currentUser.uid}/contactRequests/${requestId}`),
    { status: 'accepted' }
  );
}

  // Refuse une demande de contact
  async refuseContactRequest(requestId: string) {
    const currentUser = await this.authService.user$.pipe(take(1)).toPromise() as User | null;
    if (!currentUser) throw new Error('Not authenticated');
    await updateDoc(doc(this.db, `users/${currentUser.uid}/contactRequests/${requestId}`), { status: 'refused' });
  }

  // Supprime un contact
  async deleteContact(contactUid: string) {
    const currentUser = await this.authService.user$.pipe(take(1)).toPromise() as User | null;
    if (!currentUser) throw new Error('Not authenticated');
    await deleteDoc(doc(this.db, `users/${currentUser.uid}/contacts/${contactUid}`));
    // Optionnel : retire aussi l'utilisateur courant des contacts de l'autre
    await deleteDoc(doc(this.db, `users/${contactUid}/contacts/${currentUser.uid}`));
  }
}
