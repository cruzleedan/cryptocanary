import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TemplateV1Component } from './pages/v1/template-v1.component';

const routes: Routes = [
  {
    path: '',
    component: TemplateV1Component,
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
