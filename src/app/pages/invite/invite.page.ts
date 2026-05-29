import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonButtons, IonBackButton, 
  IonContent, IonIcon 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  gameControllerOutline, 
  qrCodeOutline, 
  downloadOutline, 
  personAddOutline,
  shareSocialOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-invite',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonButtons, IonBackButton, 
    IonContent, IonIcon
  ],
  templateUrl: './invite.page.html',
  styleUrls: ['./invite.page.scss']
})
export class InvitePage {
  readonly #router = inject(Router);

  constructor() {
    addIcons({ 
      gameControllerOutline, qrCodeOutline, 
      downloadOutline, personAddOutline, shareSocialOutline 
    });
  }

  goToRegister() {
    // Ajusta la ruta según cómo llamaste a tu página de registro
    this.#router.navigate(['/register']);
  }

  downloadAPK() {
    // Aquí puedes poner el enlace directo a tu APK en GitHub o Drive
    window.open('https://github.com/DavidCG2004/Game-Survey-Campus/blob/main/releases/latest/GameSurveyCampus.apk', '_blank');
  }
}
