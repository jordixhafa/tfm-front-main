import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CalendarService } from '../../services/calendar.service';

@Component({
  selector: 'app-edit-event',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-event.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditEventComponent {
  private readonly fb = inject(FormBuilder);
  readonly eventData = input<any>(null);
  readonly isEditMode = signal(false);

  close = output<void>();
  delete = output<void>();

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

  private readonly calendarService = inject(CalendarService);
  loading = false;
  success = false;
  error: string | null = null;

  constructor() {
    effect(() => {
      if (this.eventData()) {
        this.eventForm.patchValue({
          title: this.eventData().title,
          description: this.eventData()?.meta?.description,
          startDate: this.formatDateForInput(this.eventData()?.start),
          endDate: this.formatDateForInput(this.eventData()?.end),
          location: this.eventData().meta?.location,
          label: this.eventData().meta?.label,
          allDay: this.eventData().allDay,
          color: this.eventData().color.primary,
        });
      }
    });
  }

  formatDateForInput(dateStr: string): string {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  enableEdit() {
    this.isEditMode.set(true);
  }

  cancelEdit() {
    this.isEditMode.set(false);
  }

  submit() {
    this.error = null;
    this.success = false;
    this.loading = true;

    const { startDate, allDay } = this.eventForm.value;

    if (allDay) {
      const start = new Date(startDate ?? '');
      start.setHours(23, 59, 59, 999);
      this.eventForm
        .get('endDate')
        ?.setValue(this.formatDateForInput(start.toString()));
    }

    if (this.eventForm.valid) {
      this.calendarService
        .updateEvent(this.eventData().id, this.eventForm.value)
        .subscribe({
          next: () => {
            this.loading = false;
            this.success = true;
            this.calendarService.addEvent(true);
            this.closeDrawer();
          },
          error: (err) => {
            this.error =
              err.error?.message ??
              'Error updating event. Please try again later.';
          },
        });
    }
  }

  confirmDelete() {
    this.delete.emit();
  }

  closeDrawer() {
    this.isEditMode.set(false);
    this.eventForm.reset();
    this.close.emit();
  }

  get allDay() {
    return this.eventForm.get('allDay')?.value;
  }
}
