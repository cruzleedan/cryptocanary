import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserComponent } from './pages/user/user.component';
import { Breadcrumb, AuthGuard } from '../../core';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'activity'
  },
  {
    path: 'activity',
    component: UserComponent,
    canActivate: [AuthGuard],
    runGuardsAndResolvers: 'always',
    data: {
      breadcrumbs: [
        new Breadcrumb('Home', '/home')
      ]
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }