import { Component } from '@angular/core';
import { RoomService } from '../../core/services/room.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-create-room',
  imports: [CommonModule, RouterLink],
  templateUrl: './create-room.component.html',
  styleUrls: ['./create-room.component.css']
})
export class CreateRoomComponent {
  roomId: string | null = null;
  createdRoomId: string = '';
  isLoading = false;

  constructor(private roomService: RoomService) {}
createRoom() {
  this.roomService.createRoom()
    .then(roomId => {
      this.roomId = roomId;
      this.createdRoomId = roomId;
    })
    .catch(error => {
      console.error('Erreur lors de la création de la salle :', error);
    });
}

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      alert('ID copié dans le presse-papier !');
    }).catch(() => {
      alert("Échec de la copie. Essaie manuellement 😅");
    });
  }
}
