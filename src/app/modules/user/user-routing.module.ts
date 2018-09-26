import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserComponent } from './pages/user/user.component';
import { Breadcrumb, AuthGuard } from '../../core';
import { UserResolver } from './resolvers/user.resolver';

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
  },
  {
    path: ':userId',
    component: UserComponent,
    resolve: {
      user: UserResolver
    },
    data:  {
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
