import { NgModule } from '@angular/core';

import { TemplateRoutingModule } from './template-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { TemplateV1Component } from './pages/v1/template-v1.component';

@NgModule({
  imports: [
    SharedModule,
    TemplateRoutingModule
  ],
  exports: [],
  declarations: [TemplateV1Component]
})
export class TemplateModule { }
