import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthComponent } from './pages/auth/auth.component';
import { ForgotPasswordResetComponent } from './pages/forgot-password-reset/forgot-password-reset.component';
import { NoAuthGuard } from '../../core/guards/no-auth.guard';
import { UsersComponent } from './pages/users/users.component';
import { AdminGuard } from '../../core/guards/admin.guard';
import { UserFormComponent } from './pages/user-form/user-form.component';
import { UserResolver } from './resolvers/user.resolver';
import { Breadcrumb } from '../../core';

const routes: Routes = [
  {
    path: 'login',
    component: AuthComponent,
    canActivate: [NoAuthGuard]
  },
  {
    path: 'forgot-password-reset',
    component: ForgotPasswordResetComponent,
    canActivate: [NoAuthGuard]
  },
  {
    path: 'users',
    component: UsersComponent,
    canActivate: [AdminGuard],
    data: {
      breadcrumbs: [
        new Breadcrumb('Home', '/home')
      ]
    }
  },
  {
    path: 'users/new',
    component: UserFormComponent,
    canActivate: [AdminGuard],
    data: {
      breadcrumbs: [
        new Breadcrumb('Users', '/admin/users')
      ]
    }
  },
  {
    path: 'users/:userId/edit',
    component: UserFormComponent,
    resolve: {
      user: UserResolver
    },
    canActivate: [AdminGuard],
    data: {
      breadcrumbs: [
        new Breadcrumb('Users', '/admin/users')
      ]
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
