import { pipeline, env } from "@huggingface/transformers";

// Optimized for 2026: Bypass local checks for direct Hugging Face caching
env.allowLocalModels = false;

let generator = null;

self.addEventListener('message', async (event) => {
    try {
        if (!generator) {
            // Llama 3.2 1B q4f16 is the fastest 2026 browser model
            generator = await pipeline('text-generation', 'onnx-community/Llama-3.2-1B-Instruct-q4f16', {
                device: 'webgpu', 
                dtype: 'q4f16', // Critical for speed
            });
        }

        const { text } = event.data;
        const result = await generator(text, { 
            max_new_tokens: 120, // Shortened for speed
            temperature: 0.6,
            do_sample: true
        });

        self.postMessage({ 
            status: 'complete', 
            output: result[0].generated_text 
        });
    } catch (error) {
        self.postMessage({ status: 'error', error: error.message });
    }
});