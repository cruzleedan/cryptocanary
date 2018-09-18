import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EntityRoutingModule } from './entity-routing.module';
import { EntityComponent } from './pages/entity/entity.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    EntityRoutingModule
  ],
  declarations: [EntityComponent]
})
export class EntityModule { }
