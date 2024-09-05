import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment'

const apiUrl = environment.apiUrl + `login?`
//const apiUrl = environment?.apiUrl + `loginTest?`

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private http: HttpClient) { }

  // Http Options
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
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

  login(user_email: string, user_passwd: string): Observable<any> {
    return this.http.post<any>(apiUrl + 'email=' + encodeURIComponent(user_email) + '&password=' + encodeURIComponent(user_passwd), this.httpOptions)//.pipe(retry(1), catchError(this.handleError))
  }

}
