import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

// ── Tipados de Dominio ────────────────────────────────────────────────
export interface SurveyInsert {
  respondent_name: string;
  age_range: string;
  role: string;
  favorite_game: string;
  platform: string;
  genre: string;
  comment?: string;
  latitude: number;
  longitude: number;
  campus_location: string;
  image_url?: string;
  user_id: string; // ID del usuario encuestador (quien tiene la sesión iniciada)
}

export interface Survey extends SurveyInsert {
  id: string;
  created_at: string;
}

// Constantes de configuración
const BUCKET_NAME = 'survey-evidence';
const TABLE_NAME = 'surveys';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  // Instancia privada usando el estándar ECMAScript (#)
  readonly #supabase: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseKey
  );

  // ─────────────────────────────────────────
  // 🔐 AUTENTICACIÓN
  // ─────────────────────────────────────────

  async login(email: string, password: string) {
    const { data, error } = await this.#supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return data;
  }

  async register(email: string, password: string) {
    const { data, error } = await this.#supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);
    return data;
  }

  async logout() {
    const { error } = await this.#supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }

  async getSession() {
    const { data, error } = await this.#supabase.auth.getSession();
    if (error) throw new Error(error.message);
    return data.session;
  }

  // ─────────────────────────────────────────
  // 💾 BASE DE DATOS (CRUD Encuestas)
  // ─────────────────────────────────────────

  /**
   * Guarda una nueva encuesta en la base de datos
   */
  async insertSurvey(survey: SurveyInsert): Promise<Survey> {
    const { data, error } = await this.#supabase
      .from(TABLE_NAME)
      .insert(survey)
      .select()
      .single();

    if (error) throw new Error(`Error al guardar la encuesta: ${error.message}`);
    return data;
  }

  /**
   * Obtiene todas las encuestas (Para el Requerimiento 6: Cards)
   */
  async getSurveys(): Promise<Survey[]> {
    const { data, error } = await this.#supabase
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Error al obtener encuestas: ${error.message}`);
    return data;
  }

  // ─────────────────────────────────────────
  // ☁️ STORAGE (Subida de Evidencias)
  // ─────────────────────────────────────────

  /**
   * Sube una foto de evidencia al Storage y devuelve la URL pública
   */
  async uploadEvidence(file: File | Blob, fileExt: string = 'jpeg'): Promise<string> {
    // Generamos un nombre único usando un UUID nativo
    const fileName = `evidence_${crypto.randomUUID()}.${fileExt}`;

    // 1. Subir archivo
    const { error: uploadError } = await this.#supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        upsert: false,
        contentType: `image/${fileExt}`
      });

    if (uploadError) throw new Error(`Error al subir imagen: ${uploadError.message}`);

    // 2. Obtener URL pública
    const { data } = this.#supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return data.publicUrl;
  }
}