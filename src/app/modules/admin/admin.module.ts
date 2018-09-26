import { NgModule } from '@angular/core';

import { AdminRoutingModule } from './admin-routing.module';
import { AuthComponent } from './pages/auth/auth.component';
import { MatchedPasswordComponent } from './components/matched-password/matched-password.component';
import { SharedModule } from '../../shared/shared.module';
import { ContainerComponent } from './components/container/container.component';
import { ForgotPasswordResetComponent } from './pages/forgot-password-reset/forgot-password-reset.component';
import { UsersComponent } from './pages/users/users.component';
import { UserFormComponent } from './pages/user-form/user-form.component';

@NgModule({
  imports: [
    SharedModule,
    AdminRoutingModule
  ],
  declarations: [
    AuthComponent,
    MatchedPasswordComponent,
    ContainerComponent,
    ForgotPasswordResetComponent,
    UsersComponent,
    UserFormComponent
  ]
})
export class AdminModule { }
