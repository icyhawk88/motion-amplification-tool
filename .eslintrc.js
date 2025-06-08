module.exports = {
  env: {
    browser: true,
    es2021: true,
    worker: true,
    serviceworker: true
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off', // Allow console for this type of app
    'prefer-const': 'error',
    'no-var': 'error',
    'arrow-spacing': 'error',
    'comma-dangle': ['error', 'only-multiline'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always']
  },
  globals: {
    THREE: 'readonly',
    WebGLRenderingContext: 'readonly',
    ImageData: 'readonly',
    OffscreenCanvas: 'readonly',
    MotionAmplifierPro: 'writable',
    WebGLProcessor: 'writable',
    EnhancedWebcamManager: 'writable',
    EnhancedROISelector: 'writable',
    EnhancedMotionAnalysisEngine: 'writable',
    EnhancedVideoExportManager: 'writable'
  }
};