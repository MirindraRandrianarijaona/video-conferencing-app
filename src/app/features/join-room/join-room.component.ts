import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RoomService } from '../../core/services/room.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-join-room',
  imports: [CommonModule, FormsModule,],
  templateUrl: './join-room.component.html',
  styleUrls: ['./join-room.component.css']
})
export class JoinRoomComponent implements OnInit{
  roomToJoin: string = '';
  roomId: string = '';
  errorMessage: string = '';

  constructor(private roomService: RoomService, private router: Router, private route: ActivatedRoute) {}

ngOnInit(): void {
  this.roomId = this.route.snapshot.queryParamMap.get('roomId') || '';
}

  joinRoom() {
    this.errorMessage = '';
    const trimmedId = this.roomToJoin.trim();

    if (!trimmedId) {
      this.errorMessage = 'Veuillez entrer un ID de salle.';
      return;
    }

    this.roomService.getRoomById(trimmedId)
      .then(exists => {
        if (exists) {
          this.router.navigate(['/room', trimmedId]);
        } else {
          this.errorMessage = 'Cette salle n’existe pas.';
        }
      })
      .catch(() => {
        this.errorMessage = 'Erreur lors de la recherche de la salle.';
      });
  }
}
