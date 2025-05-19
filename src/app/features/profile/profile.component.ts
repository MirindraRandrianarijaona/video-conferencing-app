import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatHint, MatError } from '@angular/material/form-field';
import { AuthService } from '../../core/services/auth.service';
import { take } from 'rxjs/operators';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { getFirestore, doc, getDoc, setDoc } from '@angular/fire/firestore';

interface UserProfile {
  bio?: string;
  phone?: string;
  birthday?: string;
  location?: string;
  displayName?: string;
  email?: string;
  photoURL?: string | null;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatHint,
    MatError
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  displayName = '';
  email = '';
  profilePicUrl: string | null = null;
  selectedFile: File | null = null;
  success: string | null = null;
  error: string | null = null;
  bio = '';
  phone = '';
  birthday = '';
  location = '';

  constructor(
    private authService: AuthService,
    private storage: Storage
  ) {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.displayName = user.displayName || '';
        this.email = user.email || '';
        this.profilePicUrl = user.photoURL;
        this.loadExtraProfileFields(user.uid);
      }
    });
  }

  async loadExtraProfileFields(uid: string) {
    const db = getFirestore();
    await setDoc(
    doc(db, 'users', uid),
    {
      bio: this.bio,
      phone: this.phone,
      birthday: this.birthday,
      location: this.location,
      displayName: this.displayName,
      email: this.email.toLowerCase(),
      photoURL: this.profilePicUrl || ''
    },
    { merge: true }
  );
  console.log('Firestore updated');
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.profilePicUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  async onSave() {
  console.log('Save initiated');
  this.success = null;
  this.error = null;

  try {
    console.log('Current user data:', {
      displayName: this.displayName,
      email: this.email,
      bio: this.bio,
      phone: this.phone,
      birthday: this.birthday,
      location: this.location
    });

    let photoURL = this.profilePicUrl;

    // File upload debug
    if (this.selectedFile) {
      console.log('File selected:', this.selectedFile);
      const user = await this.authService.user$.pipe(take(1)).toPromise();
      if (!user) throw new Error('L\'utilisateur n\'est pas connecté');

      console.log('Uploading file...');
      const filePath = `avatars/${user.uid}`;
      const storageRef = ref(this.storage, filePath);
      await uploadBytes(storageRef, this.selectedFile);
      photoURL = await getDownloadURL(storageRef);
      console.log('File uploaded. URL:', photoURL);
    }

    // Profile update debug
    console.log('Updating profile...');
    await this.authService.updateProfile(
      this.displayName,
      photoURL || undefined
    );

    // Firestore debug
    const user = await this.authService.user$.pipe(take(1)).toPromise();
    if (user) {
      console.log('Updating Firestore...');
      const db = getFirestore();
      await setDoc(
        doc(db, 'users', user.uid),
        {
          bio: this.bio,
          phone: this.phone,
          birthday: this.birthday,
          location: this.location
        },
        { merge: true }
      );
      console.log('Firestore updated');
    }

    this.success = 'Profil mis à jour !';
    this.selectedFile = null;
    console.log('Update successful');
  } catch (err) {
    console.error('Update error:', err);
    this.error = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du profil';
  }
}
}
