import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OAuthService, AuthConfig } from 'angular-oauth2-oidc';
import { HttpClient } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { environment } from '../enviroments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ButtonModule, CardModule, CommonModule],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  username: string | null = null;
  apiResponse = '';

  constructor(private oauthService: OAuthService, private http: HttpClient) {
    this.configureOAuth();
  }

  ngOnInit(): void {
    this.oauthService.loadDiscoveryDocumentAndTryLogin().then(() => {
      this.updateLoginStatus();
    });
  }

  private configureOAuth() {
    const authConfig: AuthConfig = {
      issuer: environment.keycloak.issuer,
      redirectUri: window.location.origin,
      clientId: environment.keycloak.clientId,
      scope: 'openid profile email',
      responseType: 'code',
      dummyClientSecret: environment.keycloak.clientSecret,
    };
    this.oauthService.configure(authConfig);
  }

  private updateLoginStatus() {
    this.isLoggedIn = this.oauthService.hasValidAccessToken();
    if (this.isLoggedIn) {
      const claims = this.oauthService.getIdentityClaims();
      this.username = claims ? (claims as any)['name'] : 'User';
    }
  }

  login() {
    this.oauthService.initCodeFlow();
  }

  logout() {
    this.oauthService.logOut();
    this.updateLoginStatus();
  }

  callProtectedApi() {
    this.http.get('http://localhost:8000/api/protected').subscribe({
      next: (response: any) => this.apiResponse = response.message,
      error: (err) => this.apiResponse = 'Errore: ' + err.message
    });
  }

  callPublicApi() {
    this.http.get('http://localhost:8000/api/public').subscribe({
      next: (response: any) => this.apiResponse = response.message,
      error: (err) => this.apiResponse = 'Errore: ' + err.message
    });
  }
}