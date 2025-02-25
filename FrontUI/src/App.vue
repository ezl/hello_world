<script>
import { ref, onMounted } from 'vue'
import { createName, getNames } from './api'
import NameForm from './components/NameForm.vue'
import NameHistory from './components/NameHistory.vue'

export default {
  name: 'App',
  components: { NameForm, NameHistory },
  data() {
    return {
      name: '',
      inputValue: '',
      storageKey: 'name-history',
      showHistory: false,
      history: [],
      isSubmitting: ref(false),
      errorMessage: ref(''),
    }
  },
  methods: {
    async handleSubmit() {
      this.isSubmitting = true
      this.errorMessage = ''
      const trimmedValue = this.inputValue.trim();

      if (trimmedValue) {
        this.name = trimmedValue;
        const localTimestamp = new Date().toISOString();

        try {
          const response = await createName(trimmedValue);
          this.updateLocalStorage(response);
          this.fetchNames();
          this.loadHistory();
        } catch (error) {
          this.errorMessage = 'Error adding name. Saving locally...';
          this.saveLocally(localTimestamp);
        } finally {
          this.resetForm();
        }
      } else {
        this.isSubmitting = false;
      }
    },
    updateLocalStorage(response) {
      const newEntry = { value: response.name, timestamp: response.createdAt };
      localStorage.setItem(`name-${response.id}`, JSON.stringify(newEntry));
    },
    saveLocally(localTimestamp) {
      localStorage.setItem(`name-local-${localTimestamp}`, JSON.stringify({ name: this.inputValue, createdAt: localTimestamp }));
    },
    resetForm() {
      this.isSubmitting = false;
      this.inputValue = '';
    },
    toggleHistory() {
      this.showHistory = !this.showHistory;
      if (this.showHistory) {
        this.loadHistory();
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
    },
    loadHistory() {
      this.history = JSON.parse(localStorage.getItem(this.storageKey) || '[]').slice(-10).reverse();
    },
    async fetchNames() {
      console.log('fetchNames')
      const remoteNames = await getNames();
      const history = remoteNames.map(name => ({ value: name.name, timestamp: name.createdAt }));
      localStorage.setItem(this.storageKey, JSON.stringify(history));
    },
    async clearHistory() {
      this.clearLocalHistory();
      await this.clearRemoteHistory();
    },
    clearLocalHistory() {
      localStorage.removeItem(this.storageKey);
      this.history = [];
    },
    async clearRemoteHistory() {
      try {
        await fetch('http://localhost:5001/api/names', { method: 'DELETE', headers: { 'Content-Type': 'application/json' } });
      } catch (error) {
        console.error('Failed to clear remote history:', error);
      }
    },
    async syncLocalToRemote() {
      const localHistory = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      for (const entry of localHistory) {
        const exists = this.history.some(name => name.value === entry.value);
        if (!exists) {
          try {
            await createName(entry.value);
          } catch (error) {
            console.error('Failed to sync local entry:', entry.value);
          }
        }
      }
    },
  },
  mounted() {
    this.fetchNames();
    this.loadHistory();
    this.syncLocalToRemote();
    const lastNameEntry = JSON.parse(localStorage.getItem(this.storageKey) || '[]').pop();
    if (lastNameEntry) this.name = lastNameEntry.value;
    document.title = "Hello, World.";
  },
}
</script>

<template>
  <div class="page">
    <div class="container">
      <h1>Hello, {{ name || 'World' }}.</h1>
      <NameForm @submit="handleSubmit" v-model="inputValue" :isSubmitting="isSubmitting" />
      <p v-if="errorMessage" style="color: red">{{ errorMessage }}</p>
    </div>
    <a href="#" @click.prevent="toggleHistory" class="history-link"> show history </a>
    <NameHistory v-if="showHistory" :history="history" :show="showHistory" @close="toggleHistory" @clear-history="clearHistory" />
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 0 2rem;
}

.container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 2rem;
}

.history-link {
  color: #666;
  text-decoration: underline;
  cursor: pointer;
  text-align: center;
  padding: 2rem 0;
  font-size: 0.9em;
  align-self: flex-start;
}

.history-link:hover {
  color: #333;
}

.blur {
  filter: blur(4px);
  pointer-events: none;
  user-select: none;
}
</style>
