import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { fa, en } from 'vuetify/locale'

export const vuetify = createVuetify({
  components,
  directives,

  locale: {
    locale: 'fa',
    fallback: 'en',
    messages: { fa, en },
  },

  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
})
