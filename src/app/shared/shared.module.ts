import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing.module';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutModule } from '@angular/cdk/layout';
import { FlexLayoutModule } from '@angular/flex-layout';

import {
  MatToolbarModule,
  MatButtonModule,
  MatSidenavModule,
  MatIconModule,
  MatInputModule,
  MatSelectModule,
  MatListModule,
  MatCheckboxModule,
  ErrorStateMatcher,
  ShowOnDirtyErrorStateMatcher,
  MatIconRegistry,
  MatPaginatorModule,
  MatProgressSpinnerModule,
  MatSortModule,
  MatTableModule,
  MatNativeDateModule,
  MatExpansionModule,
  MatMenuModule,
  MatAutocompleteModule,
  MatFormFieldModule,
  MatBadgeModule,
  MatCardModule,
  MatButtonToggleModule,
  MatDatepickerModule,
  MatDividerModule,
  MatDialogModule,
  MatChipsModule,
  MatProgressBarModule,
  MatTabsModule,
  MatSlideToggleModule,
  MatTooltipModule,
} from '@angular/material';
import { MatIcons } from './helpers/mat-icons';
import { TopSearchComponent } from './top-search/top-search.component';
import { SideNavComponent } from './side-nav/side-nav.component';
import { GlobalNavComponent } from './global-nav/global-nav.component';
import { SessionControlsComponent } from './session-controls/session-controls.component';
import { PageLayoutComponent } from './page-layout/page-layout.component';
import { SeparatorComponent } from './separator/separator.component';
import { SideItemComponent } from './side-item/side-item.component';
import { EntityCardSmallComponent } from './entity-card-small/entity-card-small.component';
import { MsgDialogComponent } from './dialog/msg-dialog.component';
import { AuthFormComponent } from './auth-form/auth-form.component';


@NgModule({
  imports: [
    CommonModule,
    SharedRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    LayoutModule,
    FlexLayoutModule,
    // material components start
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatListModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatTableModule,
    MatNativeDateModule,
    MatExpansionModule,
    MatMenuModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatBadgeModule,
    MatCardModule,
    MatButtonToggleModule,
    MatDatepickerModule,
    MatDividerModule,
    MatDialogModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatTooltipModule,
    // material components end
  ],
  declarations: [
    TopSearchComponent,
    SideNavComponent,
    GlobalNavComponent,
    SessionControlsComponent,
    PageLayoutComponent,
    SeparatorComponent,
    SideItemComponent,
    EntityCardSmallComponent,
    MsgDialogComponent,
    AuthFormComponent
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LayoutModule,
    FlexLayoutModule,
    // material components starts
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatListModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatTableModule,
    MatNativeDateModule,
    MatExpansionModule,
    MatMenuModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatBadgeModule,
    MatCardModule,
    MatButtonToggleModule,
    MatDatepickerModule,
    MatDividerModule,
    MatDialogModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatTooltipModule,
    // material components end
    TopSearchComponent,
    SideNavComponent,
    GlobalNavComponent,
    SessionControlsComponent,
    PageLayoutComponent,
    SeparatorComponent,
    SideItemComponent,
    EntityCardSmallComponent,
    MsgDialogComponent,
    AuthFormComponent
  ],
  providers: [
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher },
    MatIconRegistry,
    MatIcons,
  ]
})
export class SharedModule {
  constructor(public matIconRegistry: MatIconRegistry) {
    matIconRegistry.registerFontClassAlias('fontawesome', 'fa');
  }
}
