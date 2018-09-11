import { NgModule } from '@angular/core';

import { TemplateRoutingModule } from './template-routing.module';
import { V1Component } from './v1/v1.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    TemplateRoutingModule
  ],
  exports: [],
  declarations: [V1Component, ]
})
export class TemplateModule { }
