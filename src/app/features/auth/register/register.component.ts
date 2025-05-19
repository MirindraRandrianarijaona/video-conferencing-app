import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  imports: [
    FormsModule, CommonModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatCardModule, RouterModule
  ],
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: true,
  styleUrls: ['./register.component.css'],
  animations: [
    trigger('fadeSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(40px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
    ])
  ]
})
export class RegisterComponent {
  email = '';
  password = '';
  error: string | null = null;
  success: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  async onRegister() {
    this.error = null;
    this.success = null;
    try {
      await this.authService.register(this.email, this.password);
      this.success = "Inscription réussie !";
      this.router.navigate(['/login']);
    } catch (err: any) {
      this.error = err.message || "Erreur lors de l'inscription.";
    }
  }

  async onGoogleRegister() {
    this.error = null;
    this.success = null;
    try {
      await this.authService.loginWithGoogle();
      this.success = "Inscription Google réussie !";
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.error = err.message || "Erreur lors de l'inscription avec Google.";
    }
  }
}
