import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import jwt_decode from 'jwt-decode';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private router: Router
  ) { }

  // getDecodedAccessToken(token: any): Observable<any> {
  //   try{
  //       return jwt_decode(token)["data"];
  //   }
  //   catch(Error){
  //       return null;
  //   }
  // }
  isAuthenticated() {
    const token = localStorage.getItem('token');
    // const decodedToken = this.getDecodedAccessToken(token);
    // if (decodedToken) {
    //   // Signed in.
    //   return true;
    // }
    // Not signed in.
    this.logout();
    return false;
  }

  logout() {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['login'])
  }
}
