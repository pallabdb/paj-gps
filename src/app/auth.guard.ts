import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(private router: Router) { }

  canActivate(): boolean {
    const token = localStorage.getItem('auth-token');

    if (token) {
      // Optionally, you can also check the validity of the token here
      return true;
    } else {
      // Redirect to login page if not authorized
      this.router.navigate(['login']);
      return false;
    }
  }
  
}
