import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { 
  IonContent, IonButton, IonInput, IonIcon, 
  ToastController, LoadingController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline, personAddOutline, arrowBackOutline } from 'ionicons/icons';

import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports:[
    CommonModule, 
    ReactiveFormsModule, 
    RouterLink, 
    IonContent, IonButton, IonInput, IonIcon
  ]
})
export class RegisterPage {
  // 🚀 Dependencias con inyección moderna y variables privadas (#)
  readonly #fb = inject(FormBuilder);
  readonly #supabaseService = inject(SupabaseService);
  readonly #router = inject(Router);
  readonly #toastController = inject(ToastController);
  readonly #loadingController = inject(LoadingController);

  registerForm: FormGroup;

  constructor() {
    addIcons({ mailOutline, lockClosedOutline, personAddOutline, arrowBackOutline });

    this.registerForm = this.#fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async onRegister() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const loading = await this.#loadingController.create({
      message: 'Creando cuenta...',
      spinner: 'lines-sharp', // Spinner minimalista
      cssClass: 'custom-loading'
    });
    await loading.present();

    const { email, password } = this.registerForm.getRawValue();

    try {
      // 🚀 Corregido: Llamamos a register() tal como está definido en tu SupabaseService
      await this.#supabaseService.register(email, password);

      await loading.dismiss();
      this.showToast('Cuenta creada exitosamente. Por favor, inicia sesión.', 'success');
      this.registerForm.reset();
      this.#router.navigateByUrl('/login', { replaceUrl: true });

    } catch (error: any) {
      await loading.dismiss();
      this.showToast(error.message || 'Error al crear la cuenta', 'danger');
    }
  }

  private async showToast(message: string, color: 'success' | 'danger') {
    const toast = await this.#toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top', // Alineado arriba igual que en el login
      cssClass: 'minimal-toast'
    });
    await toast.present();
  }
}