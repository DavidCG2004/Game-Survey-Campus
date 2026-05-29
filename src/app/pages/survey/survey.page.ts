import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Capacitor } from '@capacitor/core';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel,
  IonInput, IonSelect, IonSelectOption, IonButton, IonIcon,
  IonCard, IonCardContent, IonList, IonSpinner, IonImg,
  ToastController, LoadingController, IonTextarea,
  IonButtons, IonBackButton, IonGrid, IonRow, IonCol
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cameraOutline, searchOutline, saveOutline,
  checkmarkCircleOutline, closeCircleOutline, imagesOutline
} from 'ionicons/icons';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { SupabaseService, SurveyInsert } from '../../services/supabase.service';
import { PhotoService, CapturedEvidence } from '../../services/photo.service';
import { LocationService } from '../../services/location.service';
import { GameApiService, Game } from '../../services/game-api.service';

interface SurveyForm {
  respondent_name: FormControl<string>;
  age_range:       FormControl<string>;
  role:            FormControl<string>;
  campus_location: FormControl<string>;
  game_search:     FormControl<string>;
  favorite_game:   FormControl<string>;
  platform:        FormControl<string>;
  genre:           FormControl<string>;
  comment:         FormControl<string>;
}

@Component({
  selector: 'app-survey',
  templateUrl: './survey.page.html',
  styleUrls: ['./survey.page.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonInput, IonSelect, IonSelectOption,
    IonButton, IonIcon,
    IonSpinner, IonTextarea,
    IonButtons, IonBackButton, IonGrid, IonRow, IonCol // 🚀 Añadidos al import
  ],
})
export class SurveyPage implements OnInit {

  readonly #fb              = inject(FormBuilder);
  readonly #supabase        = inject(SupabaseService);
  readonly #photoService    = inject(PhotoService);
  readonly #locationService = inject(LocationService);
  readonly #gameApi         = inject(GameApiService);
  readonly #toastCtrl       = inject(ToastController);
  readonly #loadingCtrl     = inject(LoadingController);
  readonly #destroyRef      = inject(DestroyRef);

  surveyForm!: FormGroup<SurveyForm>;
  readonly evidencePhoto  = signal<CapturedEvidence | null>(null);
  readonly searchResults  = signal<Game[]>([]);
  readonly isSearching    = signal<boolean>(false);
  readonly isSubmitting   = signal<boolean>(false);

  readonly isNative = Capacitor.isNativePlatform();

  constructor() {
    addIcons({
      cameraOutline, searchOutline, saveOutline,
      checkmarkCircleOutline, closeCircleOutline, imagesOutline,
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.setupGameSearch();
  }

  private initForm(): void {
    this.surveyForm = this.#fb.nonNullable.group({
      respondent_name: ['', [Validators.required, Validators.minLength(3)]],
      age_range:       ['', Validators.required],
      role:            ['', Validators.required],
      campus_location: ['', Validators.required],
      game_search:     [''],
      favorite_game:   ['', Validators.required],
      platform:        ['', Validators.required],
      genre:           ['', Validators.required],
      comment:         [''],
    });
  }

  private setupGameSearch(): void {
    this.surveyForm.controls.game_search.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntilDestroyed(this.#destroyRef),
    ).subscribe(async (searchTerm: string) => {
      if (!searchTerm || searchTerm.length < 3) {
        this.searchResults.set([]);
        return;
      }
      this.isSearching.set(true);
      try {
        const results = await this.#gameApi.searchGameByName(searchTerm);
        this.searchResults.set(results.slice(0, 5));
      } catch {
        this.showToast('Error al buscar juegos', 'danger');
      } finally {
        this.isSearching.set(false);
      }
    });
  }

  selectGame(game: Game): void {
    this.surveyForm.patchValue({
      favorite_game: game.title,
      platform:      game.platform,
      genre:         game.genre,
      game_search:   '',
    });
    this.searchResults.set([]);
  }

  clearGame(): void {
    this.surveyForm.patchValue({
      favorite_game: '',
      platform:      '',
      genre:         '',
      game_search:   '',
    });
    this.searchResults.set([]);
  }

  async takePhoto(): Promise<void> {
    try {
      const photo = await this.#photoService.takeOrSelectPhoto();
      if (photo) this.evidencePhoto.set(photo);
    } catch (error: any) {
      this.showToast(error.message ?? 'Error al seleccionar imagen', 'danger');
    }
  }

  async submitSurvey(): Promise<void> {
    if (this.surveyForm.invalid) {
      this.surveyForm.markAllAsTouched();
      this.showToast('Completa todos los campos obligatorios.', 'warning');
      return;
    }
    if (!this.evidencePhoto()) {
      this.showToast('Debes adjuntar una imagen de evidencia.', 'warning');
      return;
    }

    this.isSubmitting.set(true);
    // 🚀 Loader adaptado al diseño minimalista
    const loading = await this.#loadingCtrl.create({ 
      message: 'Obteniendo GPS y guardando...',
      spinner: 'lines-sharp',
      cssClass: 'custom-loading'
    });
    await loading.present();

    try {
      const session = await this.#supabase.getSession();
      if (!session) throw new Error('No hay sesión activa.');

      const coords   = await this.#locationService.getCurrentPosition();
      const imageUrl = await this.#supabase.uploadEvidence(this.evidencePhoto()!.blob);

      const formValue = this.surveyForm.getRawValue();
      const newSurvey: SurveyInsert = {
        respondent_name: formValue.respondent_name,
        age_range:       formValue.age_range,
        role:            formValue.role,
        campus_location: formValue.campus_location,
        favorite_game:   formValue.favorite_game,
        platform:        formValue.platform,
        genre:           formValue.genre,
        comment:         formValue.comment,
        latitude:        coords.latitude,
        longitude:       coords.longitude,
        image_url:       imageUrl,
        user_id:         session.user.id,
      };

      await this.#supabase.insertSurvey(newSurvey);
      await loading.dismiss();
      this.showToast('¡Encuesta registrada con éxito!', 'success');
      this.resetForm();

    } catch (error: any) {
      await loading.dismiss();
      console.error(error);
      this.showToast(`Error: ${error.message}`, 'danger');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private resetForm(): void {
    this.surveyForm.reset();
    this.evidencePhoto.set(null);
    this.searchResults.set([]);
  }

  private async showToast(message: string, color: 'success' | 'warning' | 'danger'): Promise<void> {
    const toast = await this.#toastCtrl.create({
      message, 
      duration: 3000, 
      color, 
      position: 'top', // 🚀 Posición top para no tapar el botón de submit
      cssClass: 'minimal-toast'
    });
    toast.present();
  }
}