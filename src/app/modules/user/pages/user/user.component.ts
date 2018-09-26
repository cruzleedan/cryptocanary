import { Component, OnInit, OnDestroy } from '@angular/core';
import { Breadcrumb, UserService, User, AlertifyService } from '../../../../core';
import { environment } from '../../../../../environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { ShowOnDirtyErrorStateMatcher, MatDialog } from '@angular/material';
import { debounceTime, map, distinctUntilChanged, switchMap, tap, takeUntil, take } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ImageCropperDialogComponent } from '../../../../shared/cropper/image-cropper-dialog.component';
import { CustomBlob } from '../../../../shared/helpers/custom-blob';
import { GlobalService } from '../../../../core/services/global.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit, OnDestroy {
  baseUrl = environment.baseUrl;
  currentPage: Breadcrumb;
  user: User;
  isCurrentUser: boolean;
  editUsername: boolean;
  loading: boolean;
  usernameForm: FormGroup;
  matcher = new ShowOnDirtyErrorStateMatcher();

  croppedImage: any = '';
  uploadProgress: any;
  uploadProgressCompleted = false;
  uploading = false;
  userAvatarUrl: string;

  destroySubject$: Subject<void> = new Subject();
  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private alertifyService: AlertifyService,
    private dialog: MatDialog,
    private customBlob: CustomBlob,
    private globalService: GlobalService
  ) {
    this.user = this.route.snapshot.data['user'];
    this.globalService.loadingRequests$
      .subscribe((requests) => {
        this.loading = !!(requests['findUserActivity']);
      });
    this.usernameForm = new FormGroup({
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ])
    });

    this.editUsername = false;
    this.userService.currentUser$.subscribe(user => {
      if (!this.user || !Object.keys(this.user).length) {
        this.user = user;
      }
      this.isCurrentUser = this.user.id === user.id;
      this.patchForm();
    });
  }
  patchForm() {
    this.userAvatarUrl = `${this.baseUrl}/avatar/${this.user.id}/${this.user.avatar}`;
    this.usernameForm.get('username').setValue(this.user.username);
    this.currentPage = {
      href: '',
      label: this.user.username
    };
  }
  ngOnInit() {
    const usernameCtrl = this.usernameForm.controls['username'];
    usernameCtrl.valueChanges.pipe(
      debounceTime(500), // replaces your setTimeout
      map(username => {
        username = username.trim();
        const isChanged = username && username !== this.user.username;
        console.log('current ', username, ' username ', this.user.username, ' ', isChanged);
        return isChanged ? username : false;
      }),
      distinctUntilChanged(), // wait until it's different than what we last checked
      switchMap(desiredUsername => this.userService.checkUsernameNotTaken(desiredUsername)),
      takeUntil(this.destroySubject$),
      tap(exists => {
        if (exists) {
          usernameCtrl.setErrors({ usernameTaken: true });
        } else if (usernameCtrl.errors && usernameCtrl.errors.hasOwnProperty('usernameTaken')) {
          delete usernameCtrl.errors.usernameTaken;
        }
      })
    ).subscribe();
  }
  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }
  cancelUsernameEdit() {
    this.editUsername = false;
  }
  saveUsername() {
    console.log('save Username', this.usernameForm.value);
    this.userService.update(this.usernameForm.value)
      .subscribe(user => {
        console.log('Updated user', user);
        if (user && typeof user === 'object' && Object.keys(user).length) {
          this.alertifyService.success('Success!');
          this.editUsername = false;
        }
      });
  }
  logout() {
    this.userService.signOut();
    this.userService.purgeAuth();
    this.router.navigate([this.route.snapshot['_routerState']['url']]);
  }
  fileChangeEvent(event: any): void {
    // this.imageChangedEvent = event;
    console.log('fileChangeEvent fired!');

    const dialogRef = this.dialog.open(ImageCropperDialogComponent, {
      data: {
        event: event
      },
      width: '50%',
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.croppedImage = result;
    });
  }
  imageCropped(image: string) {
    this.croppedImage = image;
  }
  imageLoaded() {
    // show cropper
  }
  loadImageFailed() {
    // show message
  }
  openCropperDialog() {
    this.dialog.open(ImageCropperDialogComponent, {
      data: {}
    });
  }
  cancelAvatarUpdate() {
    this.croppedImage = '';

  }
  updateAvatar() {
    let imageFile;
    if (this.croppedImage) {

      const blob = this.customBlob.dataURLToBlob(this.croppedImage);
      imageFile = this.customBlob.blobToFile(blob, `avatar-${Date.now()}.png`);
    }
    const req = this.userService.updateProfile(
      this.croppedImage ? imageFile : null,
      {}
    );
    this.uploading = true;
    if (req && req.progress) {
      this.uploadProgress = req.progress;
      this.uploadProgress.subscribe(end => {
        console.log('progress ', end);
        this.uploadProgressCompleted = true;
        this.uploading = false;
      });
    }
    if (req && req.data) {
      req.data.subscribe((resp) => {
        if (resp && resp['success']) {
          let user = this.userService.getCurrentUser();
          user = Object.assign(user, resp['user']);
          this.userService.setAuth(<User>{});
          this.userService.setAuth(user);
          this.alertifyService.success('Successfully updated!');
        }
      });
    }
  }
}
