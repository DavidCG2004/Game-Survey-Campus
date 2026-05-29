import { Component, OnInit, inject, signal } from '@angular/core';
import { computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SurveyDetailModal } from './survey-detail/survey-detail.modal';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonSpinner, IonIcon, IonButton,
  ModalController, ToastController, AlertController, IonSegment, IonSegmentButton, IonLabel
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  gameControllerOutline, desktopOutline, tvOutline, phonePortraitOutline,
  globeOutline, addOutline, createOutline, trashOutline, star
} from 'ionicons/icons';

import { SupabaseService, Survey } from '../../services/supabase.service';

@Component({
  selector: 'app-feed',
  standalone: true,
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
    IonSpinner, IonIcon, IonSegment, IonSegmentButton, IonLabel
  ],
})
export class FeedPage implements OnInit {

  // ── Dependencias ──────────────────────────────────────────────
  readonly #supabaseService = inject(SupabaseService);
  readonly #toastCtrl       = inject(ToastController);
  readonly #modalCtrl       = inject(ModalController); // Listo para el modal
  readonly #alertCtrl       = inject(AlertController);

  // ── Estado reactivo ───────────────────────────────────────────
  readonly surveys   = signal<Survey[]>([]);
  readonly isLoading = signal<boolean>(true);
  selectedRole = signal<string>('Todos');
  totalSurveys = computed(() => this.surveys().length);

    filteredSurveys = computed(() => {
    const all = this.surveys();
    const role = this.selectedRole();
    if (role === 'Todos') return all;
    return all.filter(s => s.role === role);
  });

    totalFiltered = computed(() => this.filteredSurveys().length);
      
    onRoleChange(event: any) {
    // Forzamos el tipado a string para que Angular Signals esté feliz
    this.selectedRole.set(event.detail.value as string);
  }



  constructor() {
    addIcons({
      gameControllerOutline, desktopOutline, tvOutline, phonePortraitOutline,
      globeOutline, addOutline, createOutline, trashOutline, star
    });
  }

  ngOnInit(): void {
    this.loadSurveys();
  }
  
  
topPlatform = computed(() => {
  const data = this.surveys();
  if (data.length === 0) return 'N/A';
  // Lógica simple para encontrar la plataforma más repetida
  const counts = data.reduce((acc, curr) => {
    acc[curr.platform] = (acc[curr.platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
});
  

  async loadSurveys(): Promise<void> {
    this.isLoading.set(true);
    try {
      const data = await this.#supabaseService.getSurveys();
      this.surveys.set(data);
    } catch (error: any) {
      this.showToast(error.message ?? 'Error al cargar el catálogo', 'danger');
    } finally {
      this.isLoading.set(false);
    }
  }

  // ── Acciones de UI ────────────────────────────────────────────
  
async openDetail(survey: Survey) {
  const modal = await this.#modalCtrl.create({
    component: SurveyDetailModal,
    componentProps: { survey },
    breakpoints: [0, 1],
    initialBreakpoint: 1,
  });
  await modal.present();
}

  // Placeholders para botones CRUD (Opcionales si los deseas usar luego)
  editSurvey(survey: Survey, event: Event) {
    event.stopPropagation(); // Evita que se abra el modal al hacer click en el botón
    this.showToast('Función de editar pendiente', 'warning');
  }

  async confirmDelete(survey: Survey, event: Event) {
    event.stopPropagation();
    const alert = await this.#alertCtrl.create({
      header: 'Eliminar registro',
      message: `¿Borrar la encuesta de <strong>${survey.favorite_game}</strong>?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => this.showToast('Eliminando...', 'danger') }
      ]
    });
    await alert.present();
  }

  // ── Helpers ───────────────────────────────────────────────────
  getPlatformIcon(platform: string): string {
    const map: Record<string, string> = {
      'PC': 'desktop-outline',
      'Consola': 'tv-outline',
      'Móvil': 'phone-portrait-outline',
      'Navegador': 'globe-outline',
    };
    return map[platform] ?? 'game-controller-outline';
  }

  private async showToast(message: string, color: 'danger' | 'success' | 'warning'): Promise<void> {
    const toast = await this.#toastCtrl.create({ message, duration: 2000, position: 'top', color, cssClass: 'minimal-toast' });
    await toast.present();
  }

}