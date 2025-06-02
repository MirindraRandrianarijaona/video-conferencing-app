import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomService } from '../../core/services/room.service';
import { CommonModule } from '@angular/common';
import { VideoCallComponent } from '../video-call/video-call.component';

@Component({
  selector: 'app-room-detail',
  imports: [CommonModule, VideoCallComponent],
  templateUrl: './room-detail.component.html',
  styleUrls: ['./room-detail.component.css']
})
export class RoomDetailComponent implements OnInit {
  roomId!: string;
  roomData: any = null;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roomService: RoomService
  ) {}

  ngOnInit(): void {
    this.roomId = this.route.snapshot.paramMap.get('id') || '';

    this.roomService.getRoomDetails(this.roomId)
      .then(data => {
        this.roomData = data;
      })
      .catch(err => {
        this.errorMessage = 'Salle introuvable ou supprimée.';
      });
  }

  quitterSalle() {
    this.router.navigate(['dashboard']);
  }
}
