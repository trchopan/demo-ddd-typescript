import {format} from 'date-fns'
import {App, Plugin} from 'vue'

const dateFns = {
  format: format,
  defaultFormat: (d: Date) => format(d, 'yyyy-MM-dd HH:mm'),
}

declare module '@vue/runtime-core' {
  //Bind to `this` keyword
  interface ComponentCustomProperties {
    $dateFns: typeof dateFns
  }
}

export const dateFnsPlugin: Plugin = {
  install: (app: App) => {
    app.config.globalProperties.$dateFns = dateFns
  },
}
