import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  /**
   * Obtiene la latitud y longitud actual del dispositivo.
   * Maneja internamente la solicitud de permisos al usuario.
   */
  async getCurrentPosition(): Promise<GeoCoordinates> {
    try {
      // 1. Verificamos y solicitamos permisos nativos si es necesario
      const permissions = await Geolocation.checkPermissions();
      if (permissions.location !== 'granted') {
        const request = await Geolocation.requestPermissions();
        if (request.location !== 'granted') {
          throw new Error('Permisos de ubicación denegados por el usuario.');
        }
      }

      // 2. Obtenemos la coordenada con alta precisión (ideal para dentro de un campus)
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000, // Tiempo máximo de espera: 10 segundos
        maximumAge: 0   // Forzar a buscar la ubicación actual, no usar caché
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };

    } catch (error: any) {
      console.error('Error de GPS:', error);
      throw new Error('No se pudo obtener la ubicación. Verifica que tu GPS esté activo.');
    }
  }
}