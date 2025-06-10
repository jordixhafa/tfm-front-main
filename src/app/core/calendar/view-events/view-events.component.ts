import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CalendarEvent, CalendarModule, CalendarView } from 'angular-calendar';
import { CalendarService } from '../../services/calendar.service';
import { Subject } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { EditEventComponent } from '../edit-event/edit-event.component';
@Component({
  selector: 'app-view-events',
  imports: [CommonModule, CalendarModule, EditEventComponent],
  templateUrl: './view-events.component.html',
  styleUrl: './view-events.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewEventsComponent implements OnInit {
  private readonly calendarService = inject(CalendarService);

  events = signal<CalendarEvent[]>([]);
  newEvent = toSignal(this.calendarService.event$, { initialValue: false });
  activeEvent = signal<CalendarEvent | null>(null);
  toastMessage = signal<string | null>(null);
  confirmDelete = signal<CalendarEvent | null>(null);

  refresh = new Subject<void>();
  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  CalendarView = CalendarView;

  constructor() {
    effect(() => {
      const isAdded = this.newEvent();
      if (isAdded) {
        this.getEvents();
        this.refresh.next();
      }
    });
  }

  ngOnInit(): void {
    this.getEvents();
  }

  getEvents(): void {
    this.calendarService.getEvents().subscribe((events) => {
      const calendarEvents = events.map((event: any) =>
        this.mapFormToCalendarEvent(event)
      );
      this.events.set(calendarEvents);
    });
  }

  mapFormToCalendarEvent(formValue: any): CalendarEvent {
    const color: any = {
      primary: formValue.color,
      secondary: formValue.color,
    };

    return {
      id: formValue.id,
      title: formValue.title.name,
      start: new Date(formValue.start ?? formValue.startDate),
      end: new Date(formValue.end ?? formValue.endDate),
      allDay: formValue.allDay,
      color,
      meta: {
        description: formValue.description,
        location: formValue.location,
        label: formValue.label,
      },
    };
  }

  handleEventClick(event: CalendarEvent): void {
    this.getEventById(String(event.id));
  }

  getEventById(id: string): void {
    this.calendarService.getEventById(id).subscribe((event) => {
      this.activeEvent.set(this.mapFormToCalendarEvent(event));
    });
  }

  deleteConfirmed(): void {
    const event = this.confirmDelete();
    if (!event) return;

    this.calendarService.deleteEvent(String(event.id)).subscribe(() => {
      this.events.update((currentEvents) =>
        currentEvents.filter((e) => e.id !== event.id)
      );
      this.showToast('Event deleted successfully');

      this.refresh.next();
      this.confirmDelete.set(null);
      this.activeEvent.set(null);
    });
  }

  showToast(message: string): void {
    this.toastMessage.set(message);
    setTimeout(() => this.toastMessage.set(null), 3000);
  }

  handleDeleteRequest(): void {
    if (this.activeEvent()) {
      this.confirmDelete.set(this.activeEvent());
    }
  }

  setView(view: CalendarView): void {
    this.view = view;
  }

  openRegisterEventModal(event: any): void {
    if (!event?.day.events.length) {
      this.calendarService.newEvent(true);
    }
  }
}
