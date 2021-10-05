import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email: any;
  password: any;
  showPassword: boolean = false;
  formBuilder: any;
  constructor(
    private Auth: AuthService,
    private router: Router,
    private userService: UserService,
  ) { 
  }

  ngOnInit() {
  }
  // sign a user up inorder to be able to start using our system
  async login(){
        //@TODO loader create a loader
        // let loader = this.loadingCtrl.create({
        //   spinner: 'bubbles',
        //   animated: true,
        //   cssClass: 'login-loader',
        // });
        //make call
        this.userService.login(this.email.toLowerCase(), this.password)
        .subscribe(async ( response: any)=>{
        //if response successful then generate auth token for user validation and session management
        if(response.MESSAGE === 'SUCCESS'){
         // (await loader).dismiss();

         //store token for httpInterceptor
         localStorage.setItem("token", response.DATA.user);
         //log user in and redirect them to the correct page
         // const tokenData = this.authService.getDecodedAccessToken(response.DATA);
         this.userService.setUserData(response.DATA.user);
         this.router.navigate(['/home']);
        }else if(response.MESSAGE === 'User not found'){
          // @TODO add loader dismiss and alert function and remove all console.logs in future
        //   (await loader).dismiss();
        //   let alert = this.alertCtrl.create({
        //     message: 'The supplied email address or password is incorrect, Please try again.',
        //     buttons: ['OK']
        //   });
        //   (await alert).present();
        // }
        console.log("'The supplied email address or password is incorrect, Please try again.")
        }    
        }, async error =>{
          console.log(error)
          // @TODO add utils and show Toast
        // (await loader).dismiss();
        // this.utils.log(error);
        // this.utils.showToast('An error occurred, please try again.')
        });
  }
  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
