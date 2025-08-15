import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ButtonModule,
    CardModule,
    CommonModule
  ],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  username: string | null = null;
  apiResponse = '';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.checkLoginStatus();
  }

  private checkLoginStatus(): void {
    this.http.get(`${environment.backendUrl}/api/auth/me`, { withCredentials: true })
      .subscribe({
        next: (res: any) => {
          this.isLoggedIn = true;
          this.username = res.username;
        },
        error: () => {
          this.isLoggedIn = false;
          this.username = null;
        }
      });
  }

  login() {
    window.location.href = `${environment.backendUrl}/api/auth/login`;
  }

  logout() {
    this.http.get(`${environment.backendUrl}/api/auth/logout`, { withCredentials: true })
      .subscribe({
        next: () => {
          this.isLoggedIn = false;
          this.username = null;
          this.apiResponse = '';
        },
        error: () => {
          this.isLoggedIn = false;
          this.username = null;
          this.apiResponse = '';
        }
      });
  }
}
