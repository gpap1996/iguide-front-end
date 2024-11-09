// import { markRaw } from 'vue'
import { VuetifyTiptap, VuetifyViewer, createVuetifyProTipTap } from 'vuetify-pro-tiptap'

import 'vuetify-pro-tiptap/style.css'
import {
  BaseKit,
  Bold,
  Italic,
  Underline,
  Strike,
  Color,
  Highlight,
  Heading,
  Link,
  Image,
  History,
  BulletList,
  OrderedList,
  TaskList,
  Blockquote,
  HorizontalRule,
  FontSize,
} from 'vuetify-pro-tiptap'

// import SelectImage from '@/components/SelectImage.vue'

export const vuetifyProTipTap = createVuetifyProTipTap({
  // Set default lang
  lang: 'en',
  // Set markdown theme
  markdownTheme: 'github',
  // Global registration app.component
  components: {
    VuetifyTiptap,
    VuetifyViewer,
  },
  // Global registration extensions
  extensions: [
    BaseKit.configure({
      placeholder: {
        title: 'Description',
      },
    }),
    FontSize,
    Bold,
    Italic,
    Underline,
    Strike,
    Color,
    Highlight,
    Heading,
    Link,
    Image.configure({
      // Generate a VDivider after the button
      divider: true,
      // Custom image tabs
      //   imageTabs: [{ name: 'SELECT', component: markRaw(SelectImage) }],
      // hidden default tab
      hiddenTabs: ['upload'],
      // custom upload function
      upload(file) {
        const url = URL.createObjectURL(file)
        console.log('mock upload api :>> ', url)
        return Promise.resolve(url)
      },
    }),
    BulletList,
    OrderedList,
    TaskList,
    Blockquote,
    HorizontalRule,
    History,
  ],
})
