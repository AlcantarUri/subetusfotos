// google-drive.service.ts
import { Injectable } from '@angular/core';
import { loadGapiInsideDOM, gapi } from 'gapi-script';

@Injectable({
  providedIn: 'root'
})
export class GoogleDriveService {
  private clientId = '594596577915-7ui1rc94iej1ukn361cm0n8q2g2d1130.apps.googleusercontent.com';
  private apiKey = 'AIzaSyDH91FeouhR__NR1_7akalPhHB-JiNOC1k';
  private scope = 'https://www.googleapis.com/auth/drive.file';
  // Promise que indica si `gapi` ha sido inicializado
  private gapiInitPromise: Promise<void>;

  constructor() {
    this.gapiInitPromise = this.initClient(); // Inicia la carga de `gapi`
  }

  private async initClient() {
    await loadGapiInsideDOM(); // Carga `gapi` en el DOM
    return new Promise<void>((resolve, reject) => {
      gapi.load('client:auth2', async () => {
        try {
          await gapi.client.init({
            apiKey: this.apiKey,
            clientId: this.clientId,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
            scope: this.scope,
          });
          resolve();
        } catch (error) {
          console.error('Error al inicializar `gapi`:', error);
          reject(error);
        }
      });
    });
  }

  private async ensureGapiInitialized() {
    // Espera a que `gapi` esté completamente inicializado
    await this.gapiInitPromise;
  }

  async signIn() {
    await this.ensureGapiInitialized();
    return gapi.auth2.getAuthInstance().signIn();
  }

  async signOut() {
    await this.ensureGapiInitialized();
    return gapi.auth2.getAuthInstance().signOut();
  }

  async isSignedIn() {
    await this.ensureGapiInitialized();
    return gapi.auth2.getAuthInstance().isSignedIn.get();
  }

  async uploadFile(file: File, folderId: string) {
    await this.ensureGapiInitialized();

    const fileMetadata = {
      name: file.name,
      parents: [folderId],
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
    form.append('file', file);

    return gapi.client.request({
      path: '/upload/drive/v3/files?uploadType=multipart',
      method: 'POST',
      body: form,
    });
  }

  async listFiles(folderId: string) {
    await this.ensureGapiInitialized();
    return gapi.client.drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/'`,
      fields: 'files(id, name, thumbnailLink)',
    });
  }
}