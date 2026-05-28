import { Component, OnInit, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel,
  IonInput, IonSelect, IonSelectOption, IonButton, IonIcon,
  IonCard, IonCardContent, IonList, IonSpinner, IonImg,
  ToastController, LoadingController, IonTextarea
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cameraOutline, searchOutline, saveOutline,
  checkmarkCircleOutline, closeCircleOutline
} from 'ionicons/icons';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

import { SupabaseService, SurveyInsert } from '../../services/supabase.service';
import { PhotoService, CapturedEvidence } from '../../services/photo.service';
import { LocationService } from '../../services/location.service';
import { GameApiService, Game } from '../../services/game-api.service';

@Component({
  selector: 'app-survey',
  templateUrl: './survey.page.html',
  styleUrls: ['./survey.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonItem, IonLabel, IonInput, IonSelect, IonSelectOption,
    IonButton, IonIcon, IonCard, IonCardContent,
    IonList, IonSpinner, IonImg, IonTextarea,
  ],
})
export class SurveyPage implements OnInit, OnDestroy {

  // ── Dependencias ──────────────────────────────────────────────
  readonly #fb              = inject(FormBuilder);
  readonly #supabase        = inject(SupabaseService);
  readonly #photoService    = inject(PhotoService);
  readonly #locationService = inject(LocationService);
  readonly #gameApi         = inject(GameApiService);
  readonly #toastCtrl       = inject(ToastController);
  readonly #loadingCtrl     = inject(LoadingController);

  // ── Estado reactivo ───────────────────────────────────────────
  surveyForm!: FormGroup;
  evidencePhoto  = signal<CapturedEvidence | null>(null);
  searchResults  = signal<Game[]>([]);
  isSearching    = signal<boolean>(false);

  readonly #destroy$ = new Subject<void>();

  // ── Lifecycle ────────────────────────────────────────────────
  constructor() {
    addIcons({
      cameraOutline, searchOutline, saveOutline,
      checkmarkCircleOutline, closeCircleOutline,
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.setupGameSearch();
  }

  ngOnDestroy(): void {
    this.#destroy$.next();
    this.#destroy$.complete();
  }

  // ── 1. Formulario ─────────────────────────────────────────────
  private initForm(): void {
    this.surveyForm = this.#fb.group({
      respondent_name:  ['', [Validators.required, Validators.minLength(3)]],
      age_range:        ['', Validators.required],
      role:             ['', Validators.required],
      campus_location:  ['', Validators.required],
      game_search:      [''],           // campo visual, no se persiste
      favorite_game:    ['', Validators.required],
      platform:         ['', Validators.required],
      genre:            ['', Validators.required],
      comment:          [''],
    });
  }

  // ── 2. Búsqueda predictiva con debounce ───────────────────────
  private setupGameSearch(): void {
    this.surveyForm.get('game_search')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.#destroy$),
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

  // ── 3. Selección y limpieza de juego ─────────────────────────
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

  // ── 4. Foto de evidencia ──────────────────────────────────────
  async takePhoto(): Promise<void> {
    try {
      const photo = await this.#photoService.takeOrSelectPhoto();
      if (photo) this.evidencePhoto.set(photo);
    } catch (error: any) {
      this.showToast(error.message, 'danger');
    }
  }

  // ── 5. Guardar encuesta (orquestación de servicios) ───────────
  async submitSurvey(): Promise<void> {
    if (this.surveyForm.invalid) {
      this.surveyForm.markAllAsTouched();
      this.showToast('Completa todos los campos obligatorios.', 'warning');
      return;
    }
    if (!this.evidencePhoto()) {
      this.showToast('Debes tomar una foto de evidencia.', 'warning');
      return;
    }

    const loading = await this.#loadingCtrl.create({ message: 'Guardando encuesta...' });
    await loading.present();

    try {
      // 1. Sesión activa
      const session = await this.#supabase.getSession();
      if (!session) throw new Error('No hay sesión activa.');

      // 2. GPS
      const coords = await this.#locationService.getCurrentPosition();

      // 3. Subir foto → URL pública
      const imageUrl = await this.#supabase.uploadEvidence(this.evidencePhoto()!.blob);

      // 4. Construir payload
      const { game_search, ...formValue } = this.surveyForm.value;
      const newSurvey: SurveyInsert = {
        ...formValue,
        latitude:  coords.latitude,
        longitude: coords.longitude,
        image_url: imageUrl,
        user_id:   session.user.id,
      };

      // 5. Persistir
      await this.#supabase.insertSurvey(newSurvey);

      this.showToast('¡Encuesta registrada con éxito!', 'success');
      this.resetForm();

    } catch (error: any) {
      console.error(error);
      this.showToast(`Error: ${error.message}`, 'danger');
    } finally {
      loading.dismiss();
    }
  }

  // ── Helpers ───────────────────────────────────────────────────
  private resetForm(): void {
    this.surveyForm.reset();
    this.evidencePhoto.set(null);
    this.searchResults.set([]);
  }

  private async showToast(message: string, color: 'success' | 'warning' | 'danger'): Promise<void> {
    const toast = await this.#toastCtrl.create({ message, duration: 3000, color, position: 'bottom' });
    toast.present();
  }
}