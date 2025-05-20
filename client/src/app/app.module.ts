import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common'; 
import { RouterModule } from '@angular/router'; 
import { FormsModule } from '@angular/forms'; // For template-driven forms
import { HttpClient } from '@angular/common/http'; // For HTTP requests
// Components
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoaderComponent } from './components/loader/loader.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,    
    FooterComponent,    
    LoaderComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,       // Required for *ngIf, *ngFor etc.
    RouterModule,       // Required for <router-outlet>
    // AppRoutingModule (if you have it) 
    FormsModule,       // Required for template-driven forms
    HttpClient,        // Required for HTTP requests
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }