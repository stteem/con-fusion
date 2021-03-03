import { Component, OnInit, ViewChild, Inject } from '@angular/core';

import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';

import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { switchMap } from 'rxjs/operators';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment } from '../shared/comment';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {

  dish: Dish;
  errMess: string;
  dishIds: string[];
  prev: string;
  next: string;
  commentForm: FormGroup;
  comment: Comment;
  dishCopy: Dish;


  @ViewChild('cform') commentFormDirective;

  formErrors = {
    'author': '',
    'comment': ''
  };
  
  validationMessages = {
    'author': {
      'required':      'Author name is required.',
      'minlength':     'Author name must be at least 2 characters long.',
      'maxlength':     'Author name cannot be more than 25 characters long.'
    },
    'comment': {
      'required':      'Comment is required.',
      'minlength':     'Comment must be at least 3 characters long.',
    }
  };

  constructor(
  	private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder,
    @Inject('BaseURL') private BaseURL
    ) { 
    	this.createForm();
    }

  ngOnInit() {
  	this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
    this.route.params.pipe(switchMap((params: Params) => this.dishservice.getDish(params['id'])))
    .subscribe(dish => { this.dish = dish; this.dishCopy = dish; this.setPrevNext(dish.id); },
    errmess => this.errMess = <any>errmess );
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void {
    this.location.back();
  }

  createForm(): void {
    this.commentForm = this.fb.group({
      author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)] ],
      rating: ['', Validators.minLength(2) ],
      comment: ['', [Validators.required, Validators.minLength(3)] ]
    });

    this.commentForm.valueChanges
    	.subscribe(data => this.onValueChanged(data));

	this.onValueChanged(); //reset form validation messages
  }

  onValueChanged(data?: any) {
  	if(!this.commentForm) { return; }
  	const form = this.commentForm;
  	for (const field in this.formErrors) {
  		if(this.formErrors.hasOwnProperty(field)) {
  			//clear previous error messages if any
  			this.formErrors[field] = '';
  			const control = form.get(field);
  			if(control && control.dirty && !control.valid) {
  				const messages = this.validationMessages[field];
  				for (const key in control.errors) {
  					if (control.errors.hasOwnProperty(key)) {
  						this.formErrors[field] += messages[key] + ' ';
  					}
  				}
  			}
  		}
  	}
  }

onSubmit() {
    this.comment = this.commentForm.value;
    this.comment.date = new Date().toISOString();
    console.log(this.comment);
    this.dishCopy.comments.push(this.comment);
    this.dishservice.putDish(this.dishCopy)
    	.subscribe(dish => {
    		this.dish = dish; this.dishCopy = dish;
    	},
    	errMess => { this.dish = null; this.dishCopy = null; this.errMess = <any>errMess; });
    this.commentFormDirective.resetForm();
    this.commentForm.reset({
    	author: '',
		rating: 5,
		comment: ''
    });
  }
}
