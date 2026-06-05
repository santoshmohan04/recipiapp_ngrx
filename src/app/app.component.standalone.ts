import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, shareReplay, filter } from 'rxjs/operators';
import * as AuthActions from './store/auth/auth.actions';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
    AsyncPipe,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatMenuModule
  ],
  templateUrl: './app.component.standalone.html',
  styleUrls: ['./app.component.standalone.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('drawer') drawer!: MatSidenav;
  
  private store = inject(Store);
  private breakpointObserver = inject(BreakpointObserver);
  private router = inject(Router);
  
  pageTitle = signal('Recipe Book');
  authState$ = this.store.select('auth');
  
  isHandset$: Observable<boolean> = this.breakpointObserver.observe([Breakpoints.Handset])
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  ngOnInit() {
    this.store.dispatch(AuthActions.autoLogin());
    
    // Update page title based on route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updatePageTitle();
    });
  }
  
  private updatePageTitle() {
    const url = this.router.url;
    if (url.includes('/recipes')) {
      this.pageTitle.set('Recipes');
    } else if (url.includes('/favorites')) {
      this.pageTitle.set('Favorites');
    } else if (url.includes('/shopping-list')) {
      this.pageTitle.set('Shopping List');
    } else if (url.includes('/profile')) {
      this.pageTitle.set('Profile');
    } else if (url.includes('/auth')) {
      this.pageTitle.set('Authentication');
    } else {
      this.pageTitle.set('Recipe Book');
    }
  }
  
  closeSidenavOnMobile() {
    this.isHandset$.subscribe(isHandset => {
      if (isHandset && this.drawer) {
        this.drawer.close();
      }
    });
  }
  
  onLogout() {
    this.store.dispatch(AuthActions.logout());
  }
}
