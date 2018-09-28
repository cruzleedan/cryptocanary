import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Breadcrumb, AuthGuard } from '../../core';
import { EntityComponent } from './pages/entity/entity.component';
import { EntityFormComponent } from './pages/entity-form/entity-form.component';
import { UserEntityReviewResolver } from './resolvers/user-entity-review.resolver';
import { EntityResolver } from './resolvers/entity.resolver';
import { UserEntityResolver } from './resolvers/user-entity.resolver';

const routes: Routes = [
  {
    path: 'new',
    component: EntityFormComponent,
    canActivate: [AuthGuard],
    runGuardsAndResolvers: 'always',
    data: {
      breadcrumbs: [
        new Breadcrumb('Home', '/home')
      ]
    }
  },
  {
    path: ':entityId/edit',
    component: EntityFormComponent,
    canActivate: [AuthGuard],
    runGuardsAndResolvers: 'always',
    resolve: {
      entity: EntityResolver,
      isAdminOrPublisher: UserEntityResolver
    },
    data: {
      breadcrumbs: [
        new Breadcrumb('Home', '/home')
      ]
    }
  },
  {
    path: ':entityId',
    component: EntityComponent,
    runGuardsAndResolvers: 'always',
    resolve: {
      review: UserEntityReviewResolver
    },
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
