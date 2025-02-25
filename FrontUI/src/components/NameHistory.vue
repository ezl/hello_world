<template>
  <div v-if="show" class="modal-overlay" @click="close">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h2>Name History</h2>
        <button class="close-button" @click="close">&times;</button>
      </div>
      <div class="modal-content">
        <div v-for="(entry, index) in history" :key="index" class="history-item">
          <span>{{ entry.value }}</span>
          <span class="timestamp">{{ new Date(entry.timestamp).toLocaleString() }}</span>
        </div>
      </div>
      <div v-if="history.length > 0" class="modal-footer">
        <button @click="clearHistory" class="clear-history-button">Clear History</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    history: {
      type: Array,
      required: true,
    },
    show: {
      type: Boolean,
      required: true,
    },
  },
  methods: {
    close() {
      this.$emit('close');
    },
    clearHistory() {
      this.$emit('clear-history');
    },
  },
}
</script>

<style scoped>
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