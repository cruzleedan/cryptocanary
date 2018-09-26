import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ValidationMessage } from '../../../../core/validators/validation.message';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PasswordValidator } from '../../../../core/validators/password.validator';

@Component({
    selector: 'app-matched-password',
    templateUrl: './matched-password.component.html',
    styleUrls: ['./matched-password.component.scss']
})
export class MatchedPasswordComponent implements OnInit {
    @Input() form: FormGroup;

    validationMessages = ValidationMessage.msg;
    showCurrPass: boolean;
    showNewPass: boolean;
    showConfPass: boolean;
    matchingPass: FormGroup;
    constructor() {
        this.matchingPass = new FormGroup({
            new: new FormControl('',
                Validators.compose([
                    Validators.minLength(5),
                    Validators.required,
                    // this is for the letters (both uppercase and lowercase) and numbers validation
                    Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]+$')
                ])
            ),
            confirm: new FormControl('', [Validators.required])
        }, {validators: PasswordValidator.areEqual});

    }

    ngOnInit() {
        this.form.addControl('matchedPassword', this.matchingPass);
    }

}
