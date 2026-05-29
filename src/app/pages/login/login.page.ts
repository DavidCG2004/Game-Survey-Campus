import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent, IonInput, IonButton, IonIcon,             
  LoadingController, ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline, chevronForwardOutline, gameControllerOutline } from 'ionicons/icons';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,RouterLink, FormsModule,
    IonContent, IonInput, IonButton, IonIcon,              
  ]
})
export class LoginPage implements OnInit {
  // 🚀 Signals correctos
  readonly email = signal<string>('');
  readonly password = signal<string>('');

  readonly #supabaseService = inject(SupabaseService);
  readonly #router = inject(Router);
  readonly #loadingCtrl = inject(LoadingController);
  readonly #toastCtrl = inject(ToastController);

  constructor() {
    // Añadimos gameControllerOutline para el diseño minimalista
    addIcons({ mailOutline, lockClosedOutline, chevronForwardOutline, gameControllerOutline });
  }

  async ngOnInit() {
    const session = await this.#supabaseService.getSession();
    if (session) {
      this.#router.navigateByUrl('/menu', { replaceUrl: true });
    }
  }

  async login() {
    if (!this.isValidForm()) return;
    const loading = await this.showLoading('Iniciando sesión...');
    
    try {
      await this.#supabaseService.login(this.email(), this.password());
      await loading.dismiss();
      this.showToast('¡Bienvenido!', 'success');
      this.#router.navigateByUrl('/menu', { replaceUrl: true });
    } catch (error: any) {
      await loading.dismiss();
      this.showToast(error.message, 'danger');
    }
  }

  async register() {
    if (!this.isValidForm()) return;
    const loading = await this.showLoading('Registrando usuario...');
    
    try {
      await this.#supabaseService.register(this.email(), this.password());
      await loading.dismiss();
      this.showToast('Usuario registrado exitosamente', 'success');
    } catch (error: any) {
      await loading.dismiss();
      this.showToast(error.message, 'danger');
    }
  }

  private isValidForm(): boolean {
    if (!this.email() || !this.password()) {
      this.showToast('Por favor, ingresa correo y contraseña', 'warning');
      return false;
    }
    return true;
  }

  private async showLoading(message: string) {
    const loading = await this.#loadingCtrl.create({ 
      message, 
      spinner: 'lines-sharp', // Spinner más moderno
      cssClass: 'custom-loading'
    });
    await loading.present();
    return loading;
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.#toastCtrl.create({ 
      message, 
      duration: 3000, 
      color, 
      position: 'top', // Arriba se ve más limpio en diseño minimalista
      cssClass: 'minimal-toast'
    });
    await toast.present();
  }
}