import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './_services/auth.service';

export function roleGuardFn(allowedRoles: string[]): CanActivateFn {
  return (): boolean => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const token = authService.getToken();
    if (!token) {
      router.navigate(['/login']);
      return false;
    }

    authService.decodeToken(token);
    const user = authService.getDecodedToken();

    if (!user || !allowedRoles.includes(user.role)) {
      router.navigate(['/unauthorized']); // 🚫 Redirection en cas de rôle incorrect
      return false;
    }

    return true;
  };
}
