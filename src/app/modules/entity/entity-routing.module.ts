import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Breadcrumb } from '../../core';
import { EntityComponent } from './pages/entity/entity.component';

const routes: Routes = [
  {
    path: ':entityId',
    component: EntityComponent,
    data: {
        breadcrumbs: [
            new Breadcrumb('Home', '/home')
        ]
    }
},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EntityRoutingModule { }
