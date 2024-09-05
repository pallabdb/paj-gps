import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../../services/auth/login.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: any = {
    user_email: '',
    user_passwd: ''
  }

  constructor(private api: LoginService, private snackBar: MatSnackBar, private router: Router) { }

  ngOnInit(): void {
  }

  onSubmit() {
    this.api.login(this.loginForm.user_email, this.loginForm.user_passwd).subscribe((data: any) => {
      console.log(data)
      if (data && data.success) {
        console.log('Success:', data);
        localStorage.setItem('auth-token', JSON.stringify(data?.success))
        this.router.navigate(['/', 'home'])
      }
    },
      (error: any) => {
        // Handle error response
        let err = error.error.error
        console.log(err)
        if (err && typeof err === 'object') {
          const errorKeys = Object.keys(err);
          if (errorKeys.length > 0) {
            const firstErrorKey = errorKeys[0];
            const errorMessage = err[firstErrorKey];
            this.snackBar.open(errorMessage, 'Close', {
              duration: 3000,
            });
          }
        } else {
          this.snackBar.open('An unknown error occurred', 'Close', {
            duration: 3000,
          });
        }
      })
  }

}
