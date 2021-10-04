
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { tap } from 'rxjs/operators';
import { UserService } from 'src/app/services/user.service';
@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {
  //for signing up
  signUpForm: FormGroup;
  // hide and show password
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  //onInit
  maxDate: any;
  code: any;
  //validate
  errors: any[] = [];
  constructor(
    private formBuilder: FormBuilder,
    private router: ActivatedRoute,
    private userService: UserService,
    private route: Router
  ) {
    this.signUpForm = this.formBuilder.group({
      email: new FormControl('', [Validators.maxLength(50), Validators.minLength(3), Validators.required]),
      name: new FormControl('', [Validators.maxLength(50), Validators.minLength(2), Validators.required]),
      username: new FormControl('', [Validators.maxLength(16), Validators.minLength(3), Validators.required]),
      password: new FormControl('', [Validators.maxLength(14), Validators.minLength(10), Validators.required]),
      confirmPassword: new FormControl('', [Validators.required])
    },
      {
        validator: this.validatePasswords
      })
  }

  ngOnInit() {
    // what does this function do?
    let details: any
    this.router.queryParams.pipe(
      tap(x => { params: console.log(x) })
    )
      .subscribe(params => {
        const { email, name, username, code } = params;
        this.code = code;
        details = { email, name, username };
      });
    if (details) {
      this.signUpForm.patchValue({
        email: details.email,
        name: details.name,
        username: details.username
      });
    }
    let date = new Date();
    this.maxDate = moment(date).format('YYYY-MM-DD');
  }
  validateForm() {
    this.errors = [];
    if (!this.signUpForm.value.name) this.errors.push('Please enter your full name');
    if (!this.signUpForm.value.username) this.errors.push('Please enter your full name');
    if (!this.signUpForm.value.email || this.signUpForm.controls.email.invalid) this.errors.push('Please enter a valid email address');
    if (!this.signUpForm.value.password) this.errors.push('Please enter a password');
    if (this.signUpForm.controls['password'].hasError('minlength') && this.signUpForm.controls['password'].touched) this.errors.push('Mininum password length must be 12 characters, your private key and crypto assets should be well protected!');
    if (!this.signUpForm.value.confirmPassword) this.errors.push('Please enter a confirmation password');
    if (!this.signUpForm.controls['confirmPassword'].errors && this.signUpForm.hasError('pw_mismatch') && (this.signUpForm.controls['confirmPassword'].dirty || this.signUpForm.controls['confirmPassword'].touched)) this.errors.push('Passwords do not match!');
    return this.errors;
  }
  signUp() {
    this.validateForm();
    if (this.errors && this.errors.length > 0) {
      return;
    } else {
      this.errors = [];
      // create your own loader function
      // this.helpers.showLoader();
      this.userService.signUp(this.signUpForm.value, this.code)
        .subscribe(async (response: any) => {
          // get token and set it locally
          localStorage.setItem("token", response.DATA.token);
          // if response successful then automatically login user in
          // create your own loader function
          // this.helpers.dismissLoader();

          // save user details on local storage for easy retrieval
          if (response.STATUS === 'FAILURE'){
            // create a toast like utils
            // this.utils.showToast(response.MESSAGE, 'warning');
            // create your own loader function
            // this.helpers.dismissLoader();
            console.log(response.MESSAGE, 'warning');
            return;
          }else{
            this.userService.setUserData(response.DATA.user);
            this.navigateToHome();
          }
        }, (error: any)=>{
          console.log(error)
        })
    }
  }
  stripBadCharsFromUsername() {
    let username: string = this.signUpForm.controls['username'].value;
    let fullname: string = this.signUpForm.controls['name'].value;
    this.signUpForm.controls['username'].setValue(username.replace(/([^a-zA-Z0-9._#$!~-])/g, ''));
    this.signUpForm.controls['name'].setValue(fullname.replace(/([^a-zA-Z0-9._#$!~-])/g, ''));
  }
  togglePassword() {
    this.showPassword = !this.showPassword
  }
  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword
  }
    // navigates the user to the desired page
    navigateToHome() {
      this.route.navigate(["/home"]);
    }
  // Validates password and confirmation password
  validatePasswords(formGroup: FormGroup) {
    const { value: password } = formGroup.controls["password"];
    const { value: confirmPassword } = formGroup.controls["confirmPassword"];
    return password === confirmPassword ? null : { pw_mismatch: true };
  }
}
