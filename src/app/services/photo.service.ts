import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

export interface CapturedEvidence {
  blob: Blob;
  webviewPath: string;
}

@Injectable({ providedIn: 'root' })
export class PhotoService {

  /**
   * Detecta si estamos en un entorno nativo (iOS/Android) o en web/desktop.
   * En nativo → usa el plugin de Capacitor (cámara + galería).
   * En web    → abre un <input type="file"> nativo del navegador.
   */
  async takeOrSelectPhoto(): Promise<CapturedEvidence | null> {
    const isNative = Capacitor.isNativePlatform();
    return isNative ? this.captureWithCapacitor() : this.captureWithFilePicker();
  }

  // ── Nativo: iOS / Android ─────────────────────────────────────
  private async captureWithCapacitor(): Promise<CapturedEvidence | null> {
    try {
      const capturedPhoto = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt,
        quality: 60,
        width: 800,
        allowEditing: false,
      });

      if (!capturedPhoto.webPath) {
        throw new Error('No se pudo obtener la ruta temporal de la imagen.');
      }

      const response = await fetch(capturedPhoto.webPath);
      const blob = await response.blob();

      return { blob, webviewPath: capturedPhoto.webPath };

    } catch (error: any) {
      if (
        error.message === 'User cancelled photos app' ||
        error.message === 'No image picked'
      ) {
        return null;
      }
      console.error('Error al capturar foto (Capacitor):', error);
      throw error;
    }
  }

  // ── Web / Desktop: input[type=file] ───────────────────────────
  private captureWithFilePicker(): Promise<CapturedEvidence | null> {
    return new Promise((resolve, reject) => {
      // Creamos un input temporal, nunca visible en el DOM
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';           // Solo imágenes
      input.capture = 'environment';      // Pista al navegador móvil para preferir cámara trasera
      input.style.display = 'none';

      input.onchange = async (event: Event) => {
        const file = (event.target as HTMLInputElement).files?.[0];

        if (!file) {
          resolve(null);  // Usuario cerró el picker sin seleccionar
          return;
        }

        try {
          // Validación básica de tipo y tamaño (máx 10 MB)
          if (!file.type.startsWith('image/')) {
            reject(new Error('El archivo seleccionado no es una imagen.'));
            return;
          }
          if (file.size > 10 * 1024 * 1024) {
            reject(new Error('La imagen supera el límite de 10 MB.'));
            return;
          }

          // Generamos la URL local para el preview en la UI
          const webviewPath = URL.createObjectURL(file);

          resolve({ blob: file, webviewPath });

        } catch (error) {
          reject(error);
        } finally {
          // Limpiamos el input del DOM
          document.body.removeChild(input);
        }
      };

      // Si el usuario cierra el diálogo sin elegir (evento focus de vuelta a la ventana)
      input.oncancel = () => {
        document.body.removeChild(input);
        resolve(null);
      };

      document.body.appendChild(input);
      input.click();
    });
  }
}