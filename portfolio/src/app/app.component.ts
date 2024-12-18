import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WipComponent } from './components/wip/wip.component';
import { NavComponent } from './components/nav/nav.component';
import { LandingComponent } from './components/landing/landing.component';
import { AboutmeComponent } from './components/aboutme/aboutme.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleHalfStroke } from '@fortawesome/free-solid-svg-icons';
import { ConnectComponent } from './components/connect/connect.component';
import { FireflyComponent } from './components/firefly/firefly.component';
import { ProjectcardComponent } from './components/projectcard/projectcard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    WipComponent,
    NavComponent,
    LandingComponent,
    AboutmeComponent,
    FontAwesomeModule,
    ConnectComponent,
    FireflyComponent,
    ProjectcardComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'nap-portfolio';
  faCircleHalfStroke=faCircleHalfStroke;
  toggleDarkMode = ():void => {
    document.documentElement.classList.toggle('dark');
  };
  
}
