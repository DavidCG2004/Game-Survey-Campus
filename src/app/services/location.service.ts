import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

@Injectable({ providedIn: 'root' })
export class LocationService {

  /**
   * Punto de entrada único.
   * En iOS/Android → Capacitor Geolocation (GPS nativo + permisos nativos).
   * En web/desktop → navigator.geolocation (API estándar del navegador).
   */
  async getCurrentPosition(): Promise<GeoCoordinates> {
    return Capacitor.isNativePlatform()
      ? this.getPositionNative()
      : this.getPositionWeb();
  }

  // ── Nativo: iOS / Android ─────────────────────────────────────
  private async getPositionNative(): Promise<GeoCoordinates> {
    try {
      const permissions = await Geolocation.checkPermissions();
      if (permissions.location !== 'granted') {
        const request = await Geolocation.requestPermissions();
        if (request.location !== 'granted') {
          throw new Error('Permisos de ubicación denegados por el usuario.');
        }
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });

      return {
        latitude:  position.coords.latitude,
        longitude: position.coords.longitude,
      };

    } catch (error: any) {
      console.error('Error de GPS (Capacitor):', error);
      throw new Error('No se pudo obtener la ubicación. Verifica que tu GPS esté activo.');
    }
  }

  // ── Web / Desktop: navigator.geolocation ─────────────────────
  private getPositionWeb(): Promise<GeoCoordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Tu navegador no soporta geolocalización.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude:  position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          // Mapeamos los códigos de error estándar de la Geolocation API
          const messages: Record<number, string> = {
            1: 'Permiso de ubicación denegado. Habilítalo en la configuración del navegador.',
            2: 'No se pudo determinar la ubicación. Verifica tu conexión o GPS.',
            3: 'Tiempo de espera agotado al obtener la ubicación.',
          };
          const message = messages[error.code] ?? 'Error desconocido al obtener ubicación.';
          console.error('Error de GPS (Web):', error);
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    });
  }
}