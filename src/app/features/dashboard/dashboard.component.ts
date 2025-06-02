import { Component } from '@angular/core';
import { ContactsComponent } from '../contacts/contacts.component';
import { ChatComponent } from '../chat/chat.component';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { CreateRoomComponent } from "../create-room/create-room.component";
import { JoinRoomComponent } from '../join-room/join-room.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ContactsComponent, ChatComponent, MatIcon, CommonModule, CreateRoomComponent, JoinRoomComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  selectedContactForChat: any = null;

onStartChat(contact: any) {
  this.selectedContactForChat = contact;
}

}
