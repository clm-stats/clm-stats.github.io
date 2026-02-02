export default function CLMStats() {
  fetch('/db/players.json').then(res => res.json()).then(console.log).catch(console.log)
  return (
    <div>
      CLM Stats Page
      <pre>my code</pre>
      xDD
    </div>
  );
}
