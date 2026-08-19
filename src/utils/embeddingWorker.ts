import { pipeline, env } from '@xenova/transformers';

// Configurar entorno para correr localmente en el navegador
env.allowLocalModels = false;
env.useBrowserCache = true;

class PipelineSingleton {
  static task = 'feature-extraction' as const;
  static model = 'Xenova/all-MiniLM-L6-v2';
  static instance: any = null;

  static async getInstance(progress_callback?: (progress: any) => void) {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, { progress_callback });
    }
    return this.instance;
  }
}

self.addEventListener('message', async (event) => {
  const { type, payload } = event.data;

  if (type === 'init') {
    try {
      await PipelineSingleton.getInstance((x: any) => {
        self.postMessage({ type: 'progress', payload: x });
      });
      self.postMessage({ type: 'ready' });
    } catch (err: any) {
      self.postMessage({ type: 'error', payload: err.message });
    }
  } else if (type === 'embed') {
    try {
      const { word, id } = payload;
      const extractor = await PipelineSingleton.getInstance();
      const output = await extractor(word, { pooling: 'mean', normalize: true });
      
      const embedding = Array.from(output.data);
      
      self.postMessage({
        type: 'embedding',
        payload: { id, word, embedding }
      });
    } catch (err: any) {
      self.postMessage({ type: 'error', payload: err.message });
    }
  }
});
