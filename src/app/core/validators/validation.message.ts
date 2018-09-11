export class ValidationMessage {
    static msg = {
        'username': [
            { type: 'required', message: 'Username is required' },
            { type: 'minlength', message: 'Username must be at least 5 characters long' },
            { type: 'maxlength', message: 'Username cannot be more than 25 characters long' },
            { type: 'pattern', message: 'Your username must contain only numbers and letters' },
            { type: 'usernameTaken', message: 'Your username has already been taken' }
        ],
        'email': [
            { type: 'required', message: 'Email is required' },
            { type: 'pattern', message: 'Enter a valid email' }
        ],
        'confirm': [
            { type: 'required', message: 'Confirm password is required' },
            { type: 'areEqual', message: 'Password mismatch' }
        ],
        'new': [
            { type: 'required', message: 'Password is required' },
            { type: 'minlength', message: 'Password must be at least 5 characters long' },
            { type: 'pattern', message: 'Your password must contain at least one uppercase, one lowercase, and one number' }
        ],
        'terms': [
            { type: 'pattern', message: 'You must accept terms and conditions' }
        ],
        'category': [
            { type: 'categoryNameTaken', message: 'Existing category'}
        ]
    };
}
