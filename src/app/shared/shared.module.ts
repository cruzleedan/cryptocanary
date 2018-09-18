import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

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
  MatRadioModule,
} from '@angular/material';
import { MatIcons } from './helpers/mat-icons';

import { EditorModule } from '@tinymce/tinymce-angular';
import { ShareButtonsModule } from '@ngx-share/buttons';
import { ImageCropperModule } from 'ngx-image-cropper';

import { StrToJSONPipe } from './pipes/str-to-json.pipe';
import { PctPipe } from './pipes/pct.pipe';
import { CapitalizePipe } from './pipes/capitalize.pipe';
import { DateTimeMomentFormatPipe } from './pipes/date-time-moment-format.pipe';
import { RatingLabelPipe } from './pipes/rating-label.pipe';
import { ReplaceSpacesPipe } from './pipes/replace-spaces.pipe';
import { RatingPercentPipe } from './pipes/rating-percent.pipe';

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
import { BreadcrumbsComponent } from './breadcrumb/breadcrumbs.component';
import { MainToolbarComponent } from './main-toolbar/main-toolbar.component';
import { UserMenuComponent } from './user-menu/user-menu.component';
import { ReviewCardsComponent } from './review-cards/review-cards.component';
import { EntityCardsComponent } from './entity-cards/entity-cards.component';
import { ImageCropperDialogComponent } from './cropper/image-cropper-dialog.component';
import { EntityCardOverviewComponent } from './entity-card-overview/entity-card-overview.component';
import { SocialShareButtonComponent } from './social-share-button/social-share-button.component';
import { EntityReviewsComponent } from './entity-reviews/entity-reviews.component';
import { AddReviewDialogComponent } from './add-review-dialog/add-review-dialog.component';

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
    MatRadioModule,
    // material components end
    EditorModule,
    ImageCropperModule,
    ShareButtonsModule.forRoot(),
  ],
  declarations: [
    StrToJSONPipe,
    PctPipe,
    CapitalizePipe,
    DateTimeMomentFormatPipe,
    RatingLabelPipe,
    ReplaceSpacesPipe,
    RatingPercentPipe,
    TopSearchComponent,
    SideNavComponent,
    GlobalNavComponent,
    SessionControlsComponent,
    PageLayoutComponent,
    SeparatorComponent,
    SideItemComponent,
    EntityCardSmallComponent,
    MsgDialogComponent,
    ImageCropperDialogComponent,
    AuthFormComponent,
    BreadcrumbsComponent,
    MainToolbarComponent,
    UserMenuComponent,
    ReviewCardsComponent,
    EntityCardsComponent,
    EntityCardOverviewComponent,
    SocialShareButtonComponent,
    EntityReviewsComponent,
    AddReviewDialogComponent,
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
    MatRadioModule,
    // material components end
    EditorModule,
    ShareButtonsModule,
    ImageCropperModule,
    StrToJSONPipe,
    PctPipe,
    CapitalizePipe,
    DateTimeMomentFormatPipe,
    RatingLabelPipe,
    ReplaceSpacesPipe,
    RatingPercentPipe,
    TopSearchComponent,
    SideNavComponent,
    GlobalNavComponent,
    SessionControlsComponent,
    PageLayoutComponent,
    SeparatorComponent,
    SideItemComponent,
    EntityCardSmallComponent,
    MsgDialogComponent,
    ImageCropperDialogComponent,
    AuthFormComponent,
    BreadcrumbsComponent,
    MainToolbarComponent,
    UserMenuComponent,
    ReviewCardsComponent,
    EntityCardsComponent,
    EntityCardOverviewComponent,
    SocialShareButtonComponent,
    EntityReviewsComponent,
    AddReviewDialogComponent,
  ],
  providers: [
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher },
    MatIconRegistry,
    MatIcons,
    DatePipe
  ],
  entryComponents: [
    MsgDialogComponent,
    AddReviewDialogComponent,
    ImageCropperDialogComponent
  ]
})

export class SharedModule {
  constructor(public matIconRegistry: MatIconRegistry) {
    matIconRegistry.registerFontClassAlias('fontawesome', 'fa');
  }
}
