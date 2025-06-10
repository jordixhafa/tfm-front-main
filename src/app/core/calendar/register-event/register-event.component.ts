
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  output,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CalendarService } from '../../services/calendar.service';

@Component({
  selector: 'app-register-event',
  imports: [ReactiveFormsModule],
  templateUrl: './register-event.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterEventComponent implements OnInit {
  close = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly calendarService = inject(CalendarService);
  loading = false;
  success = false;
  error: string | null = null;

  eventForm = this.fb.group({
    title: ['', Validators.required],
    description: '',
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    location: ['', Validators.required],
    label: '',
    allDay: false,
    color: '#000000',
  });

  isOpen = false;

  ngOnInit() {
    setTimeout(() => {
      this.isOpen = true;
    }, 100);
  }

  closePanel() {
    this.isOpen = false;
    setTimeout(() => {
      this.close.emit();
    }, 300);
  }

  submit() {
    this.error = null;
    this.success = false;
    this.loading = true;

    const { startDate, allDay } = this.eventForm.value;

    if (allDay) {
      const start = new Date(startDate ?? '');
      start.setHours(23, 59, 59, 999);
      this.eventForm.get('endDate')?.setValue(start.toString());
    }

    if (this.eventForm.valid) {
      this.calendarService.createEvent(this.eventForm.value).subscribe({
        next: () => {
          this.loading = false;
          this.success = true;
          this.calendarService.addEvent(true);
          this.eventForm.reset();
        },
        error: (err) => {
          this.error =
            err.error?.message ??
            'Error creating event. Please try again later.';
        },
      });
    }
  }

  get allDay() {
    return this.eventForm.get('allDay')?.value;
  }
}
