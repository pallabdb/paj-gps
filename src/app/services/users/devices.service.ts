import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment'

const apiUrl = environment.apiUrl

@Injectable({
  providedIn: 'root'
})
export class DevicesService {

  ls = JSON.parse(localStorage.getItem('auth-token') || '{}')

  constructor(private http: HttpClient) { }

  // Http Options
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': '*/*',
      "Authorization": 'Bearer ' + this.ls.token
    })
  }

  // Error handling 
  handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error  Code: ${error.status}\nMessage: ${error.message}`;
    }
    window.alert(errorMessage);
    return throwError(errorMessage);
  }

  //All devices 
  all_devices(): Observable<any> {
    return this.http.get<any>(apiUrl + `device`, this.httpOptions)
  }

  all_device_position(deviceId: number): Observable<any> {
    return this.http.get<any>(apiUrl + `logbook/getAllRoutes/${deviceId}`, this.httpOptions)
  }

  get_route(deviceId: string): Observable<any> {
    return this.http.get<any>(apiUrl + `logbook/getAllRoutes/${deviceId}`, this.httpOptions)
  }

}
