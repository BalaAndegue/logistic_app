// services/geocoding.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class GeocodingService {
    // Utiliser OpenStreetMap Nominatim (gratuit)
    private nominatimUrl = 'https://nominatim.openstreetmap.org/search';
    private reverseUrl = 'https://nominatim.openstreetmap.org/reverse';

    constructor(private http: HttpClient) {}

    // Adresse → Coordonnées
    geocode(address: string): Observable<{lat: number, lng: number, display_name: string}> {
        const params = {
            q: address,
            format: 'json',
            limit: '1',
            countrycodes: 'cm' // Limiter au Cameroun
        };

        return this.http.get<any[]>(this.nominatimUrl, { params }).pipe(
            map(results => {
                if (results.length > 0) {
                    return {
                        lat: parseFloat(results[0].lat),
                        lng: parseFloat(results[0].lon),
                        display_name: results[0].display_name
                    };
                }
                throw new Error('Address not found');
            }),
            catchError(() => {
                // Fallback: Coordonnées de Yaoundé
                return of({
                    lat: 3.8480,
                    lng: 11.5021,
                    display_name: 'Yaoundé, Cameroun'
                });
            })
        );
    }

    // Coordonnées → Adresse
    reverseGeocode(lat: number, lng: number): Observable<string> {
        const params = {
            lat: lat.toString(),
            lon: lng.toString(),
            format: 'json',
            zoom: '18'
        };

        return this.http.get<any>(this.reverseUrl, { params }).pipe(
            map(result => result.display_name),
            catchError(() => of(`Position: ${lat.toFixed(4)}, ${lng.toFixed(4)}`))
        );
    }

    // Adresses principales au Cameroun (cache)
    getCameroonCities(): {name: string, lat: number, lng: number}[] {
        return [
            { name: 'Yaoundé', lat: 3.8480, lng: 11.5021 },
            { name: 'Douala', lat: 4.0511, lng: 9.7679 },
            { name: 'Bafoussam', lat: 5.4667, lng: 10.4167 },
            { name: 'Bamenda', lat: 5.9333, lng: 10.1667 },
            { name: 'Garoua', lat: 9.3000, lng: 13.4000 },
            { name: 'Maroua', lat: 10.5910, lng: 14.3159 },
            { name: 'Ngaoundéré', lat: 7.3167, lng: 13.5833 },
            { name: 'Bertoua', lat: 4.5833, lng: 13.6833 },
            { name: 'Ebolowa', lat: 2.9000, lng: 11.1500 },
            { name: 'Kumba', lat: 4.6333, lng: 9.4500 }
        ];
    }
}