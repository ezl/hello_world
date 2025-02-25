<script>
import { ref, onMounted } from 'vue'
import { createName, getNames } from './api'

export default {
  name: 'App',
  data() {
    return {
      name: '',
      inputValue: '',
      storageKey: 'name-history',
      showHistory: false,
      history: [],
      namesList: ref([]),
      isSubmitting: ref(false),
      errorMessage: ref(''),
    }
  },
  methods: {
    updateName(e) {
      console.log("update name")
      e.preventDefault() // Prevent form from actually submitting
      const trimmedValue = this.inputValue.trim()
      if (trimmedValue) {
        this.name = trimmedValue
        this.inputValue = ''

        // Save to history in localStorage
        const newEntry = {
          value: trimmedValue,
          timestamp: new Date().toISOString(),
        }

        // Get existing history or initialize empty array
        const history = JSON.parse(localStorage.getItem(this.storageKey) || '[]')

        // Add new entry and save back to localStorage
        history.push(newEntry)
        localStorage.setItem(this.storageKey, JSON.stringify(history))
      }
    },

    toggleHistory() {
      this.showHistory = !this.showHistory
      if (this.showHistory) {
        // Get existing history and limit to the last 10 entries
        this.history = JSON.parse(localStorage.getItem(this.storageKey) || '[]')
          .slice(-10) // Get the last 10 entries
          .reverse() // Reverse to show in chronological order
        document.body.style.overflow = 'hidden' // Prevent scrolling when modal is open
      } else {
        document.body.style.overflow = 'auto'
      }
    },

    async handleSubmit(e) {
      console.log("handleSubmit")
      e.preventDefault()
      this.isSubmitting = true
      this.errorMessage = '' // Reset error message

      const localTimestamp = new Date().toISOString() // Create a local timestamp
      this.name = this.inputValue
      
      try {
        if (this.inputValue) {
          console.log("try createname")
          const response = await createName(this.inputValue)
          // If successful, append to localStorage
          const newEntry = {
            value: response.name,
            timestamp: response.createdAt,
          }
          localStorage.setItem(
            `name-${response.id}`,
            JSON.stringify(newEntry),
          )
          this.fetchNames()
        }
      } catch (error) {
        this.errorMessage = 'Error adding name. Saving locally...'
        // Save to localStorage if there's an error
        localStorage.setItem(
          `name-local-${localTimestamp}`,
          JSON.stringify({ name: this.inputValue, createdAt: localTimestamp }),
        )
      } finally {
        this.isSubmitting = false // Reset submitting state
        this.inputValue = '' // Clear input field
      }
      
    },

    async fetchNames() {
      const remoteNames = await getNames();
      this.namesList = remoteNames;

      // Update localStorage with remote names
      const history = remoteNames.map(name => ({
        value: name.name,
        timestamp: name.createdAt,
      }));
      localStorage.setItem(this.storageKey, JSON.stringify(history));
    },

    async syncLocalToRemote() {
      const localHistory = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      for (const entry of localHistory) {
        // Check if the entry already exists in the remote database
        const exists = this.namesList.some(name => name.name === entry.value);
        if (!exists) {
          // Attempt to create the name in the remote database
          try {
            await createName(entry.value);
          } catch (error) {
            console.error('Failed to sync local entry:', entry.value);
          }
        }
      }
    },

    clearLocalHistory() {
      localStorage.removeItem(this.storageKey); // Clear local history
      this.history = []; // Clear the history array in the component
    },

    async clearRemoteHistory() {
      // Assuming you have an endpoint to delete all names
      try {
        await fetch('http://localhost:5001/api/names', {
          method: 'DELETE', // Use the appropriate method for your API
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Failed to clear remote history:', error);
      }
    },

    async clearHistory() {
      this.clearLocalHistory(); // Clear local history
      await this.clearRemoteHistory(); // Clear remote history
    },
  },
  mounted() {
    this.fetchNames()
    this.syncLocalToRemote()

    // Load the last name from localStorage if it exists
    const lastNameEntry = JSON.parse(localStorage.getItem(this.storageKey) || '[]').pop();
    if (lastNameEntry) {
      this.name = lastNameEntry.value; // Set the last name as the current name
    }

    // Set the page title
    document.title = "Hello, World.";
  },
}
</script>

<template>
  <div class="page" :class="{ blur: showHistory }">
    <div class="container">
      <h1>Hello, {{ name || 'World' }}.</h1>
      <form class="input-group" @submit="handleSubmit">
        <input v-model="inputValue" type="text" placeholder="Enter a name" required />
        <button type="submit" :disabled="isSubmitting || !inputValue">
          <span v-if="isSubmitting">
            <i class="fa fa-spinner fa-spin"></i>
          </span>
          <span v-else>Add Name</span>
        </button>
      </form>
      <p v-if="errorMessage" style="color: red">{{ errorMessage }}</p>
    </div>
    <a href="#" @click.prevent="toggleHistory" class="history-link"> show history </a>
  </div>

  <!-- Modal -->
  <div v-if="showHistory" class="modal-overlay" @click="toggleHistory">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h2>Name History</h2>
        <button class="close-button" @click="toggleHistory">&times;</button>
      </div>
      <div class="modal-content">
        <div v-for="(entry, index) in history" :key="index" class="history-item">
          <span>{{ entry.value }}</span>
          <span class="timestamp">{{ new Date(entry.timestamp).toLocaleString() }}</span>
        </div>
        <div class="modal-footer">
          <button @click="clearHistory" class="clear-history-button">Clear History</button>
        </div> 
      </div>
    </div>
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

.input-group {
  display: flex;
  gap: 1rem;
  min-width: 300px;
}

input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button[type='submit'] {
  padding: 0.5rem 1rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button[type='submit']:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

button[type='submit']:hover:not(:disabled) {
  background-color: #45a049;
}

header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}

a.history-link {
  color: #666;
  text-decoration: underline;
  cursor: pointer;
  text-align: center;
  padding: 2rem 0;
  font-size: 0.9em;
  align-self: flex-start;
  background: none;
}

a.history-link:hover {
  color: #333;
  background: none;
}

.history-list {
  margin-top: 1rem;
  width: 100%;
  max-width: 500px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.timestamp {
  color: #666;
  font-size: 0.9em;
}

.blur {
  filter: blur(4px);
  pointer-events: none;
  user-select: none;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  color: #666;
}

.close-button:hover {
  color: #000;
}

.modal-content {
  padding: 1rem;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.history-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.timestamp {
  color: #666;
  font-size: 0.9em;
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}

.clear-history-button {
  background: red; /* Updated background color */
  color: white; /* Updated text color */
  border: none;
  cursor: pointer;
  margin-left: 10px;
  padding: 0.5rem 1rem; /* Optional: Add some padding for better appearance */
  border-radius: 4px; /* Optional: Add border radius for rounded corners */
}

.clear-history-button:hover {
  background: darkred; /* Optional: Change background on hover */
}
</style>
