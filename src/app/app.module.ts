import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


// HttpClient module for RESTful API
import { HttpClientModule } from '@angular/common/http';
// Forms module
import { FormsModule } from '@angular/forms';
// Material Components
import { MaterialComponentsModule } from  './material-components.module'

import { LoginComponent } from './components/auth/login/login.component';
import { UsersHomeComponent } from './components/users/users-home/users-home.component'

//import { NgxMapLibreGLModule } from '@maplibre/ngx-maplibre-gl'

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    UsersHomeComponent, 
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    MaterialComponentsModule, 
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
