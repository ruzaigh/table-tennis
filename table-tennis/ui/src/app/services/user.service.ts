import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
@Injectable({
    providedIn: 'root'
})

export class UserService {
    user?: IUser;

    private BASE_URL = environment.api;
    constructor(private http: HttpClient) {
    }
    // a service that allows a user to sign up
    signUp(userObject: any, code: string) {
        return this.http.post(`${this.BASE_URL}/user?code=${code}`, userObject);
    }
    setUserData(user: any) {
        this.user = user;
        localStorage.setItem("user", JSON.stringify(user));
        return user;
      }
}
export interface IUser {
    _id?: string;
    username: string;
    email: string;
    passwordHash?: string;
  
  }