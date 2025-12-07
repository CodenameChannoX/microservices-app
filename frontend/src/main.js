import { createApp } from 'vue'
import axios from 'axios'

const app = createApp({
  data() {
    return {
      services: []
    }
  },
  async mounted() {
    const serviceUrls = [
      { name: 'API Gateway', url: 'http://localhost:4000' },
      { name: 'User Service', url: 'http://localhost:4001' },
      { name: 'Product Service', url: 'http://localhost:4002' },
      { name: 'Order Service', url: 'http://localhost:4003' }
    ]
    
    for (const service of serviceUrls) {
      try {
        const response = await axios.get(service.url)
        this.services.push({
          name: service.name,
          status: 'running',
          port: response.data.port,
          message: response.data.message
        })
      } catch (error) {
        this.services.push({
          name: service.name,
          status: 'stopped',
          port: 'N/A',
          message: 'Service unavailable'
        })
      }
    }
  }
})

app.mount('#app')
