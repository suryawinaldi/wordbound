import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// PENTING: jangan pernah menimpa innerHTML dari #app di sini.
// Melakukan itu memutus koneksi Vue ke DOM asli - setelah itu, navigasi
// berikutnya akan gagal di-render secara diam-diam (blank sampai di-refresh).
// Cukup log ke console supaya masih bisa didebug lewat devtools,
// dan biarkan Vue tetap memegang kendali penuh atas DOM.
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue error:', err, info)
}

app.use(createPinia())
app.use(router)

app.mount('#app')
