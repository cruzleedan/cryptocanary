import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
@Component({
  selector: 'app-add-review-dialog',
  templateUrl: './add-review-dialog.component.html',
  styleUrls: ['./add-review-dialog.component.scss']
})
export class AddReviewDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<AddReviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {

  }

  ngOnInit() {
  }

}
