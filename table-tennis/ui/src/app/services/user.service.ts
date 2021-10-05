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
    signUp(userObject: any) {
        return this.http.post(`${this.BASE_URL}/user`, userObject);
    }
    setUserData(user: any) {
        this.user = user;
        localStorage.setItem("user", JSON.stringify(user));
        return user;
    }
    // a service that allows a user to login
    login(email: string, password: string) {
    return this.http.post(`${this.BASE_URL}/user/login`, { email, password });
    }
}
export interface IUser {
    _id?: string;
    username: string;
    email: string;
    passwordHash?: string;

}