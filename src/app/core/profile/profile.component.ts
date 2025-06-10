import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  error: string | null = null;
  message: string | null = null;
  showDeleteConfirmation = false;

  profileForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.minLength(6)],
  });

  ngOnInit(): void {
    const authString = localStorage.getItem('auth');
    let name = '';
    let email = '';

    if (authString) {
      const auth = JSON.parse(authString);
      name = auth.name ?? '';
      email = auth.email ?? '';
    }

    this.profileForm.patchValue({
      name,
      email,
    });
  }

  get name() {
    return this.profileForm.get('name')!;
  }

  get email() {
    return this.profileForm.get('email')!;
  }

  get password() {
    return this.profileForm.get('password')!;
  }

  onSubmit() {
    if (this.profileForm.invalid) return;

    const rawValue = this.profileForm.value;
    const formValue = {
      name: rawValue.name ?? '',
      email: rawValue.email ?? '',
      ...(rawValue.password ? { password: rawValue.password } : {}),
    };

    this.userService.updateProfile(formValue).subscribe({
      next: () => (this.message = 'Your user data was updated'),
      error: (err) => (this.error = err.error?.message ?? 'Error'),
    });
  }

  onDeleteUser() {
    this.userService.deleteProfile().subscribe({
      next: () => {
        localStorage.removeItem('auth');
        window.location.reload();
      },
      error: (err) => (this.error = err.error?.message ?? 'Error'),
    });
  }
}
