import 'babel-polyfill';
import jpegasm from 'jpeg-asm/dist/jpegasm';
import getEntriesByContentType from '../helpers/getEntriesByContentType';
import { onMessage, postMessage } from '../../../core/message/WorkerMessage';

onMessage(global, 'images', async(images, respond) => {
  async function fetchImage(image) {
    return new Promise((resolve, reject) => {
      // NOTE make the request from the content script to have cookies
      postMessage(global, 'fetch', { url: image, opts: { method: 'GET' } }, ({ body, error }) => {
        if (error) {
          reject('Failed');
          return;
        }

        resolve(new Uint8Array(body));
      });

      return;

      // NOTE: old way
      const xhr = new XMLHttpRequest();
      xhr.open('GET', image, true);
      xhr.responseType = 'arraybuffer';

      xhr.onload = function () {
        const arrayBuffer = xhr.response;

        if (arrayBuffer) {
          resolve(new Uint8Array(arrayBuffer));
        }
      };

      xhr.onreadystatechange = () => {
        if (xhr.readyState == XMLHttpRequest.DONE) {
          if (xhr.status !== 200) {
            reject(xhr.status);
          }
        }
      };

      xhr.send(null);
    });
  }

  async function setJPEGSavings(image) {
    let rawBuffer;
    const MAX_IMAGE_SIZE = 100 * 1024;

    try {
      rawBuffer = await fetchImage(image.name);
    } catch (e) {
      console.error('Network error: ' + image.name);
    }

    image.bigImage = image.decodedBodySize > MAX_IMAGE_SIZE || image.response.headers['content-length'] > MAX_IMAGE_SIZE;

    if (!rawBuffer || rawBuffer.length === 0) {
      console.error('Buffer empty: ' + image.name);
    } else {
      try {
        const { buffer, width, height } = jpegasm.decode(rawBuffer);
        const encoded90 = jpegasm.encode(buffer, width, height, 90);
        const encodedOrig = jpegasm.encode(buffer, width, height, 100);

        image.savings['90'] = 1 - encoded90.byteLength / encodedOrig.byteLength;

        if (process.env.NODE_ENV !== 'production') {
          console.log('original', URL.createObjectURL(new Blob([new Uint8Array(rawBuffer)], { type: 'image/jpeg' })));
          console.log('90%', URL.createObjectURL(new Blob([new Uint8Array(encoded90)], { type: 'image/jpeg' })));
          console.log('100%', URL.createObjectURL(new Blob([new Uint8Array(encodedOrig)], { type: 'image/jpeg' })));
        }
      } catch (e) {
        console.error(e.message + ':' + image.name);
      }
    }
  }

  images.forEach(image => image.savings = {});

  const jpegs = getEntriesByContentType(images, 'image/jpeg', 'image/jpg');

  await Promise.all(jpegs.map(jpeg => setJPEGSavings(jpeg)));

  respond(images);
});


