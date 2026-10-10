import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  standalone: true,
  selector: 'app-auth-brand',
  styleUrl: './auth-brand.scss',
  templateUrl: './auth-brand.html',
})
export class AuthBrand {
  @Input() mode: 'login' | 'register' = 'login';
}
