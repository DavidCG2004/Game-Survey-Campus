import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { addIcons } from 'ionicons';
import { 
  closeOutline, 
  desktopOutline, 
  locationOutline, 
  calendarOutline, 
  gameControllerOutline,
  personOutline
} from 'ionicons/icons';
import { 
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, 
  IonIcon, IonContent, ModalController 
} from '@ionic/angular/standalone';
import { Survey } from '../../../services/supabase.service'; // Ajusta la ruta a tu interface

@Component({
  selector: 'app-survey-detail-modal',
  standalone: true,
  imports: [
    CommonModule, DatePipe,
    IonHeader, IonToolbar, IonButtons, IonButton, 
    IonIcon, IonContent
  ],
  template: `
    <ion-header class="ion-no-border custom-bg">
      <ion-toolbar class="transparent-toolbar">
        <ion-buttons slot="end">
          <!-- Botón de cerrar estilizado y sutil -->
          <ion-button (click)="dismiss()" class="close-btn">
            <ion-icon slot="icon-only" name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="custom-bg ion-padding-bottom">
      
      <!-- Contenedor de la Evidencia (Imagen) -->
      <div class="evidence-container">
        @if (survey.image_url) {
          <img [src]="survey.image_url" [alt]="survey.favorite_game" loading="lazy" />
        } @else {
          <div class="no-evidence">
            <ion-icon name="game-controller-outline"></ion-icon>
            <span>Sin evidencia fotográfica</span>
          </div>
        }
      </div>

      <!-- Cuerpo de la información -->
      <div class="detail-body">
        
        <!-- Header del detalle -->
        <div class="header-info">
          <span class="genre-badge">{{ survey.genre }}</span>
          <h1 class="game-title">{{ survey.favorite_game }}</h1>
          <p class="respondent">
            Encuesta por <strong>{{ survey.respondent_name }}</strong> 
            <span class="role-tag"> ({{ survey.role }})</span>
          </p>
        </div>

        <hr class="divider" />

        <!-- Lista de Metadatos Minimalista -->
        <div class="meta-list">
          
          <!-- Plataforma -->
          <div class="meta-item">
            <div class="icon-box">
              <ion-icon name="desktop-outline"></ion-icon>
            </div>
            <div class="text-content">
              <span class="label">Plataforma</span>
              <span class="value">{{ survey.platform }}</span>
            </div>
          </div>

          <!-- Ubicación -->
          <div class="meta-item">
            <div class="icon-box">
              <ion-icon name="location-outline"></ion-icon>
            </div>
            <div class="text-content">
              <span class="label">{{ survey.campus_location }}</span>
              <span class="value coords">({{ survey.latitude | number:'1.4-4' }}, {{ survey.longitude | number:'1.4-4' }})</span>
            </div>
          </div>

          <!-- Fecha -->
          <div class="meta-item">
            <div class="icon-box">
              <ion-icon name="calendar-outline"></ion-icon>
            </div>
            <div class="text-content">
              <span class="label">Fecha de registro</span>
              <span class="value">{{ survey.created_at | date:'dd MMM yyyy, HH:mm' }}</span>
            </div>
          </div>

        </div>

        <!-- Comentario (Cita) -->
        @if (survey.comment) {
          <div class="comment-section">
            <div class="comment-header">
              <ion-icon name="person-outline"></ion-icon>
              <span>Comentario del estudiante</span>
            </div>
            <div class="comment-box">
              <p>"{{ survey.comment }}"</p>
            </div>
          </div>
        }

      </div>
    </ion-content>
  `,
  styleUrls: ['./survey-detail.modal.scss'],
})
export class SurveyDetailModal {
  @Input() survey!: Survey;
  readonly #modalCtrl = inject(ModalController);

  constructor() {
    // Registro exclusivo de íconos usados
    addIcons({ closeOutline, desktopOutline, locationOutline, calendarOutline, gameControllerOutline, personOutline });
  }

  dismiss() {
    this.#modalCtrl.dismiss();
  }
}