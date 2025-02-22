<script>
export default {
  name: 'App',
  data() {
    return {
      name: 'World',
      inputValue: ''
    }
  },
  methods: {
    updateName(e) {
      e.preventDefault()  // Prevent form from actually submitting
      if (this.inputValue) {
        this.name = this.inputValue
        this.inputValue = ''
      }
    }
  }
}
</script>

<template>
  <div class="container">
    <h1>Hello, {{ name }}.</h1>
    <form class="input-group" @submit="updateName">
      <input 
        v-model="inputValue"
        type="text"
        placeholder="Enter a name"
        required
      >
      <button 
        type="submit"
        :disabled="!inputValue"
      >
        Update
      </button>
    </form>
  </div>
</template>

<style scoped>
.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 2rem;
  padding: 0 2rem;
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

button {
  padding: 0.5rem 1rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
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
</style>
