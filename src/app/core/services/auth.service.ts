import { Injectable, inject } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider, signInWithPopup,
  signOut,
  User,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile
} from '@angular/fire/auth';
import { BehaviorSubject, Observable, distinctUntilChanged } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth: Auth = inject(Auth);
  private userSubject = new BehaviorSubject<User | null>(null);

  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      console.log('Auth state changed:', user);
      this.userSubject.next(user);
    });
  }

  get user$(): Observable<User | null> {
    return this.userSubject.asObservable().pipe(
      distinctUntilChanged((prev, curr) => prev?.uid === curr?.uid)
    );
  }

  register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.auth, provider);
    this.userSubject.next(result.user);
    return result.user;
  }

  logout() {
    return signOut(this.auth);
  }

  // Update display name and/or photo URL for the current user
  async updateProfile(displayName?: string, photoURL?: string): Promise<void> {
    const user = this.auth.currentUser;
    if (user) {
      await firebaseUpdateProfile(user, { displayName, photoURL });
      this.userSubject.next({ ...user }); // Trigger update
    }
  }

  getCurrentUser(): Promise<User | null> {
  return Promise.resolve(this.auth.currentUser);
}
}
