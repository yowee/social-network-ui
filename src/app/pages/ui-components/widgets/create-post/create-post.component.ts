import { Component, OnInit, Input, Output, EventEmitter, AfterContentInit,AfterViewInit, ContentChild, ElementRef, ViewChild } from '@angular/core';
import { PostType } from 'src/app/model/post-type';
import { ProviderService } from 'src/app/service/provider-service/provider.service';
import { API_TYPE } from 'src/app/model/apiType';
import { NgForm, FormGroup, FormBuilder, FormControl, Validators, NG_VALIDATORS,ValidationErrors, ValidatorFn  } from '@angular/forms'
import { Post } from '../../../../model/post';
import { error } from 'util';
import { elementAt } from 'rxjs/operators';
import { ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {MatSnackBar} from '@angular/material/snack-bar';
import { ConfigService } from 'src/app/service/config/config-service';
import {User} from "../../../../model/user";


@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styles: [`a{
    color: #dc4734;
}`],
  encapsulation: ViewEncapsulation.None

})
export class CreatePostComponent implements OnInit ,AfterContentInit,AfterViewInit {
  isCreated = false;
  users: Array<any>;
  isShow = true;
  imageSrc: string;
  postform: FormGroup;
  @Input("pageType") pageType: PostType = PostType.HOMEPAGE_POSTS
  @Input('editFlag') isEditPage: Boolean;
  @ViewChild ("closeModal",{static:false}) closeModall :ElementRef
  isSearchPage: Boolean;
  errorMessage: string;
  uploadForm: FormGroup;

  user: User = JSON.parse(localStorage.getItem('active_user'));

  constructor(private config:ConfigService,private snackBar:MatSnackBar,private http: HttpClient, private formBuilder: FormBuilder, private providerService: ProviderService) {

    this.postform = this.formBuilder.group({
      content:new FormControl('', [Validators.minLength(5),Validators.maxLength(30),Validators.required]),
      avatar: [null],
      minAge: [''],
      maxAge: [''],
      notifyFollowers: ['']
    })
  }


  ngOnInit() {

    this.isSearchPage = this.pageType === PostType.SEARCH_POSTS;
    this.providerService.get(API_TYPE.USER, '/followers', '').subscribe((Listusers: Array<any>) => {
      console.log("Listusers", Listusers)
      this.users = Listusers;

      for (var i = 0; i < this.users.length; i++) {
        console.log("rendered", this.users[i]);

        this.users[i].checked = false;
      }
    }, err => {
      this.errorMessage = err.responseMessage;
    })
  }


  submit() {
    let audienceFollowers = [];

    for (var i = 0; i < this.users.length; i++) {
      if (this.users[i].checked == true) {
        audienceFollowers.push({ user: this.users[i].userId._id })
      }
      else if (this.users[i].checked == false) {

      }
    }

    let notifyfoll = this.postform.get('notifyFollowers').value!=''?this.postform.get('notifyFollowers').value:'false';
    let ageGroupTarget =  { min: this.postform.get('minAge').value, max: this.postform.get('maxAge').value }
    var formData: any = new FormData();
    formData.append("content", this.postform.get('content').value);
    formData.append("imageLink", this.postform.get('avatar').value);
    formData.append("targetFollowers", JSON.stringify(audienceFollowers));

    formData.append('ageGroupTarget', JSON.stringify(ageGroupTarget)?JSON.stringify(ageGroupTarget):'');
    formData.append("notifyFollowers",new String(notifyfoll))
    console.log(this.postform.get('avatar').value)
    console.log("notifyFollowers",new String(this.postform.get('notifyFollowers').value));

    const httpOptions = {
      headers:  this.config.getHeadersMultipart()
   }

    this.http.post('http://localhost:3000/posts', formData,httpOptions).subscribe((data: Post) => {
      this.isCreated = true
      this.snackBar.open('post created successfully','Ok')
      this.loadNewData();
    }, error => {
       this.snackBar.open(error.errorMessage,'Ok')
      this.errorMessage = error.responseMessage;
    });

    this.postform.reset()
    this.closeModall.nativeElement.click();
  }

  uploadFile(event) {

    const file = (event.target as HTMLInputElement).files[0];
    this.postform.patchValue({
      avatar: file
    });
    //this.postform.get('imageLink').updateValueAndValidity()

  //  console.log(file)
  }


  toggleDisplay() {
    this.isShow = !this.isShow;
  }

 @Output("loadNewData") someEvent = new EventEmitter<string>();


loadNewData(): void {
  this.someEvent.next();
}

ngAfterContentInit(): void {
  console.log("ng on after Content Init : " + this.closeModall);
}
ngAfterViewInit():void{
  console.log("ng on after Content Init : " + this.closeModall);

}

}
