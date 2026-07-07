import basicSsl from '@vitejs/plugin-basic-ssl'

export default {
  plugins: [
    basicSsl()
  ],
  server: {
    https: false, // Yeh HTTPS enable kar dega
    port: 5173
  }
}

