import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const roles = route.data['roles'] as string[];
    
    if (this.authService.hasRole(roles)) {
      return true;
    }
    
    // Redirect based on role
    if (this.authService.currentUser?.role === 'medico') {
      this.router.navigate(['/patients']);
    } else if (this.authService.currentUser?.role === 'enfermeiro') {
      this.router.navigate(['/triage']);
    } else if (this.authService.currentUser?.role === 'admin') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
    
    return false;
  }
}