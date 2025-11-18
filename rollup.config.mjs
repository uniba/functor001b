import resolve from '@rollup/plugin-node-resolve';
import glslify from 'rollup-plugin-glslify';

export default {
  input: [
    'src/main.js',
    'src/landscape.js',
    'src/pa.js',
    'src/atmosphere.js',
    'src/pigeon-functor.js',
    'src/pigeon-receiver.js'
  ],
  output: {
    dir: 'public/assets/js/',
    preserveModules: true,
    preserveModulesRoot: 'src'
  },
  plugins: [glslify(), resolve()]
};