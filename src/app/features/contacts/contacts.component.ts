import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { ContactService } from '../../core/services/contacts.service';
import { AuthService } from '../../core/services/auth.service';
import { collection, onSnapshot, getFirestore } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-contacts',
  imports: [CommonModule, FormsModule, MatIcon],
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css'],
  standalone: true,
})
export class ContactsComponent implements OnInit, OnDestroy {
    @Output() startChat = new EventEmitter<any>();
  contactEmail = '';
  contacts: any[] = [];
  requests: any[] = [];
  error: string | null = null;
  success: string | null = null;
  foundContact: any = null;
  private userUid: string | null = null;
  private unsubContacts: any;
  private unsubRequests: any;
  private userSub?: Subscription;

  constructor(
    private contactService: ContactService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.userSub = this.authService.user$.subscribe(user => {
      if (user) {
        this.userUid = user.uid;
        const db = getFirestore();

        // Listen to contacts
    this.unsubContacts = onSnapshot(
      collection(db, `users/${user.uid}/contacts`),
      async snapshot => {
        const contactPromises = snapshot.docs.map(async docSnap => {
          const contactUid = docSnap.id;
          const fullUser = await this.contactService.getContactById(contactUid);
          return fullUser;
        });

        this.contacts = await Promise.all(contactPromises);
      }
    );

        // Listen to requests
        this.unsubRequests = onSnapshot(
          collection(db, `users/${user.uid}/contactRequests`),
          snapshot => {
            this.requests = snapshot.docs
              .map(doc => {
                const data = doc.data() as { status?: string; [key: string]: any };
                return {
                  id: doc.id,
                  ...data
                };
              })
              .filter(req => req.status === 'pending');
          }
        );
      }
    });
  }

  ngOnDestroy() {
    if (this.unsubContacts) this.unsubContacts();
    if (this.unsubRequests) this.unsubRequests();
    if (this.userSub) this.userSub.unsubscribe();
  }

  async searchContact() {
    this.error = null;
    this.success = null;
    this.foundContact = null;

    if (!this.contactEmail) {
      this.error = "Veuillez entrer un email.";
      return;
    }

    try {
      const user = await this.contactService.findUserByEmail(this.contactEmail);
      if (user) {
        this.foundContact = user;
      } else {
        this.error = "Aucun utilisateur trouvé avec cet email.";
      }
    } catch (err: any) {
      this.error = "Erreur lors de la recherche.";
    }
  }

suggestions: any[] = [];

async onEmailInputChange(value: string) {
  this.foundContact = null;
  this.success = null;
  this.error = null;
  if (value && value.length >= 2) {
    this.suggestions = await this.contactService.searchUsersByEmailPrefix(value);
  } else {
    this.suggestions = [];
  }
}

selectSuggestion(user: any) {
  this.contactEmail = user.email;
  this.foundContact = user;
  this.suggestions = [];
}

  async addContact(contact: any) {
    this.error = null;
    this.success = null;
    try {
      await this.contactService.sendContactRequest(contact.uid);
      this.success = 'Demande envoyée !';
      this.foundContact = null;
      this.contactEmail = '';
    } catch (err: any) {
      this.error = err.message || "Erreur lors de l'envoi de la demande.";
    }
  }

  async acceptRequest(requestId: string, fromUid: string) {
    await this.contactService.acceptContactRequest(requestId, fromUid);
  }

  async refuseRequest(requestId: string) {
    await this.contactService.refuseContactRequest(requestId);
  }

    openChat(contact: any) {
    this.startChat.emit(contact);
  }

  async deleteContact(contactUid: string) {
    await this.contactService.deleteContact(contactUid);
  }
}
