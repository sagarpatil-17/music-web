import { Injectable } from '@angular/core';
import Swal, { SweetAlertOptions, SweetAlertResult } from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private readonly baseConfig: SweetAlertOptions = {
    background: '#151713',
    color: '#f5f5f5',
    confirmButtonColor: '#a3e635',
    buttonsStyling: true,
    customClass: {
      popup: 'fresh-swal-popup',
      title: 'fresh-swal-title',
      confirmButton: 'fresh-swal-confirm',
    },
  };

  success(
    title: string,
    message: string
  ): Promise<SweetAlertResult> {
    return Swal.fire({
      ...this.baseConfig,
      icon: 'success',
      title,
      text: message,
      iconColor: '#a3e635',
      confirmButtonText: 'Continue',
    });
  }

  error(
    title: string,
    message: string
  ): Promise<SweetAlertResult> {
    return Swal.fire({
      ...this.baseConfig,
      icon: 'error',
      title,
      text: message,
      confirmButtonText: 'Try again',
    });
  }

  warning(
    title: string,
    message: string
  ): Promise<SweetAlertResult> {
    return Swal.fire({
      ...this.baseConfig,
      icon: 'warning',
      title,
      text: message,
      confirmButtonText: 'Okay',
    });
  }

  info(
    title: string,
    message: string
  ): Promise<SweetAlertResult> {
    return Swal.fire({
      ...this.baseConfig,
      icon: 'info',
      title,
      text: message,
      confirmButtonText: 'Okay',
    });
  }
}