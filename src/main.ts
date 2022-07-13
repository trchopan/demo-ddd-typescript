import {createApp} from 'vue'
import App from './App.vue'
import './index.css'
import {i18nPlugin} from './plugins/i18n'
import {dateFnsPlugin} from './plugins/dateFns'
import {createPinia} from 'pinia'
import {router} from './router'

const app = createApp(App)
app.use(createPinia())
app.use(i18nPlugin)
app.use(dateFnsPlugin)
app.use(router)
app.mount('#app')
