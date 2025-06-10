import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from '@angular/core';
import { RegisterEventComponent } from './register-event/register-event.component';

import { ViewEventsComponent } from './view-events/view-events.component';
import { CalendarService } from '../services/calendar.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-calendar',
  imports: [RegisterEventComponent, ViewEventsComponent],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarComponent {
  private readonly calendarService = inject(CalendarService);
  newEvent = toSignal(this.calendarService.newEvent$, { initialValue: false });

  isModalOpen = false;

  constructor() {
    effect(() => {
      const isNewEvent = this.newEvent();
      if (isNewEvent) {
        this.openModal();
      }
    });
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.calendarService.newEvent(false);
    this.isModalOpen = false;
  }
}
