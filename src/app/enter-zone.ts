import { NgZone } from '@angular/core';
import { MonoTypeOperatorFunction, Observable } from 'rxjs';

/**
 * Lets an observable running outside Angular zone to enter into Angular zone so that the change detection works properly.
 *
 * @param zone The Angular zone in which the application is running.
 * @return A new observable running inside the Angular zone.
 */
export function enterZone<T>(zone: NgZone): MonoTypeOperatorFunction<T> {
return (source: Observable<T>) => {
    return new Observable<T>((observer) => {
    return source.subscribe({
        next: (value) => {
        zone.run(() => {
            observer.next(value);
        });
        },
        error: (err) => {
        observer.error(err);
        },
        complete: () => {
        observer.complete();
        },
    });
    });
};
}
