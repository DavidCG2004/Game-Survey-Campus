import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

// Interfaz para estandarizar la respuesta de la cámara
export interface CapturedEvidence {
  blob: Blob;           // El archivo binario listo para subir a Supabase
  webviewPath: string;  // URL local temporal para mostrar un "preview" en el HTML
}

@Injectable({
  providedIn: 'root',
})
export class PhotoService {

  /**
   * Abre un menú nativo para que el usuario elija entre tomar foto o usar galería.
   * Retorna un objeto con el Blob (para Supabase) y el webviewPath (para la UI).
   * Si el usuario cancela, retorna null.
   */
  async takeOrSelectPhoto(): Promise<CapturedEvidence | null> {
    try {
      // 1. Invocamos el plugin nativo de Capacitor
      const capturedPhoto = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        // CameraSource.Prompt abre un menú nativo preguntando: "¿Cámara o Galería?" (Cumple Requerimiento 4)
        source: CameraSource.Prompt, 
        quality: 85, // 85 es un buen balance entre calidad y peso en MB para subir rápido
        allowEditing: false,
      });

      // Si por alguna razón no hay ruta, abortamos
      if (!capturedPhoto.webPath) {
        throw new Error('No se pudo obtener la ruta temporal de la imagen.');
      }

      // 2. Convertimos el archivo local (URI) a un Blob usando fetch
      // Este es el método más limpio y recomendado para subir archivos híbridos
      const response = await fetch(capturedPhoto.webPath);
      const blob = await response.blob();

      return {
        blob,
        webviewPath: capturedPhoto.webPath
      };

    } catch (error: any) {
      // Si el error es simplemente que el usuario cerró la cámara, retornamos null silenciosamente
      if (error.message === 'User cancelled photos app') {
        return null;
      }
      
      console.error('Error al capturar foto:', error);
      throw error;
    }
  }
}