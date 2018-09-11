import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class Util {
    getError(resp, options?: object) {
        if (
            typeof resp === 'object' && resp.error &&
            typeof resp.error === 'string'
        ) {
            return resp.error;
        } else if (
            typeof resp === 'object' && resp.error &&
            typeof resp.error === 'object' && resp.error.error && typeof resp.error.error === 'string'
        ) {
            return resp.error.error;
        } else if (
            options &&
            options.hasOwnProperty('getValidationErrors') && !!(options['getValidationErrors']) &&
            typeof resp === 'object' && resp.errors
        ) {
            return resp;
        }
    }
}
