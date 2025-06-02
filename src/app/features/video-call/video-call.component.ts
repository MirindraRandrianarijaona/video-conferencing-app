import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { doc, Firestore, getDoc, setDoc, collection, onSnapshot, updateDoc, addDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-video-call',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.css']
})
export class VideoCallComponent implements OnInit, OnDestroy {
  private roomId: string = '';
  private pc: RTCPeerConnection;
  localStream: MediaStream | null = null;
  remoteStream: MediaStream | null = null;

  constructor(private route: ActivatedRoute, private firestore: Firestore) {
    this.pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
  }

  async ngOnInit() {
    this.roomId = this.route.snapshot.paramMap.get('id') || '';
    this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    this.remoteStream = new MediaStream();

    // Local stream to local video
    const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
    if (localVideo) localVideo.srcObject = this.localStream;

    // Add tracks to peer connection
    this.localStream.getTracks().forEach(track => {
      this.pc.addTrack(track, this.localStream!);
    });

    // When receiving remote tracks
    this.pc.ontrack = event => {
      event.streams[0].getTracks().forEach(track => {
        this.remoteStream!.addTrack(track);
      });
      const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
      if (remoteVideo) remoteVideo.srcObject = this.remoteStream;
    };

    // ICE candidate handler
    const roomRef = doc(this.firestore, `rooms/${this.roomId}`);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) return;

    const roomData = roomSnap.data();

    if (!roomData['offer']) {
      // I'm the caller
      const offer = await this.pc.createOffer();
      const answer = await this.pc.createAnswer();
      await this.pc.setLocalDescription(offer);
      await setDoc(roomRef, { offer });

      onSnapshot(roomRef, async snap => {
        const data = snap.data();
        if (!this.pc.currentRemoteDescription && data?.['answer']) {
          await this.pc.setRemoteDescription(new RTCSessionDescription(data['answer']));
        }
      });
    } else {
      // I'm the callee
      await this.pc.setRemoteDescription(new RTCSessionDescription(roomData['offer']));
      const answer = await this.pc.createAnswer();
      await this.pc.setLocalDescription(answer);
      await updateDoc(roomRef, { answer });
    }

    // ICE candidates
    const callerCandidatesCollection = collection(this.firestore, `rooms/${this.roomId}/callerCandidates`);
    const calleeCandidatesCollection = collection(this.firestore, `rooms/${this.roomId}/calleeCandidates`);

    this.pc.onicecandidate = async event => {
      if (event.candidate) {
        const candidateData = event.candidate.toJSON();
        await addDoc(roomData['offer'] ? calleeCandidatesCollection : callerCandidatesCollection, candidateData);
      }
    };

    onSnapshot(roomData['offer'] ? callerCandidatesCollection : calleeCandidatesCollection, snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          const data = change.doc.data();
          this.pc.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.pc.close();
    this.localStream?.getTracks().forEach(track => track.stop());
    this.remoteStream?.getTracks().forEach(track => track.stop());
  }
}
