import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './features/navbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent,],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})


export class AppComponent {
  title = 'video-conferencing-app';
}
