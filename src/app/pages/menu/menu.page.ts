import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar,
  IonIcon, IonButtons, IonButton,
  IonRippleEffect, ToastController, LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  documentTextOutline, listOutline, qrCodeOutline, 
  logOutOutline, chevronForwardOutline, gameControllerOutline 
} from 'ionicons/icons';

import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonToolbar,
    IonIcon, IonButtons, IonButton,
    IonRippleEffect,
  ]
})
export class MenuPage {
  // 🚀 Inyección moderna y estricta
  readonly #router = inject(Router);
  readonly #supabaseService = inject(SupabaseService);
  readonly #toastController = inject(ToastController);
  readonly #loadingController = inject(LoadingController);

  constructor() {
    addIcons({ 
      documentTextOutline, listOutline, qrCodeOutline, 
      logOutOutline, chevronForwardOutline, gameControllerOutline 
    });
  }

  navigateTo(path: string) {
    this.#router.navigateByUrl(path);
  }

  async logout() {
    const loading = await this.#loadingController.create({
      message: 'Cerrando sesión...',
      spinner: 'lines-sharp',
      cssClass: 'custom-loading'
    });
    await loading.present();

    try {
      await this.#supabaseService.logout();
      await loading.dismiss();
      this.#router.navigateByUrl('/login', { replaceUrl: true });
    } catch (error: any) {
      await loading.dismiss();
      const toast = await this.#toastController.create({
        message: error.message || 'Error al cerrar sesión',
        duration: 3000,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
    }
  }
}