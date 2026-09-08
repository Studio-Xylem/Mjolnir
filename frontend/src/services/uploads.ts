import { authAdapter } from './auth';
import { API_BASE_URL } from './api';

export function uploadImage(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> & { abort: () => void } {
  const xhr = new XMLHttpRequest();
  let isAborted = false;

  const promise = new Promise<string>(async (resolve, reject) => {
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const percentComplete = (event.loaded / event.total) * 100;
        onProgress(percentComplete);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          const fileUrl = response.url.startsWith('http')
            ? response.url
            : `${API_BASE_URL}${response.url}`;
          resolve(fileUrl);
        } catch (e) {
          reject(new Error('Invalid response from server'));
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed due to a network error'));
    });

    xhr.addEventListener('abort', () => {
      isAborted = true;
      reject(new Error('Upload aborted'));
    });

    xhr.open('POST', `${API_BASE_URL}/api/uploads`);

    try {
      const headers = await authAdapter.getHeaders();
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
    } catch (e) {
      reject(new Error('Failed to get auth headers'));
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    if (!isAborted) {
      xhr.send(formData);
    }
  });

  (promise as any).abort = () => {
    isAborted = true;
    xhr.abort();
  };

  return promise as Promise<string> & { abort: () => void };
}
