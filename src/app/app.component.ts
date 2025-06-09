import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './auth/auth.service';
import { HeaderComponent } from './shared/header/header.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent],
  template: `
    <div class="app-container" [class.with-sidebar]="showSidebar">
      <app-sidebar *ngIf="showSidebar"></app-sidebar>
      <div class="content-area">
        <app-header *ngIf="showSidebar"></app-header>
        <main>
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      min-height: 100vh;
    }
    
    .with-sidebar .content-area {
      flex: 1;
      margin-left: 240px;
    }
    
    .content-area {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    
    main {
      flex: 1;
      padding: 24px;
      background-color: var(--background);
    }
  `]
})
export class AppComponent implements OnInit {
  showSidebar = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Don't show sidebar on login page
      this.showSidebar = !event.url.includes('/login');
    });
  }
}