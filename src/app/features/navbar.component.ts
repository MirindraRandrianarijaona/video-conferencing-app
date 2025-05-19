import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, MatButtonModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  user$: typeof this.authService.user$;
  constructor(public authService: AuthService, public router: Router) {
    this.user$ = this.authService.user$;
    this.user$.subscribe(user => console.log('Navbar sees user:', user));
  }
  async logout() {
    await this.authService.logout();
    this.router.navigate(['/home']);
  }
}
