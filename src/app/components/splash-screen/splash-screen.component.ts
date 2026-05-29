import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { gameController } from 'ionicons/icons';


@Component({
  selector: 'app-splash-screen',
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.scss'],
  standalone: true,
  imports: [IonContent, IonIcon]
})
export class SplashScreenComponent implements OnInit {
  readonly #router = inject(Router);

  constructor() {
    addIcons({ gameController });
  }

  ngOnInit() {
    // Simulamos un tiempo de carga de 2.5 segundos antes de ir al Login
    setTimeout(() => {
      // Cambia '/login' por la ruta principal de tu app si es necesario
      this.#router.navigate(['/login'], { replaceUrl: true });
    }, 2500);
  }
}
