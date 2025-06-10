import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CalendarService {
  private readonly apiUrl = 'http://localhost:3000/api/event';
  private readonly http = inject(HttpClient);

  private readonly _event = new BehaviorSubject<boolean>(false);
  event$ = this._event.asObservable();

  private readonly _newEvent = new BehaviorSubject<boolean>(false);
  newEvent$ = this._newEvent.asObservable();

  getEvents(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getEventById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createEvent(event: any): Observable<any> {
    return this.http.post(this.apiUrl, event);
  }

  updateEvent(id: string, event: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, event);
  }

  deleteEvent(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  addEvent(event: boolean): void {
    this._event.next(event);
  }

  newEvent(event: boolean): void {
    this._newEvent.next(event);
  }
}
