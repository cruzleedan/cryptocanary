import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { library, icon } from '@fortawesome/fontawesome-svg-core';
import { faEllipsisH, faCommentAlt, faEnvelope, faLink, faPrint, faMinus } from '@fortawesome/free-solid-svg-icons';

library.add(faEllipsisH, faCommentAlt, faEnvelope, faLink, faPrint, faMinus);
import {
  faFacebookF, faTwitter, faGooglePlusG, faLinkedinIn, faPinterestP,
  faRedditAlien, faTumblr, faWhatsapp, faFacebookMessenger, faTelegramPlane,
  faVk, faStumbleupon, faXing, faFacebookSquare, faTwitterSquare, faPinterest
} from '@fortawesome/free-brands-svg-icons';

library.add(
  faFacebookF, faTwitter, faGooglePlusG, faLinkedinIn, faPinterestP,
  faRedditAlien, faTumblr, faWhatsapp, faFacebookMessenger, faTelegramPlane,
  faVk, faStumbleupon, faXing, faFacebookSquare, faTwitterSquare, faPinterest
);
import { environment } from '../environments/environment';
import { SocialLoginModule, AuthServiceConfig } from 'angularx-social-login';
import {
  FacebookLoginProvider,
  // GoogleLoginProvider,
  // LinkedInLoginProvider
} from 'angularx-social-login';
import { ErrorsModule } from './core/errors/errors';
import { NotificationService } from './core/errors/services/notification/notification.service';
import { SharedModule } from './shared/shared.module';
import { CoreModule } from '@angular/flex-layout';
import { HttpService } from './core/errors/services/http/http.service';
import { HttpTokenInterceptor } from './core';

const config = new AuthServiceConfig([
  {
    id: FacebookLoginProvider.PROVIDER_ID,
    provider: new FacebookLoginProvider(environment.fbConfig.appId)
  },
  // {
  //   id: GoogleLoginProvider.PROVIDER_ID,
  //   provider: new GoogleLoginProvider("Google-OAuth-Client-Id")
  // },
  // {
  //   id: LinkedInLoginProvider.PROVIDER_ID,
  //   provider: new LinkedInLoginProvider("LinkedIn-client-Id", false, 'en_US')
  // }
]);

export function provideConfig() {
  return config;
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    CoreModule,
    HttpClientModule,
    BrowserAnimationsModule,
    SharedModule,
    SocialLoginModule,
    AppRoutingModule,
    ErrorsModule
  ],
  exports: [BrowserAnimationsModule],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: HttpTokenInterceptor, multi: true },
    {
      provide: AuthServiceConfig,
      useFactory: provideConfig
    },
    HttpService,
    NotificationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
