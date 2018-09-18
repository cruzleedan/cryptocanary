import { NgModule } from '@angular/core';

import { UserRoutingModule } from './user-routing.module';
import { UserComponent } from './pages/user/user.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    UserRoutingModule
  ],
  declarations: [UserComponent]
})
export class UserModule { }
