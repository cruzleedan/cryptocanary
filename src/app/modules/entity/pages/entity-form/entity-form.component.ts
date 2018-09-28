import { Component, OnInit, HostListener, NgZone } from '@angular/core';
import { ComponentCanDeactivate } from '../../../../core/guards/can-deactivate/can-deactivate.guard';
import { environment } from '../../../../../environments/environment';
import { NgForm, FormControl, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { MatDialog } from '@angular/material';
import { EntityService, CategoryService, AlertifyService, UserService, Breadcrumb, User } from '../../../../core';
import { CustomBlob } from '../../../../shared/helpers/custom-blob';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ImageCropperDialogComponent } from '../../../../shared/cropper/image-cropper-dialog.component';
import { Entity } from '../../../../core/models/entity.model';
import { mergeMap, finalize } from 'rxjs/operators';
import { DialogComponent } from './components/dialog/dialog.component';
import { GlobalService } from '../../../../core/services/global.service';

@Component({
  selector: 'app-entity-form-entity',
  templateUrl: './entity-form.component.html',
  styleUrls: ['./entity-form.component.scss']
})
export class EntityFormComponent implements OnInit, ComponentCanDeactivate {
  editorPlacehoder = '<p class="editor-placeholder">Describe basic concept of project</p>';
  tinyMceApiKey = environment.tinyMce.apiKey;
  tinyMceInit = {
    plugins: 'link image',
    images_upload_url: 'upload.php',
    images_upload_handler: this.imgHandler,
    setup: function (editor) {
      editor.on('init', function (e) {
        console.log('this', this);
        this.iframeElement.contentDocument.querySelectorAll('p.editor-placeholder').forEach(el => {
          el.style.color = '#989898';
        });
      });
      editor.on('blur', function (e) {
        console.log('blur', this);
        setTimeout(() => {
          this.contentDocument.querySelectorAll('p.editor-placeholder').forEach(el => {
            el.style.color = '#989898';
          });
        }, 50);
      });
    }
  };
  baseUrl = environment.baseUrl;
  baseApiUrl = environment.baseApiUrl;
  entityImgUrl: string;
  currentPage: Breadcrumb;
  currentPages: Breadcrumb[];
  currentUser: User;

  entity: Entity;

  form: NgForm;
  entityForm: FormGroup;
  imgFormControl = new FormControl();

  imageChangedEvent: any = '';
  croppedImageError: string;
  croppedImage: any = '';
  uploadProgress;
  uploadProgressCompleted = false;
  uploading = false;

  matcher;
  loading: boolean;
  isEdit: boolean;
  // @HostListener allows us to also guard against browser refresh, close, etc.
  @HostListener('window:beforeunload', ['$event'])
  canDeactivate(): Observable<boolean> | boolean {
    // insert logic to check if there are pending changes here;
    // returning true will navigate without confirmation
    // returning false will show a confirm dialog before navigating away
    return this.form.submitted || !this.form.dirty;
  }
  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private ngZone: NgZone,
    private entityService: EntityService,
    private customBlob: CustomBlob,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private alertifyService: AlertifyService,
    private authService: AuthService,
    private userService: UserService,
    private globalService: GlobalService
  ) {
    this.entityForm = this.fb.group({
      'categoryId': new FormControl(''),
      'name': new FormControl('', [Validators.required]),
      'desc': new FormControl('', [Validators.required]),
      'descImages': new FormControl(''),
      'links': this.fb.array([this.createLink()]),
      'address': new FormControl(''),
      'phone': new FormControl(''),
      'email': new FormControl('', [Validators.email]),
      'Category': new FormControl('')
    });
    this.entityForm.get('desc').setValue(this.editorPlacehoder);
    if (this.route.snapshot.data && this.route.snapshot.data.entity) {
      const loadedEntity = this.route.snapshot.data.entity;
      this.entity = loadedEntity;
      this.patchEntityForm(loadedEntity);
    } else {
      this.currentPage = {
        href: '',
        label: 'New Entity'
      };
    }
    this.globalService.loadingRequests$.subscribe(requests => {
      this.loading = !!(requests['addNewEntity']) || !!(requests['editEntity']);
    });
  }

  ngOnInit() {
  }
  patchEntityForm(loadedEntity: Entity) {
    if (loadedEntity.userId === this.userService.getCurrentUser().id) {
      this.entityImgUrl = loadedEntity.image ? `${this.baseUrl}/entity/${loadedEntity.id}/${loadedEntity.image}` : this.entityImgUrl;
      this.entityForm.patchValue(loadedEntity);
      this.entityForm.markAsPristine();
      this.isEdit = true;
      this.currentPages = [{
        href: `/entity/${loadedEntity.id}`,
        label: loadedEntity.name
      }, {
        href: '',
        label: 'Edit'
      }];
    } else {
      this.router.navigate([`/entity/${loadedEntity.id}`]);
    }
  }
  getControls(frmGrp: FormGroup, key: string) {
    return (<FormArray>frmGrp.get(key)).controls;
  }
  addLink() {
    const link = this.createLink();
    this.links.push(link);
  }
  public get links(): FormArray {
    return this.entityForm.get('links') as FormArray;
  }
  removeLink(index) {
    this.links.removeAt(index);
  }
  fileChangeEvent(event: any): void {
    // this.imageChangedEvent = event;
    const dialogRef = this.dialog.open(ImageCropperDialogComponent, {
      data: {
        event: event
      },
      width: '50%'
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
  // form submission and reset
  resetForm() {
    const fieldsVal = {
      'categoryId': '',
      'name': '',
      'desc': '',
      'links': '',
      'address': '',
      'phone': '',
      'email': '',
      'descImages': ''
    };
    this.entityForm.reset(this.isEdit ? this.entity : fieldsVal);
    this.imgFormControl.setValue('');
    this.croppedImage = '';
  }
  setEntityDescImages() {
    const str = this.entityForm.get('desc').value;
    const regex = /<img.*?src=['"](.*?)['"]/g;
    let arr;
    const outp = [];
    let filename;
    while ((arr = regex.exec(str))) {
      filename = arr[1];
      filename = filename.split('/').pop();
      if (filename) {
        outp.push(filename);
      }
    }
    this.entityForm.get('descImages').setValue(JSON.stringify(outp));
  }
  onEditorBlur() {
    console.log('onEditorBlur ', this.entityForm.get('desc').value);
    if (this.entityForm.get('desc').value.trim() === '') {
      console.log('set desc to empty editor placeholder');
      this.entityForm.get('desc').setValue(this.editorPlacehoder);
    }
  }
  onEditorFocus() {
    const desc = this.entityForm.get('desc').value;
    console.log('onEditorFocus ', this.entityForm.get('desc').value);
    if (desc === this.editorPlacehoder) {
      console.log('set desc to empty string');
      this.entityForm.get('desc').setValue('');
    }
  }
  validateEntityDesc() {
    if (this.entityForm.get('desc').value === this.editorPlacehoder) {
      this.entityForm.get('desc').setValue('');
    }
  }
  validateImageFileSize(imageFile) {
    if (imageFile.size > 4000000) {
      this.croppedImageError = 'Image must not exceed 4mb';
    }
  }
  handleSubmit() {
    this.entityForm.disable();
    this.setEntityDescImages();
    this.validateEntityDesc();
    const formValues = this.entityForm.value;
    console.log('formValues', formValues);
    let imageFile;
    if (this.croppedImage) {
      console.log('cropped image is', this.croppedImage);

      const blob = this.customBlob.dataURLToBlob(this.croppedImage);
      imageFile = this.customBlob.blobToFile(blob, `entity-${Date.now()}.png`);
      this.validateImageFileSize(imageFile);
    }

    this.uploading = !!(this.croppedImage);
    let req;
    if (this.isEdit) {
      console.log('ENTITY IS ', this.entity);
      req = this.entityService.editEntity(
        this.entity.id,
        formValues,
        imageFile
      );
    } else {
      req = this.entityService.addNewEntity(
        formValues,
        imageFile
      );
    }
    if (req && req.progress) {
      this.uploadProgress = req.progress;
      this.uploadProgress
      .pipe(
        finalize(() => {
          this.globalService.setLoadingRequests(this.isEdit ? 'editEntity' : 'addNewEntity', false);
        })
      )
      .subscribe(end => {
        console.log('uploadProgress', end);
        this.uploadProgressCompleted = true;
      });
    }
    if (req && req.data) {
      req.data
        .pipe(
          mergeMap(resp => {
            this.userService.populate();
            return of(resp);
          }),
          finalize( () => {
            this.globalService.setLoadingRequests(this.isEdit ? 'editEntity' : 'addNewEntity', false);
            this.entityForm.enable();
          })
        )
        .subscribe((n) => {
          if (n && n.data) {
            this.patchEntityForm(n.data);
            this.croppedImage = n.image ? `${this.baseUrl}/entity/${n.image}` : this.croppedImage;
            this.dialog.open(DialogComponent, {
              data: {
                id: n.data.id || '',
                msg: this.isEdit ? 'Saved Successfully.' : 'New Entity has been created.'
              },
              hasBackdrop: true,
              width: '300px'
            });
          }
        });
    }
  }
  createLink(): FormGroup {
    return this.fb.group({
      link: '',
      name: ''
    });
  }
  imgHandler(blobInfo, success, failure) {
    let xhr, formData;

    xhr = new XMLHttpRequest();
    xhr.withCredentials = false;
    xhr.open('POST', `${this.baseApiUrl}/entities/new/image`);

    xhr.onload = function () {
      let json;

      if (xhr.status !== 200) {
        failure('HTTP Error: ' + xhr.status);
        return;
      }

      json = JSON.parse(xhr.responseText);
      json.location = `${this.baseUrl}/tmp/${json.filename}`;

      if (!json || typeof json.location !== 'string') {
        failure('Invalid JSON: ' + xhr.responseText);
        return;
      }
      success(json.location);
    };

    formData = new FormData();
    formData.append('file', blobInfo.blob(), blobInfo.filename());

    xhr.send(formData);
  }
}
