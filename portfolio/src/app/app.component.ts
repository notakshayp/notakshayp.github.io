import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WipComponent } from './components/wip/wip.component';
import { NavComponent } from './components/nav/nav.component';
import { LandingComponent } from './components/landing/landing.component';
import { AboutmeComponent } from './components/aboutme/aboutme.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleHalfStroke } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,WipComponent,NavComponent, LandingComponent,AboutmeComponent,FontAwesomeModule],
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
