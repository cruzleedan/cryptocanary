import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    ApiService,
    AuthGuard,
    JwtService,
    UserService,
    EntityService,
    CategoryService,
    AlertifyService
} from './services';
import { HttpTokenInterceptor } from './interceptors';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
@NgModule({
    imports: [
        CommonModule
    ],
    providers: [
    ],
    declarations: []
})
export class CoreModule { }
