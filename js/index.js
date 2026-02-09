document.addEventListener('alpine:init', () => {
  Alpine.store('S', {
    init() {
      this.isLoading = true;
      fetch('/db/periods/9.json')
        .then(res => res.json())
        .then(period => { this.period = period; this.isLoading = false; })
        .catch(error => { this.error = error; });
    },
    isLoading: true,
    period: null,
    error: null,
  });
});
