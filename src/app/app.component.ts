import { RouterOutlet } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { GoogleDriveService } from '../services/drive.service';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'subetusfotos';
  photos: any[] = [];
  folderId = '1QvMXts6IwHxWhakVs8fxHAADkExRnXxV';
 selectedFiles: File[] = [];

  constructor(private driveService: GoogleDriveService, private http: HttpClient) {}

  async ngOnInit() {
    if (!this.driveService.isSignedIn()) {
      await this.driveService.signIn();
    }
    this.loadPhotos();
  }

  async loadPhotos() {
    const response = await this.driveService.listFiles(this.folderId);
    this.photos = response.result.files;
  }

  async uploadPhoto(event: any) {
    const file = event.target.files[0];
    if (file) {
      debugger
      await this.driveService.uploadFile(file, this.folderId);
      this.loadPhotos(); // Refresh gallery
    }
  }

  signOut() {
    this.driveService.signOut();
  }

  singIn() {
    this.driveService.signIn();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFiles = Array.from(input.files);  // Almacena todos los archivos seleccionados
    }
  }

  uploadPhoto2() {
    if (this.selectedFiles.length === 0) return;

    // Itera sobre los archivos seleccionados y los envía uno por uno
    for (const file of this.selectedFiles) {
      const formData = new FormData();
      formData.append('file', file, file.name);

      this.http.post('http://localhost:3000/upload', formData)
        .subscribe({
          next: (response) => console.log('Foto subida exitosamente:', response),
          error: (error) => console.error('Error al subir la foto:', error)
        });
    }

    this.loadPhotos();  // Refresca la galería
  }
  
}
