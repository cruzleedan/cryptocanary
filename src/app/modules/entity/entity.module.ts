import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EntityRoutingModule } from './entity-routing.module';
import { EntityComponent } from './pages/entity/entity.component';
import { SharedModule } from '../../shared/shared.module';
import { EntityFormComponent } from './pages/entity-form/entity-form.component';
import { DialogComponent } from './pages/entity-form/components/dialog/dialog.component';

@NgModule({
  imports: [
    SharedModule,
    EntityRoutingModule
  ],
  declarations: [EntityComponent, EntityFormComponent, DialogComponent],
  entryComponents: [
    DialogComponent
  ]
})
export class EntityModule { }
