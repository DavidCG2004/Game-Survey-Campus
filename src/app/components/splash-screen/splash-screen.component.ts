import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { codeSlashOutline } from 'ionicons/icons';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-splash-screen',
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.scss'],
  standalone: true,
  imports: [IonContent, IonIcon]
})
export class SplashScreenComponent {
  private router = inject(Router);
  private supabaseService = inject(SupabaseService);

  constructor() {
    addIcons({ codeSlashOutline });
  }

  async ngOnInit() {
    await this.delay(2400);
    const session = await this.supabaseService.getSession();
    this.router.navigateByUrl(session ? '/menu' : '/login', { replaceUrl: true });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}