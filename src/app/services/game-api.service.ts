import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom, map } from 'rxjs';
import { environment } from '../../environments/environment'; // Asegúrate de la ruta correcta

// Mantenemos TU interface original para NO romper la UI
export interface Game {
  id: number;
  title: string;
  thumbnail: string;
  genre: string;
  platform: string;
  release_date: string;
  // Hacemos opcionales las que RAWG no trae por defecto en la búsqueda
  short_description?: string;
  game_url?: string;
  publisher?: string;
  developer?: string;
  freetogame_profile_url?: string;
}

// Interface para tipar la respuesta nativa de RAWG
interface RawgResponse {
  results: any[];
}

@Injectable({
  providedIn: 'root'
})
export class GameApiService {
  readonly #http = inject(HttpClient);
  readonly #API_URL = 'https://api.rawg.io/api';
  readonly #API_KEY = environment.Games_Key;

  /**
   * Obtiene una lista inicial de juegos populares/recientes.
   * Ya no guardamos caché de "todos", le pedimos 20 a RAWG.
   */
  async getAllGames(): Promise<Game[]> {
    try {
      const params = new HttpParams()
        .set('key', this.#API_KEY)
        .set('page_size', '20')
        .set('ordering', '-rating'); // Ordenar por popularidad/rating

      const request$ = this.#http.get<RawgResponse>(`${this.#API_URL}/games`, { params }).pipe(
        // RxJS map: Transforma la respuesta de RAWG al array de nuestro Game
        map(response => response.results.map(rawgGame => this.#mapRawgToGame(rawgGame)))
      );

      return await firstValueFrom(request$);
    } catch (error) {
      console.error('Error al obtener juegos RAWG:', error);
      throw new Error('No se pudo conectar con el catálogo de juegos.');
    }
  }

  /**
   * Búsqueda predictiva. Ahora le pedimos a RAWG que busque en su inmensa base de datos.
   */
  async searchGameByName(query: string): Promise<Game[]> {
    if (!query || query.trim().length === 0) return [];

    try {
      const params = new HttpParams()
        .set('key', this.#API_KEY)
        .set('search', query)
        .set('search_precise', 'true')
        .set('page_size', '15'); // Limitamos a 15 para la lista desplegable de la encuesta

      const request$ = this.#http.get<RawgResponse>(`${this.#API_URL}/games`, { params }).pipe(
        map(response => response.results.map(rawgGame => this.#mapRawgToGame(rawgGame)))
      );

      return await firstValueFrom(request$);
    } catch (error) {
      console.error('Error en búsqueda:', error);
      throw new Error('Ocurrió un error al buscar el videojuego.');
    }
  }

  /**
   * Filtrar por categoría (Género)
   */
  async getGamesByCategory(category: string): Promise<Game[]> {
    try {
      const params = new HttpParams()
        .set('key', this.#API_KEY)
        .set('genres', category.toLowerCase()) // RAWG espera el slug del género (ej. 'action')
        .set('page_size', '20');

      const request$ = this.#http.get<RawgResponse>(`${this.#API_URL}/games`, { params }).pipe(
        map(response => response.results.map(rawgGame => this.#mapRawgToGame(rawgGame)))
      );

      return await firstValueFrom(request$);
    } catch (error) {
      throw new Error(`Error al obtener juegos de la categoría ${category}`);
    }
  }

  /**
   * PATRÓN ADAPTER: 
   * Traduce el objeto complejo de RAWG a nuestra interfaz plana Game
   */
  #mapRawgToGame(rawg: any): Game {
    // RAWG trae las plataformas y géneros en arrays de objetos. Los convertimos a string.
    const platformString = rawg.platforms 
      ? rawg.platforms.map((p: any) => p.platform.name).join(', ') 
      : 'Desconocida';
      
    const genreString = rawg.genres 
      ? rawg.genres.map((g: any) => g.name).join(', ') 
      : 'Desconocido';

    return {
      id: rawg.id,
      title: rawg.name,
      thumbnail: rawg.background_image || 'assets/placeholder.png',
      genre: genreString,
      platform: platformString,
      release_date: rawg.released || 'N/A',
      // Mapeos vacíos para no romper propiedades de tu interfaz anterior
      short_description: '',
      game_url: `https://rawg.io/games/${rawg.slug}` // Generamos un link al perfil en rawg
    };
  }
}