import { Injectable } from '@angular/core';
import { HousingLocation } from '../models/housing-location';

// Interfaz para desacoplar dependencias: permite sustituir la implementacion sin cambiar componentes
export interface HousingProvider {
  getAllHousingLocations(): Promise<HousingLocation[]>;
  getHousingLocationById(id: number): Promise<HousingLocation | undefined>;
}

// providedIn: 'root' registra el servicio como singleton a nivel de aplicacion
// evita tener que proveerlo manualmente en modulos
@Injectable({
  providedIn: 'root'
})
// 'implements' obliga a respetar el contrato de la interfaz en tiempo de compilacion
// ayuda a detectar discrepancias entre servicio y consumidores
export class HousingService implements HousingProvider {
  private readonly apiUrl = 'http://localhost:3000/locations';
  private readonly localUrl = '/db.json';

  constructor() { }

  async getAllHousingLocations(): Promise<HousingLocation[]> {
    // try/catch para intentar la llamada remota y usar un fallback si falla
    // evita que errores de red propaguen sin control
    try {
      // async/await simplifica el flujo asincrono al tratar la respuesta como valor
      // facilita manejo de errores con try/catch en vez de callbacks
      const response = await fetch(this.apiUrl);
      // Se lanza un error para forzar el manejo en el catch y activar el fallback
      // indica que la respuesta HTTP no fue exitosa
      if (!response.ok) throw new Error('API no disponible');
      return await response.json();
    } catch (error) {
      console.warn('API no disponible, cargando datos locales');
      const fallback = await fetch(this.localUrl);
      const data = await fallback.json();
      // El JSON local tiene la forma { locations: [...] } por eso se usa data.locations
      // se extrae el array que imita la respuesta del endpoint
      return data.locations;
    }
  }

  async getHousingLocationById(id: number): Promise<HousingLocation | undefined> {
    // try/catch para intentar la llamada remota y usar un fallback si falla
    // evita que errores de red propaguen sin control
    try {
      // async/await simplifica el flujo asincrono al tratar la respuesta como valor
      // facilita manejo de errores con try/catch en vez de callbacks
      const response = await fetch(`${this.apiUrl}/${id}`);
      // Se lanza un error para forzar el manejo en el catch y activar el fallback
      // indica que la respuesta HTTP no fue exitosa
      if (!response.ok) throw new Error('API no disponible');
      return await response.json();
    } catch (error) {
      console.warn('API no disponible, cargando datos locales');
      const fallback = await fetch(this.localUrl);
      const data = await fallback.json();
      // Se busca el elemento por id en el array local como sustituto del endpoint individual
      // garantiza devolver el mismo objeto que el endpoint remoto
      return data.locations.find((loc: HousingLocation) => loc.id === id);
    }
  }

  submitApplication(firstName: string, lastName: string, email: string) {
    const application = {
      firstName,
      lastName,
      email,
      date: new Date().toISOString()
    };
    localStorage.setItem('housingApplication', JSON.stringify(application));
  }

  getSavedApplication() {
    const saved = localStorage.getItem('housingApplication');
    return saved ? JSON.parse(saved) : null;
  }
}