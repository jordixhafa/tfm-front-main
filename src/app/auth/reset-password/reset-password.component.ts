
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  token = this.route.snapshot.queryParamMap.get('token');
  loading = false;
  success = false;
  error: string | null = null;

  form = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  });

  onSubmit() {
    this.error = null;
    this.success = false;

    if (
      this.form.invalid ||
      this.form.value.password !== this.form.value.confirmPassword
    ) {
      this.error = 'Passwords do not match or are not valid.';
      return;
    }

    this.loading = true;

    this.authService
      .resetPassword(this.token!, this.form.value.password!)
      .subscribe({
        next: () => {
          this.loading = false;
          this.success = true;
          setTimeout(() => this.router.navigate(['/login']), 3000);
        },
        error: (err) => {
          this.loading = false;
          this.error =
            err.error?.message ?? 'The password could not be updated.';
        },
      });
  }
}
