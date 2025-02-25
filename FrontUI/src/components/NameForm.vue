<template>
  <form class="input-group" @submit.prevent="submitName">
    <input v-model="inputValue" type="text" placeholder="Enter a name" required />
    <button type="submit" :disabled="isSubmitting || inputValue.trim() === ''">
      <span v-if="isSubmitting">
        <i class="fa fa-spinner fa-spin"></i>
      </span>
      <span v-else>Add Name</span>
    </button>
  </form>
</template>

<script>
export default {
  props: {
    modelValue: {
      type: String,
      required: true,
    },
    isSubmitting: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    inputValue: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      },
    },
  },
  methods: {
    submitName() {
      this.$emit('submit');
    },
  },
}
</script>

<style scoped>
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
</style> 