import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-image-cropper-dialog',
  templateUrl: './image-cropper-dialog.component.html',
  styleUrls: ['./image-cropper-dialog.component.css']
})
export class ImageCropperDialogComponent implements OnInit {

    imageChangedEvent: any = '';
    croppedImage: any = '';
    constructor(
        public dialogRef: MatDialogRef<ImageCropperDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data
    ) { }
    ngOnInit() {
        console.log('data', this.data);
        this.imageChangedEvent = this.data.event;
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
    onNoClick(): void {
        this.dialogRef.close();
    }

}
