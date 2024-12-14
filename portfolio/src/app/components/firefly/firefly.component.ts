import { NgClass } from '@angular/common';
import { Component, Input, input, OnInit } from '@angular/core';

@Component({
  selector: 'app-firefly',
  standalone: true,
  imports: [NgClass],
  templateUrl: './firefly.component.html',
  styleUrl: './firefly.component.css'
})
export class FireflyComponent{

@Input() svgPath:string="";
@Input() fireFlyColor:string="";

}
