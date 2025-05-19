import { Component } from '@angular/core';
import { Auth, sendPasswordResetEmail } from '@angular/fire/auth';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatError } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  standalone: true,
  styleUrls: ['./forgot-password.component.css'],
  imports: [
    RouterModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    CommonModule,
    MatIconModule
  ]
})
export class ForgotPasswordComponent {
  email = '';
  error: string | null = null;
  message: string | null = null;

  constructor(private auth: Auth) {}

  async onReset() {
    this.error = null;
    this.message = null;
    try {
      await sendPasswordResetEmail(this.auth, this.email);
      this.message = 'Un email de réinitialisation a été envoyé.';
    } catch (err: any) {
      this.error = err.message || "Erreur lors de la réinitialisation.";
    }
  }
}
