import { Component, Input, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { getFirestore, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from '@angular/fire/firestore';
import { AuthService } from '../../core/services/auth.service';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, OnChanges {
  @Input() contact: any;

  currentUser: User | null = null;
  messages: any[] = [];
  newMessage = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        if (this.contact) {
          this.listenToMessages();
        }
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['contact'] && this.contact && this.currentUser) {
      this.listenToMessages();
    }
  }

  getConversationId(uid1: string, uid2: string): string {
    return [uid1, uid2].sort().join('_');
  }

  listenToMessages() {
    const db = getFirestore();
    const conversationId = this.getConversationId(this.currentUser!.uid, this.contact.uid);
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('timestamp'));

    onSnapshot(q, snapshot => {
      this.messages = snapshot.docs.map(doc => doc.data());
    });
  }

  async sendMessage() {
    if (!this.newMessage.trim()) return;
    const db = getFirestore();
    const conversationId = this.getConversationId(this.currentUser!.uid, this.contact.uid);
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');

    await addDoc(messagesRef, {
      senderId: this.currentUser!.uid,
      text: this.newMessage,
      timestamp: serverTimestamp()
    });

    this.newMessage = '';
  }
}
