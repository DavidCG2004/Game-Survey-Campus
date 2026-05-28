import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

// ── Tipados basados en la respuesta de FreeToGame ─────────────────
export interface Game {
  id: number;
  title: string;
  thumbnail: string;
  short_description: string;
  game_url: string;
  genre: string;
  platform: string;
  publisher: string;
  developer: string;
  release_date: string;
  freetogame_profile_url: string;
}

@Injectable({
  providedIn: 'root'
})
export class GameApiService {
  // Inyección moderna de dependencias
  readonly #http = inject(HttpClient);
  
  // URL base. 
  // NOTA: Si en desarrollo tienes errores de CORS, deberás usar un proxy en Angular 
  // o cambiar esta URL por la de RapidAPI como menciona su documentación.
  readonly #API_URL = 'https://www.freetogame.com/api';

  /**
   * Obtiene la lista completa de juegos.
   * Útil para mostrar sugerencias iniciales.
   */
  async getAllGames(): Promise<Game[]> {
    try {
      const request$ = this.#http.get<Game[]>(`${this.#API_URL}/games`);
      return await firstValueFrom(request$);
    } catch (error) {
      console.error('Error al obtener juegos:', error);
      throw new Error('No se pudo conectar con el catálogo de juegos.');
    }
  }

  /**
   * Busca un juego por su nombre.
   * (Como FreeToGame no tiene endpoint ?search=nombre, traemos todos y filtramos).
   */
  async searchGameByName(query: string): Promise<Game[]> {
    if (!query || query.trim().length === 0) return [];

    try {
      const allGames = await this.getAllGames();
      const searchTerm = query.toLowerCase().trim();
      
      // Filtramos en memoria los juegos que incluyan el término de búsqueda
      return allGames.filter(game => 
        game.title.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      throw new Error('Ocurrió un error al buscar el videojuego.');
    }
  }

  /**
   * (Opcional) Obtiene juegos por categoría si el usuario quiere explorar
   * Ej: 'shooter', 'mmorpg', 'strategy'
   */
  async getGamesByCategory(category: string): Promise<Game[]> {
    try {
      const request$ = this.#http.get<Game[]>(`${this.#API_URL}/games?category=${category}`);
      return await firstValueFrom(request$);
    } catch (error) {
      throw new Error(`Error al obtener juegos de la categoría ${category}`);
    }
  }
}