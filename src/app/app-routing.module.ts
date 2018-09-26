import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NoAuthGuard } from './core/guards/no-auth.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: './modules/template/template.module#TemplateModule'
  },
  {
    path: 'auth',
    loadChildren: './modules/auth/auth.module#AuthModule',
    canActivate: [NoAuthGuard]
  },
  {
    path: 'admin',
    loadChildren: './modules/admin/admin.module#AdminModule',
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
