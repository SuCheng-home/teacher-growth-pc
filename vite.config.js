import { fileURLToPath, URL } from 'node:url'
import { existsSync } from 'node:fs'
import { defineConfig, loadEnv } from 'vite'
import vue2 from '@vitejs/plugin-vue2'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const envTarget = env.VITE_ENV_TARGET || mode
  const isBuild = command === 'build'

  // 内网私有包（auth-layout-zw 等）未安装时（如外网沙箱预览），自动改用 dev-stubs 下的本地替身
  const useAuthStubs = !isBuild && !existsSync(fileURLToPath(new URL('./node_modules/auth-layout-zw/package.json', import.meta.url)))
  const stub = file => fileURLToPath(new URL(`./dev-stubs/${file}`, import.meta.url))
  const authStubAliases = useAuthStubs
    ? [
        { find: /^auth-layout-zw$/, replacement: stub('auth-layout-zw.js') },
        { find: /^auth-layout-components\/.*\.css$/, replacement: stub('empty.css') },
        { find: /^auth-zw-components\/vue\/FileUploader$/, replacement: stub('FileUploader.js') },
        { find: /^auth-zw-components\/vue\/RichTextEditor$/, replacement: stub('RichTextEditor.js') }
      ]
    : []
  const privateDeps = ['auth-layout-zw', 'auth-layout-components', 'auth-zw-components', 'cos-js-sdk-v5', 'vod-js-sdk-v6', 'spark-md5', 'compressorjs', 'js-md5']

  return {
    base: isBuild ? '/thDevelopment/' : '/',

    plugins: [
      vue2(),
      // auth-layout-zw 依赖 node-rsa，需要浏览器端 Buffer/process/crypto 等 Node 内置模块垫片
      nodePolyfills({
        globals: {
          Buffer: true,
          global: true,
          process: true
        }
      })
    ],

    resolve: {
      alias: [
        ...authStubAliases,
        { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
        { find: /^vue$/, replacement: 'vue/dist/vue.esm.js' }
      ],
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },

    // AI 助手数字人素材（.pag 二进制动画）作为静态资源产出 URL，由 libpag 在 canvas 上播放
    assetsInclude: ['**/*.pag'],

    define: {
      'process.env': {
        NODE_ENV: JSON.stringify(isBuild ? 'production' : 'development'),
        ENV_TAREGT: JSON.stringify(envTarget)
      },
      global: 'globalThis'
    },

    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern',
          // element-ui theme-chalk 源码在新版 dart-sass 下会产生数百条弃用警告：
          // quietDeps 静音 node_modules 内的告警，silenceDeprecations 覆盖项目自身文件的已知弃用项
          // （mixed-decls 已从 dart-sass 回退，列入会反复报 obsolete 警告，不可写在这里）
          quietDeps: true,
          silenceDeprecations: ['import', 'function-units', 'global-builtin', 'slash-div', 'abs-percent', 'bogus-combinators']
        }
      }
    },

    server: {
      port: 8080,
      open: false,
      // v0 预览沙箱域名
      allowedHosts: ['workspace-sfrw6gav-a3c0535a7ce7e9bd.v0.build']
    },

    build: {
      // 编译产物目录与 base 前缀（/thDevelopment/）保持一致，部署时整目录上传
      outDir: 'thDevelopment',
      assetsDir: 'static',
      sourcemap: false,
      // cos-js-sdk-v5 / vod-js-sdk-v6 传递依赖含 BigInt 字面量，es2018 无法降级会构建报错，提升至 es2020
      target: ['es2020', 'chrome87', 'edge88', 'firefox78', 'safari14'],
      cssCodeSplit: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: false,
          drop_debugger: true
        }
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vue: ['vue', 'vue-router', 'vuex'],
            elementUI: ['element-ui'],
            vendor: ['axios', 'lodash', 'js-cookie']
          }
        }
      }
    },

    optimizeDeps: {
      include: [
        'vue', 'vue-router', 'vuex',
        'element-ui', 'axios', 'lodash', 'js-cookie',
        // auth-layout-zw 及其 UI 组件 peer 依赖 auth-layout-components：
        // 二者含 CJS 传递依赖（crypto-js / node-rsa / jsencrypt 等），
        // 显式预构建以保证 Vite 下 CJS→ESM interop 稳定
        'auth-layout-zw', 'auth-layout-components',
        // auth-zw-components（FileUploader 上传引擎）同理：其 ESM 产物静态引入
        // cos-js-sdk-v5 / vod-js-sdk-v6 等 CJS 包，不预构建会报 "does not provide an export named 'default'"，
        // 导致懒加载路由组件解析失败、页面跳转卡死
        'auth-zw-components', 'cos-js-sdk-v5', 'vod-js-sdk-v6', 'spark-md5', 'compressorjs', 'js-md5'
      ].filter(dep => !useAuthStubs || !privateDeps.includes(dep))
    }
  }
})
