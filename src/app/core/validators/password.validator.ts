import { FormControl, FormGroup, NgForm, FormGroupDirective, ValidatorFn, ValidationErrors } from '@angular/forms';

export class PasswordValidator {
    // Inspired on: http://plnkr.co/edit/Zcbg2T3tOxYmhxs7vaAm?p=preview
    static areEqual: ValidatorFn = (formGroup: FormGroup): ValidationErrors | null => {
        let value;
        let valid = true;
        for (const key in formGroup.controls) {
            if (formGroup.controls.hasOwnProperty(key)) {
                const control: FormControl = <FormControl>formGroup.controls[key];

                if (value === undefined) {
                    value = control.value;
                } else {
                    if (value !== control.value) {
                        valid = false;
                        break;
                    }
                }
            }
        }

        if (valid) {
            return null;
        }

        return {
            areEqual: true
        };
    }
}
