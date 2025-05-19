import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [
    FormsModule, CommonModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatCardModule, RouterModule
  ],
  standalone: true,
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email = '';
  password = '';
  error: string | null = null;
  success: string | null = null;
  sessionExpired = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe(params => {
      this.sessionExpired = !!params['sessionExpired'];
    });
  }

  async onLogin() {
    this.error = null;
    this.success = null;
    try {
      await this.authService.login(this.email, this.password);
      this.success = "Connexion réussie !";
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.error = err.message || "Erreur lors de la connexion.";
    }
  }

  async onGoogleLogin() {
    this.error = null;
    this.success = null;
    try {
      await this.authService.loginWithGoogle();
      this.success = "Connexion Google réussie !";
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.error = err.message || "Erreur lors de la connexion avec Google.";
    }
  }
}
