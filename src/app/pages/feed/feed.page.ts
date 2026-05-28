import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonRefresher, IonRefresherContent,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonChip, IonLabel, IonIcon, IonSkeletonText, IonText,
  IonInfiniteScroll, IonInfiniteScrollContent,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  gameControllerOutline, locationOutline, calendarOutline,
  personOutline, desktopOutline, phonePortraitOutline,
  tvOutline, globeOutline, chatbubbleOutline, trophyOutline
} from 'ionicons/icons';

import { SupabaseService, Survey } from '../../services/supabase.service';

@Component({
  selector: 'app-feed',
  standalone: true,
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
  imports: [
    DatePipe,
    DecimalPipe,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonRefresher, IonRefresherContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
    IonChip, IonLabel, IonIcon, IonSkeletonText, IonText,
    IonInfiniteScroll, IonInfiniteScrollContent,
  ],
})
export class FeedPage implements OnInit {

  // ── Dependencias ──────────────────────────────────────────────
  private readonly supabaseService = inject(SupabaseService);
  private readonly toastCtrl       = inject(ToastController);

  // ── Estado reactivo ───────────────────────────────────────────
  readonly surveys   = signal<Survey[]>([]);
  readonly isLoading = signal<boolean>(true);

  // Array para iterar skeletons en template
  readonly skeletons = Array(3);

  // ── Lifecycle ────────────────────────────────────────────────
  constructor() {
    addIcons({
      gameControllerOutline, locationOutline, calendarOutline,
      personOutline, desktopOutline, phonePortraitOutline,
      tvOutline, globeOutline, chatbubbleOutline, trophyOutline
    });
  }

  ngOnInit(): void {
    this.loadSurveys();
  }

  // ── Carga de datos ────────────────────────────────────────────
  async loadSurveys(): Promise<void> {
    this.isLoading.set(true);
    try {
      const data = await this.supabaseService.getSurveys();
      this.surveys.set(data);
    } catch (error: any) {
      await this.showToast(error.message ?? 'Error al cargar encuestas', 'danger');
    } finally {
      this.isLoading.set(false);
    }
  }

  // ── Pull-to-refresh ───────────────────────────────────────────
  async handleRefresh(event: any): Promise<void> {
    try {
      const data = await this.supabaseService.getSurveys();
      this.surveys.set(data);
    } catch (error: any) {
      await this.showToast(error.message ?? 'Error al actualizar', 'danger');
    } finally {
      event.target.complete();
    }
  }

  // ── Infinite scroll (stub para paginación futura) ─────────────
  async loadMore(event: any): Promise<void> {
    // Aquí se implementaría paginación con .range(offset, limit) de Supabase
    event.target.disabled = true;
  }

  // ── Helpers ───────────────────────────────────────────────────
  getPlatformIcon(platform: string): string {
    const map: Record<string, string> = {
      'PC':        'desktop-outline',
      'Consola':   'tv-outline',
      'Móvil':     'phone-portrait-outline',
      'Navegador': 'globe-outline',
    };
    return map[platform] ?? 'game-controller-outline';
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  // ── Toast helper ──────────────────────────────────────────────
  private async showToast(message: string, color: 'danger' | 'success' | 'warning'): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom',
      color,
    });
    await toast.present();
  }
}