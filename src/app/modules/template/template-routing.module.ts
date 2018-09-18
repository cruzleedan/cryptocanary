import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { V1Component } from './v1/v1.component';

const routes: Routes = [
  {
    path: '',
    component: V1Component,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: '/home'
      },
      {
        path: 'home',
        loadChildren: '../home/home.module#HomeModule'
      },
      // {
      //   path: 'category',
      //   loadChildren: '../category/category.module#CategoryModule'
      // },
      {
        path: 'entity',
        loadChildren: '../entity/entity.module#EntityModule'
      },
      {
        path: 'user',
        loadChildren: '../user/user.module#UserModule',
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TemplateRoutingModule { }
