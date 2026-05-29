import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  const session = await supabaseService.getSession();

  if (session) {
    // Si hay sesión, lo dejamos pasar
    return true; 
  } else {
    // Si NO hay sesión, lo pateamos al login
    router.navigate(['/login'], { replaceUrl: true });
    return false; 
  }
};