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
      console.log('handleSubmit called');
      this.isSubmitting = true
      this.errorMessage = ''
      const trimmedValue = this.inputValue.trim();

      if (trimmedValue) {
        this.name = trimmedValue;
        try {
          const response = await createName(trimmedValue);
        } catch (error) {
          this.errorMessage = 'Error adding name. Saving locally...';
          this.saveLocally(localTimestamp);
        } finally {
          this.fetchNames();
          this.resetForm();
        }
      } else {
        this.isSubmitting = false;
      }
    },
    saveLocally(localTimestamp) {
      // only called if remote write fails
      console.log('saveLocally called');
      localStorage.setItem(`name-local-${localTimestamp}`, JSON.stringify({ name: this.inputValue, createdAt: localTimestamp }));
    },
    resetForm() {
      this.isSubmitting = false;
      this.inputValue = '';
    },
    toggleHistory() {
      console.log('toggleHistory called');
      this.showHistory = !this.showHistory;
      if (this.showHistory) {
        document.body.style.overflow = 'hidden';
        // why are we toggling overflow hidden to auto here?
      } else {
        document.body.style.overflow = 'auto';
      }
    },

    async fetchNames() {
      console.log('fetchNames called');
      const remoteNames = await getNames();
      const history = remoteNames.map(name => ({ value: name.name, timestamp: name.createdAt }));
      localStorage.setItem(this.storageKey, JSON.stringify(history));
      this.history = history;
      // this.history = JSON.parse(localStorage.getItem(this.storageKey) || '[]').slice(-10).reverse();
    },
    async clearHistory() {
      console.log('clearHistory called');
      this.clearLocalHistory();
      await this.clearRemoteHistory();
    },
    clearLocalHistory() {
      console.log('clearLocalHistory called');
      localStorage.removeItem(this.storageKey);
      this.history = [];
    },
    async clearRemoteHistory() {
      console.log('clearRemoteHistory called');
      try {
        // TODO:move this to api.js
        await fetch('http://localhost:5001/api/names', { method: 'DELETE', headers: { 'Content-Type': 'application/json' } });
      } catch (error) {
        console.error('Failed to clear remote history:', error);
      }
    },
    async syncLocalToRemote() {
      console.log('syncLocalToRemote called');
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
    console.log('mounted called');
    this.fetchNames();
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
    <a href="#" @click.prevent="toggleHistory" class="history-link"> show history ({{ history.length }})</a>
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
