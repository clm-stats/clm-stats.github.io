export default function CLMStats() {
  fetch('/db/periods/9.json').then(res => res.json()).then(console.log).catch(console.log)
  return (
    <div>
      CLM Stats Page
      <pre>my code</pre>
      xDD
    </div>
  );
}
